import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useOps, useOpsLookups } from "@/lib/bo/ops-store";
import {
  oid,
  horodatage,
  toneDossier,
  prochainNumeroDossier,
  nomClient,
  todayIso,
  PRIORITES_DOSSIER,
  TYPES_DOSSIER,
  STATUTS_DOSSIER,
  RESPONSABLES_BO,
  type DossierOps,
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

export const Route = createFileRoute("/backoffice/dossiers")({
  head: () => ({
    meta: [
      { title: "Dossiers — Back-Office ARCONDIS" },
      { name: "description", content: "Gestion des dossiers clients ARCONDIS : suivi, courses liées, procédures et documents." },
    ],
  }),
  component: DossiersPage,
});

function dossierVide(numero: string): DossierOps {
  return {
    id: oid("dos"),
    numero,
    clientId: "",
    contactId: "",
    responsable: RESPONSABLES_BO[0] ?? "",
    type: TYPES_DOSSIER[0],
    objet: "",
    description: "",
    dateOuverture: todayIso(),
    datePrevue: "",
    dateCloture: "",
    priorite: "Normale",
    statut: "Nouveau",
    montantEstime: 0,
    notes: "",
    documents: [],
    notesInternes: [],
    historique: [{ id: oid("ev"), date: horodatage(), auteur: "Back-Office", action: "Dossier créé" }],
    archive: false,
  };
}

function DossiersPage() {
  const { data, ajouter, modifier, archiver, ajouterNote } = useOps();
  const l = useOpsLookups();

  const [recherche, setRecherche] = useState("");
  const [statut, setStatut] = useState("");
  const [type, setType] = useState("");
  const [priorite, setPriorite] = useState("");
  const [client, setClient] = useState("");
  const [responsable, setResponsable] = useState("");
  const [voirArchives, setVoirArchives] = useState(false);

  const nouveauDialog = useDialog<null>();
  const editDialog = useDialog<DossierOps>();
  const detailDialog = useDialog<DossierOps>();
  const [ongletDetail, setOngletDetail] = useState("Informations");
  const [note, setNote] = useState("");

  const [form, setForm] = useState<DossierOps>(() => dossierVide(prochainNumeroDossier(data.dossiers)));

  const dossiers = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    return data.dossiers.filter((d) => {
      if (d.archive !== voirArchives) return false;
      if (statut && d.statut !== statut) return false;
      if (type && d.type !== type) return false;
      if (priorite && d.priorite !== priorite) return false;
      if (client && d.clientId !== client) return false;
      if (responsable && d.responsable !== responsable) return false;
      if (terme) {
        const hay = `${d.numero} ${l.clientNom(d.clientId)} ${d.objet}`.toLowerCase();
        if (!hay.includes(terme)) return false;
      }
      return true;
    });
  }, [data.dossiers, recherche, statut, type, priorite, client, responsable, voirArchives, l]);

  const stats = useMemo(() => {
    const actifs = data.dossiers.filter((d) => !d.archive);
    return {
      total: actifs.length,
      enCours: actifs.filter((d) => d.statut === "En cours").length,
      enAttente: actifs.filter((d) => d.statut.startsWith("En attente")).length,
      critiques: actifs.filter((d) => d.priorite === "Critique").length,
    };
  }, [data.dossiers]);

  const coursesDuDossier = (id: string) => data.courses.filter((c) => c.dossierId === id);
  const proceduresDuDossier = (id: string) => data.procedures.filter((p) => p.dossierId === id);

  const ouvrirCreation = () => {
    setForm(dossierVide(prochainNumeroDossier(data.dossiers)));
    nouveauDialog.ouvrir(null);
  };

  const soumettreCreation = () => {
    if (!form.clientId || !form.objet) return;
    ajouter("dossiers", form);
  };

  const ouvrirEdition = (d: DossierOps) => {
    setForm(d);
    editDialog.ouvrir(d);
  };

  const soumettreEdition = () => {
    if (!editDialog.item) return;
    modifier("dossiers", editDialog.item.id, form, "Dossier modifié");
  };

  const ouvrirDetail = (d: DossierOps) => {
    setOngletDetail("Informations");
    detailDialog.ouvrir(d);
  };

  const colonnes: Colonne<DossierOps>[] = [
    { cle: "numero", titre: "N°", rendu: (d) => <span className="font-medium text-navy">{d.numero}</span> },
    { cle: "client", titre: "Client", rendu: (d) => l.clientNom(d.clientId) },
    { cle: "type", titre: "Type", rendu: (d) => d.type },
    { cle: "objet", titre: "Objet", rendu: (d) => <span className="line-clamp-1">{d.objet}</span> },
    { cle: "responsable", titre: "Responsable", rendu: (d) => d.responsable },
    { cle: "priorite", titre: "Priorité", rendu: (d) => <Statut ton={tonStatut(d.priorite)}>{d.priorite}</Statut> },
    { cle: "statut", titre: "Statut", rendu: (d) => <Statut ton={toneDossier(d.statut)}>{d.statut}</Statut> },
    {
      cle: "actions",
      titre: "Actions",
      align: "right",
      rendu: (d) => (
        <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" onClick={() => ouvrirDetail(d)}>Voir</Button>
          <Button size="sm" variant="ghost" onClick={() => ouvrirEdition(d)}>Modifier</Button>
          <Button size="sm" variant="ghost" onClick={() => archiver("dossiers", d.id, !d.archive)}>
            {d.archive ? "Restaurer" : "Archiver"}
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
          label="Contact"
          value={form.contactId}
          onChange={(v) => setForm({ ...form, contactId: v })}
          options={data.contacts.filter((c) => c.clientId === form.clientId).map((c) => ({ value: c.id, label: `${c.prenom} ${c.nom}` }))}
        />
      </Grille>
      <Grille>
        <ChampSelect label="Type de dossier" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={TYPES_DOSSIER} />
        <ChampSelect label="Responsable" value={form.responsable} onChange={(v) => setForm({ ...form, responsable: v })} options={RESPONSABLES_BO} />
      </Grille>
      <Champ label="Intitulé / objet" value={form.objet} onChange={(v) => setForm({ ...form, objet: v })} />
      <ChampTexte label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
      <Grille cols={3}>
        <ChampSelect label="Priorité" value={form.priorite} onChange={(v) => setForm({ ...form, priorite: v as DossierOps["priorite"] })} options={PRIORITES_DOSSIER} />
        <ChampSelect label="Statut" value={form.statut} onChange={(v) => setForm({ ...form, statut: v as DossierOps["statut"] })} options={STATUTS_DOSSIER} />
        <Champ label="Montant estimé (MAD)" type="number" value={form.montantEstime} onChange={(v) => setForm({ ...form, montantEstime: Number(v) || 0 })} />
      </Grille>
      <Grille cols={3}>
        <Champ label="Date d'ouverture" type="date" value={form.dateOuverture} onChange={(v) => setForm({ ...form, dateOuverture: v })} />
        <Champ label="Date prévue" type="date" value={form.datePrevue} onChange={(v) => setForm({ ...form, datePrevue: v })} />
        <Champ label="Date de clôture" type="date" value={form.dateCloture} onChange={(v) => setForm({ ...form, dateCloture: v })} />
      </Grille>
      <ChampTexte label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
    </>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        titre="Dossiers"
        sous="Suivi des dossiers clients, courses et procédures rattachées."
        actions={<Button size="sm" onClick={ouvrirCreation}>Nouveau dossier</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Dossiers actifs" valeur={stats.total} />
        <StatCard label="En cours" valeur={stats.enCours} ton="positif" />
        <StatCard label="En attente" valeur={stats.enAttente} ton="alerte" />
        <StatCard label="Priorité critique" valeur={stats.critiques} ton="critique" />
      </div>

      <Panel
        titre="Liste des dossiers"
        actions={
          <Button size="sm" variant="outline" onClick={() => setVoirArchives((v) => !v)}>
            {voirArchives ? "Voir actifs" : "Voir archivés"}
          </Button>
        }
      >
        <div className="mb-3 space-y-2">
          <FilterBar>
            <SearchInput value={recherche} onChange={setRecherche} placeholder="N°, client, objet…" />
            <SelectFilter label="Statut" value={statut} onChange={setStatut} options={STATUTS_DOSSIER} />
            <SelectFilter label="Type" value={type} onChange={setType} options={TYPES_DOSSIER} />
            <SelectFilter label="Priorité" value={priorite} onChange={setPriorite} options={PRIORITES_DOSSIER} />
            <SelectFilter label="Responsable" value={responsable} onChange={setResponsable} options={RESPONSABLES_BO} />
          </FilterBar>
        </div>
        <DataTable colonnes={colonnes} lignes={dossiers} onRowClick={ouvrirDetail} vide="Aucun dossier trouvé." />
      </Panel>

      <FormDialog open={nouveauDialog.open} onOpenChange={nouveauDialog.setOpen} titre="Nouveau dossier" onSubmit={soumettreCreation} large>
        <p className="text-xs text-muted-foreground">Numéro : <span className="font-medium text-navy">{form.numero}</span></p>
        {champsFormulaire}
      </FormDialog>

      <FormDialog open={editDialog.open} onOpenChange={editDialog.setOpen} titre={`Modifier ${editDialog.item?.numero ?? ""}`} onSubmit={soumettreEdition} large>
        {champsFormulaire}
      </FormDialog>

      <FormDialog
        open={detailDialog.open}
        onOpenChange={detailDialog.setOpen}
        titre={`Dossier ${detailDialog.item?.numero ?? ""}`}
        description={detailDialog.item ? l.clientNom(detailDialog.item.clientId) : ""}
        large
      >
        {detailDialog.item && (
          <div className="space-y-4">
            <Onglets
              items={["Informations", "Courses liées", "Procédures", "Documents", "Notes", "Historique"]}
              actif={ongletDetail}
              onChange={setOngletDetail}
            />
            {ongletDetail === "Informations" && (
              <Grille>
                <Detail label="Client">{l.clientNom(detailDialog.item.clientId)}</Detail>
                <Detail label="Contact">{l.contactNom(detailDialog.item.contactId)}</Detail>
                <Detail label="Type">{detailDialog.item.type}</Detail>
                <Detail label="Responsable">{detailDialog.item.responsable}</Detail>
                <Detail label="Priorité"><Statut ton={tonStatut(detailDialog.item.priorite)}>{detailDialog.item.priorite}</Statut></Detail>
                <Detail label="Statut"><Statut ton={toneDossier(detailDialog.item.statut)}>{detailDialog.item.statut}</Statut></Detail>
                <Detail label="Date d'ouverture">{detailDialog.item.dateOuverture}</Detail>
                <Detail label="Date prévue">{detailDialog.item.datePrevue}</Detail>
                <Detail label="Montant estimé">{detailDialog.item.montantEstime} MAD</Detail>
                <div className="sm:col-span-2"><Detail label="Objet">{detailDialog.item.objet}</Detail></div>
                <div className="sm:col-span-2"><Detail label="Description">{detailDialog.item.description}</Detail></div>
              </Grille>
            )}
            {ongletDetail === "Courses liées" && (
              <ul className="space-y-2">
                {coursesDuDossier(detailDialog.item.id).map((c) => (
                  <li key={c.id} className="rounded-md border border-border px-3 py-2 text-sm">
                    <span className="font-medium text-navy">{c.numero}</span> — {c.typeCourse} · <Statut ton={tonStatut(c.statut)}>{c.statut}</Statut>
                  </li>
                ))}
                {coursesDuDossier(detailDialog.item.id).length === 0 && <p className="text-sm text-muted-foreground">Aucune course liée.</p>}
              </ul>
            )}
            {ongletDetail === "Procédures" && (
              <ul className="space-y-2">
                {proceduresDuDossier(detailDialog.item.id).map((p) => (
                  <li key={p.id} className="rounded-md border border-border px-3 py-2 text-sm">
                    <span className="font-medium text-navy">{p.numero}</span> — {p.type} · <Statut ton={tonStatut(p.statut)}>{p.statut}</Statut>
                  </li>
                ))}
                {proceduresDuDossier(detailDialog.item.id).length === 0 && <p className="text-sm text-muted-foreground">Aucune procédure liée.</p>}
              </ul>
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
                <div className="flex gap-2">
                  <ChampTexte label="Ajouter une note" value={note} onChange={setNote} rows={2} />
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    if (!note.trim() || !detailDialog.item) return;
                    ajouterNote("dossiers", detailDialog.item.id, note);
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
