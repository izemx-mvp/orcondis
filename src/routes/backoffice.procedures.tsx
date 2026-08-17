import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useOps, useOpsLookups } from "@/lib/bo/ops-store";
import {
  oid,
  horodatage,
  todayIso,
  toneProcedure,
  prochainNumeroProcedure,
  nomClient,
  TYPES_PROCEDURE,
  STATUTS_PROCEDURE,
  RESPONSABLES_BO,
  MODELE_PROCEDURE_PROVISOIRE,
  type ProcedureOps,
  type EtapeProcedure,
} from "@/lib/bo/ops-data";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  StatCard,
  Panel,
  SearchInput,
  SelectFilter,
  FilterBar,
  DataTable,
  Statut,
  tonStatut,
  Champ,
  ChampSelect,
  ChampTexte,
  FormDialog,
  Grille,
  Onglets,
  Historique,
  Detail,
  useDialog,
  type Colonne,
} from "@/components/bo/kit";

export const Route = createFileRoute("/backoffice/procedures")({
  head: () => ({
    meta: [
      { title: "Procédures — Back-Office ARCONDIS" },
      { name: "description", content: "Suivi des procédures ARCONDIS : étapes, échéances, documents et validation." },
    ],
  }),
  component: ProceduresPage,
});

function etapesVides(): EtapeProcedure[] {
  return MODELE_PROCEDURE_PROVISOIRE.map((libelle) => ({
    id: oid("etp"),
    libelle,
    statut: "À faire",
    responsable: "",
    date: "",
    commentaire: "",
  }));
}

function procedureVide(numero: string): ProcedureOps {
  return {
    id: oid("prc"),
    numero,
    type: TYPES_PROCEDURE[0],
    clientId: "",
    dossierId: "",
    courseId: "",
    responsable: RESPONSABLES_BO[0] ?? "",
    coursierId: "",
    date: todayIso(),
    statut: "Nouvelle",
    etapes: etapesVides(),
    documents: [],
    notesInternes: [],
    notes: "",
    historique: [{ id: oid("ev"), date: horodatage(), auteur: "Back-Office", action: "Procédure créée" }],
    archive: false,
  };
}

function ProceduresPage() {
  const { data, ajouter, modifier, archiver, ajouterNote } = useOps();
  const l = useOpsLookups();

  const [recherche, setRecherche] = useState("");
  const [statut, setStatut] = useState("");
  const [type, setType] = useState("");
  const [responsable, setResponsable] = useState("");
  const [client, setClient] = useState("");
  const [voirArchives, setVoirArchives] = useState(false);

  const nouveauDialog = useDialog<null>();
  const editDialog = useDialog<ProcedureOps>();
  const detailDialog = useDialog<ProcedureOps>();
  const [ongletDetail, setOngletDetail] = useState("Étapes");
  const [note, setNote] = useState("");

  const [form, setForm] = useState<ProcedureOps>(() => procedureVide(prochainNumeroProcedure(data.procedures)));

  const procedures = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    return data.procedures.filter((p) => {
      if (p.archive !== voirArchives) return false;
      if (statut && p.statut !== statut) return false;
      if (type && p.type !== type) return false;
      if (responsable && p.responsable !== responsable) return false;
      if (client && p.clientId !== client) return false;
      if (terme) {
        const hay = `${p.numero} ${l.clientNom(p.clientId)} ${p.type}`.toLowerCase();
        if (!hay.includes(terme)) return false;
      }
      return true;
    });
  }, [data.procedures, recherche, statut, type, responsable, client, voirArchives, l]);

  const stats = useMemo(() => {
    const actives = data.procedures.filter((p) => !p.archive);
    return {
      total: actives.length,
      enCours: actives.filter((p) => p.statut === "En cours").length,
      enAttente: actives.filter((p) => p.statut === "En attente").length,
      terminees: actives.filter((p) => p.statut === "Terminée").length,
    };
  }, [data.procedures]);

  const progression = (p: ProcedureOps) => {
    const validees = p.etapes.filter((e) => e.statut === "Validée").length;
    return p.etapes.length ? Math.round((validees / p.etapes.length) * 100) : 0;
  };

  const ouvrirCreation = () => {
    setForm(procedureVide(prochainNumeroProcedure(data.procedures)));
    nouveauDialog.ouvrir(null);
  };
  const soumettreCreation = () => {
    if (!form.type || !form.clientId) return;
    ajouter("procedures", form);
  };
  const ouvrirEdition = (p: ProcedureOps) => {
    setForm(p);
    editDialog.ouvrir(p);
  };
  const soumettreEdition = () => {
    if (!editDialog.item) return;
    modifier("procedures", editDialog.item.id, form, "Procédure modifiée");
  };
  const ouvrirDetail = (p: ProcedureOps) => {
    setOngletDetail("Étapes");
    detailDialog.ouvrir(p);
  };

  const avancerEtape = (p: ProcedureOps, etapeId: string) => {
    const ordre: EtapeProcedure["statut"][] = ["À faire", "En cours", "Validée"];
    const etapes = p.etapes.map((e) => {
      if (e.id !== etapeId) return e;
      const idx = ordre.indexOf(e.statut);
      const suivant = ordre[Math.min(idx + 1, ordre.length - 1)] ?? "Validée";
      return { ...e, statut: suivant, date: suivant === "Validée" ? todayIso() : e.date };
    });
    const toutesValidees = etapes.every((e) => e.statut === "Validée");
    modifier(
      "procedures",
      p.id,
      { etapes, statut: toutesValidees ? "Terminée" : p.statut === "Nouvelle" ? "En cours" : p.statut },
      "Étape de procédure avancée",
    );
    detailDialog.ouvrir({ ...p, etapes, statut: toutesValidees ? "Terminée" : p.statut });
  };

  const colonnes: Colonne<ProcedureOps>[] = [
    { cle: "numero", titre: "N°", rendu: (p) => <span className="font-medium text-navy">{p.numero}</span> },
    { cle: "type", titre: "Type", rendu: (p) => p.type },
    { cle: "client", titre: "Client", rendu: (p) => l.clientNom(p.clientId) },
    { cle: "responsable", titre: "Responsable", rendu: (p) => p.responsable },
    { cle: "progression", titre: "Progression", rendu: (p) => `${progression(p)}%` },
    { cle: "statut", titre: "Statut", rendu: (p) => <Statut ton={toneProcedure(p.statut)}>{p.statut}</Statut> },
    {
      cle: "actions",
      titre: "Actions",
      align: "right",
      rendu: (p) => (
        <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" onClick={() => ouvrirDetail(p)}>Voir</Button>
          <Button size="sm" variant="ghost" onClick={() => ouvrirEdition(p)}>Modifier</Button>
          <Button size="sm" variant="ghost" onClick={() => archiver("procedures", p.id, !p.archive)}>
            {p.archive ? "Restaurer" : "Archiver"}
          </Button>
        </div>
      ),
    },
  ];

  const champsFormulaire = (
    <>
      <Grille>
        <ChampSelect
          label="Client"
          value={form.clientId}
          onChange={(v) => setForm({ ...form, clientId: v })}
          options={data.clients.filter((c) => !c.archive).map((c) => ({ value: c.id, label: nomClient(c) }))}
        />
        <ChampSelect
          label="Dossier lié"
          value={form.dossierId}
          onChange={(v) => setForm({ ...form, dossierId: v })}
          options={data.dossiers.filter((d) => d.clientId === form.clientId).map((d) => ({ value: d.id, label: d.numero }))}
        />
      </Grille>
      <Grille cols={3}>
        <ChampSelect label="Type de procédure" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={TYPES_PROCEDURE} />
        <ChampSelect label="Responsable" value={form.responsable} onChange={(v) => setForm({ ...form, responsable: v })} options={RESPONSABLES_BO} />
        <Champ label="Date" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
      </Grille>
      <ChampSelect label="Statut" value={form.statut} onChange={(v) => setForm({ ...form, statut: v as ProcedureOps["statut"] })} options={STATUTS_PROCEDURE} />
      <ChampTexte label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
    </>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        titre="Procédures"
        sous="Étapes, échéances et validation des procédures administratives."
        actions={<Button size="sm" onClick={ouvrirCreation}>Nouvelle procédure</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Procédures actives" valeur={stats.total} />
        <StatCard label="En cours" valeur={stats.enCours} />
        <StatCard label="En attente" valeur={stats.enAttente} ton="alerte" />
        <StatCard label="Terminées" valeur={stats.terminees} ton="positif" />
      </div>

      <Panel
        titre="Liste des procédures"
        actions={
          <Button size="sm" variant="outline" onClick={() => setVoirArchives((v) => !v)}>
            {voirArchives ? "Voir actives" : "Voir archivées"}
          </Button>
        }
      >
        <div className="mb-3 space-y-2">
          <FilterBar>
            <SearchInput value={recherche} onChange={setRecherche} placeholder="N°, client, type…" />
            <SelectFilter label="Statut" value={statut} onChange={setStatut} options={STATUTS_PROCEDURE} />
            <SelectFilter label="Type" value={type} onChange={setType} options={TYPES_PROCEDURE} />
            <SelectFilter label="Responsable" value={responsable} onChange={setResponsable} options={RESPONSABLES_BO} />
          </FilterBar>
        </div>
        <DataTable colonnes={colonnes} lignes={procedures} onRowClick={ouvrirDetail} vide="Aucune procédure trouvée." />
      </Panel>

      <FormDialog open={nouveauDialog.open} onOpenChange={nouveauDialog.setOpen} titre="Nouvelle procédure" onSubmit={soumettreCreation} large>
        <p className="text-xs text-muted-foreground">Numéro : <span className="font-medium text-navy">{form.numero}</span></p>
        {champsFormulaire}
      </FormDialog>

      <FormDialog open={editDialog.open} onOpenChange={editDialog.setOpen} titre={`Modifier ${editDialog.item?.numero ?? ""}`} onSubmit={soumettreEdition} large>
        {champsFormulaire}
      </FormDialog>

      <FormDialog
        open={detailDialog.open}
        onOpenChange={detailDialog.setOpen}
        titre={`Procédure ${detailDialog.item?.numero ?? ""}`}
        description={detailDialog.item ? l.clientNom(detailDialog.item.clientId) : ""}
        large
      >
        {detailDialog.item && (
          <div className="space-y-4">
            <Onglets items={["Étapes", "Informations", "Documents", "Notes", "Historique"]} actif={ongletDetail} onChange={setOngletDetail} />
            {ongletDetail === "Étapes" && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Progression : {progression(detailDialog.item)}%</p>
                <ul className="space-y-2">
                  {detailDialog.item.etapes.map((e) => (
                    <li key={e.id} className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm">
                      <span className="flex items-center gap-2">
                        <input type="checkbox" checked={e.statut === "Validée"} readOnly className="h-4 w-4" />
                        {e.libelle}
                      </span>
                      <span className="flex items-center gap-2">
                        <Statut ton={tonStatut(e.statut)}>{e.statut}</Statut>
                        {e.statut !== "Validée" && (
                          <Button size="sm" variant="outline" onClick={() => avancerEtape(detailDialog.item as ProcedureOps, e.id)}>
                            Avancer
                          </Button>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!detailDialog.item) return;
                      modifier("procedures", detailDialog.item.id, { statut: "Terminée" }, "Procédure terminée");
                      detailDialog.ouvrir({ ...detailDialog.item, statut: "Terminée" });
                    }}
                  >
                    Terminer la procédure
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!detailDialog.item) return;
                      modifier("procedures", detailDialog.item.id, { statut: "Annulée" }, "Procédure annulée");
                      detailDialog.ouvrir({ ...detailDialog.item, statut: "Annulée" });
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
            {ongletDetail === "Informations" && (
              <Grille>
                <Detail label="Client">{l.clientNom(detailDialog.item.clientId)}</Detail>
                <Detail label="Dossier">{detailDialog.item.dossierId ? l.dossierNom(detailDialog.item.dossierId) : "—"}</Detail>
                <Detail label="Course liée">{detailDialog.item.courseId ? l.courseNom(detailDialog.item.courseId) : "—"}</Detail>
                <Detail label="Responsable">{detailDialog.item.responsable}</Detail>
                <Detail label="Coursier">{detailDialog.item.coursierId ? l.coursierNom(detailDialog.item.coursierId) : "—"}</Detail>
                <Detail label="Statut"><Statut ton={toneProcedure(detailDialog.item.statut)}>{detailDialog.item.statut}</Statut></Detail>
                <Detail label="Date">{detailDialog.item.date}</Detail>
                <div className="sm:col-span-2"><Detail label="Notes">{detailDialog.item.notes}</Detail></div>
              </Grille>
            )}
            {ongletDetail === "Documents" && (
              <ul className="space-y-2">
                {detailDialog.item.documents.map((doc) => (
                  <li key={doc.id} className="rounded-md border border-border px-3 py-2 text-sm">{doc.nom} · {doc.type} · {doc.date}</li>
                ))}
                {detailDialog.item.documents.length === 0 && <p className="text-sm text-muted-foreground">Aucun document.</p>}
              </ul>
            )}
            {ongletDetail === "Notes" && (
              <div className="space-y-3">
                <ul className="space-y-2">
                  {detailDialog.item.notesInternes.map((n) => (
                    <li key={n.id} className="rounded-md border border-border bg-surface/60 px-3 py-2 text-sm">
                      <p>{n.texte}</p>
                      <p className="text-xs text-muted-foreground">{n.auteur} · {n.date}</p>
                    </li>
                  ))}
                  {detailDialog.item.notesInternes.length === 0 && <p className="text-sm text-muted-foreground">Aucune note.</p>}
                </ul>
                <ChampTexte label="Ajouter une note" value={note} onChange={setNote} rows={2} />
                <Button
                  size="sm"
                  onClick={() => {
                    if (!note.trim() || !detailDialog.item) return;
                    ajouterNote("procedures", detailDialog.item.id, note);
                    setNote("");
                  }}
                >
                  Ajouter la note
                </Button>
              </div>
            )}
            {ongletDetail === "Historique" && <Historique items={detailDialog.item.historique} />}
          </div>
        )}
      </FormDialog>
    </div>
  );
}
