import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useOps, useOpsLookups } from "@/lib/bo/ops-store";
import {
  oid,
  toneCoursier,
  toneCourse,
  prochainCodeCoursier,
  todayIso,
  MOYENS_TRANSPORT,
  STATUTS_COURSIER,
  TRANSPORTS,
  ZONES,
  type CoursierOps,
  type MoyenTransport,
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
  ChampCase,
  FormDialog,
  Grille,
  Onglets,
  Historique,
  Detail,
  useDialog,
  type Colonne,
} from "@/components/bo/kit";

export const Route = createFileRoute("/backoffice/coursiers")({
  head: () => ({
    meta: [
      { title: "Coursiers — Back-Office ORCONDIS" },
      { name: "description", content: "Gestion des coursiers ORCONDIS : disponibilité, zones, courses affectées et kilométrage." },
    ],
  }),
  component: CoursiersPage,
});

function coursierVide(code: string): CoursierOps {
  return {
    id: oid("crr"),
    code,
    photo: "",
    nom: "",
    prenom: "",
    gsm: "",
    whatsapp: "",
    email: "",
    adresse: "",
    ville: "Casablanca",
    zonePrincipale: ZONES[0],
    zonesSecondaires: "",
    zoneActuelle: ZONES[0],
    transport: "Moto",
    immatriculation: "",
    statut: "Disponible",
    dateDebut: todayIso(),
    notes: "",
    actif: true,
    archive: false,
    documents: [],
    notesInternes: [],
    historique: [],
  };
}

function CoursiersPage() {
  const { data, ajouter, modifier, archiver } = useOps();
  const l = useOpsLookups();

  const [recherche, setRecherche] = useState("");
  const [statut, setStatut] = useState("");
  const [zone, setZone] = useState("");
  const [transport, setTransport] = useState("");
  const [voirArchives, setVoirArchives] = useState(false);

  const nouveauDialog = useDialog<null>();
  const editDialog = useDialog<CoursierOps>();
  const detailDialog = useDialog<CoursierOps>();
  const [ongletDetail, setOngletDetail] = useState("Informations");

  const [form, setForm] = useState<CoursierOps>(() => coursierVide(prochainCodeCoursier(data.coursiers)));

  const coursiers = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    return data.coursiers.filter((c) => {
      if (c.archive !== voirArchives) return false;
      if (statut && c.statut !== statut) return false;
      if (zone && c.zonePrincipale !== zone && c.zoneActuelle !== zone) return false;
      if (transport && c.transport !== transport) return false;
      if (terme) {
        const hay = `${c.code} ${c.prenom} ${c.nom} ${c.gsm}`.toLowerCase();
        if (!hay.includes(terme)) return false;
      }
      return true;
    });
  }, [data.coursiers, recherche, statut, zone, transport, voirArchives]);

  const stats = useMemo(() => {
    const actifs = data.coursiers.filter((c) => !c.archive);
    return {
      total: actifs.length,
      disponibles: actifs.filter((c) => c.statut === "Disponible").length,
      occupes: actifs.filter((c) => c.statut === "Occupé").length,
      indisponibles: actifs.filter((c) => c.statut === "Indisponible").length,
    };
  }, [data.coursiers]);

  const coursesDu = (id: string) => data.courses.filter((c) => c.coursierId === id);
  const kmParcourus = (id: string) => coursesDu(id).reduce((s, c) => s + (c.kmMission || Math.max(0, c.kmArrivee - c.kmDepart)), 0);
  const kmVideDu = (id: string) => coursesDu(id).reduce((s, c) => s + c.kmVide, 0);
  const reaffectationsDu = (id: string) => data.courses.flatMap((c) => c.reaffectations.filter((r) => r.nouveau === l.coursierNom(id) || r.ancien === l.coursierNom(id)));
  const audiosDu = (id: string) => data.audios.filter((a) => a.coursierId === id);

  const ouvrirCreation = () => {
    setForm(coursierVide(prochainCodeCoursier(data.coursiers)));
    nouveauDialog.ouvrir(null);
  };
  const soumettreCreation = () => {
    if (!form.nom || !form.prenom) return;
    ajouter("coursiers", form);
  };
  const ouvrirEdition = (c: CoursierOps) => {
    setForm(c);
    editDialog.ouvrir(c);
  };
  const soumettreEdition = () => {
    if (!editDialog.item) return;
    modifier("coursiers", editDialog.item.id, form, "Coursier modifié");
  };
  const ouvrirDetail = (c: CoursierOps) => {
    setOngletDetail("Informations");
    detailDialog.ouvrir(c);
  };

  const colonnes: Colonne<CoursierOps>[] = [
    { cle: "code", titre: "Code", rendu: (c) => <span className="font-medium text-navy">{c.code}</span> },
    { cle: "nom", titre: "Nom", rendu: (c) => `${c.prenom} ${c.nom}` },
    { cle: "gsm", titre: "GSM", rendu: (c) => c.gsm },
    { cle: "transport", titre: "Transport", rendu: (c) => c.transport },
    { cle: "zone", titre: "Zone", rendu: (c) => c.zoneActuelle || c.zonePrincipale },
    { cle: "charge", titre: "Courses actives", rendu: (c) => l.chargeCoursier(c.id) },
    { cle: "statut", titre: "Statut", rendu: (c) => <Statut ton={toneCoursier(c.statut)}>{c.statut}</Statut> },
    {
      cle: "actions",
      titre: "Actions",
      align: "right",
      rendu: (c) => (
        <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" onClick={() => ouvrirDetail(c)}>Voir</Button>
          <Button size="sm" variant="ghost" onClick={() => ouvrirEdition(c)}>Modifier</Button>
          <Button size="sm" variant="ghost" onClick={() => archiver("coursiers", c.id, !c.archive)}>
            {c.archive ? "Restaurer" : "Archiver"}
          </Button>
        </div>
      ),
    },
  ];

  const champsFormulaire = (
    <>
      <Grille cols={2}>
        <Champ label="Nom" value={form.nom} onChange={(v) => setForm({ ...form, nom: v })} />
        <Champ label="Prénom" value={form.prenom} onChange={(v) => setForm({ ...form, prenom: v })} />
      </Grille>
      <Grille cols={2}>
        <Champ label="GSM" value={form.gsm} onChange={(v) => setForm({ ...form, gsm: v })} />
        <Champ label="WhatsApp" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} />
      </Grille>
      <Grille cols={2}>
        <ChampSelect label="Moyen de transport" value={form.transport} onChange={(v) => setForm({ ...form, transport: v as any })} options={MOYENS_TRANSPORT} />
        <ChampSelect label="Zone principale" value={form.zonePrincipale} onChange={(v) => setForm({ ...form, zonePrincipale: v })} options={ZONES} />
      </Grille>
      <Grille cols={2}>
        <ChampSelect label="Disponibilité" value={form.statut} onChange={(v) => setForm({ ...form, statut: v as any })} options={["Disponible", "Occupé", "Indisponible"]} />
        <ChampSelect label="Zone actuelle" value={form.zoneActuelle || ""} onChange={(v) => setForm({ ...form, zoneActuelle: v })} options={ZONES} />
      </Grille>
      <Champ label="Position opérationnelle" value={form.positionOperationnelle || ""} onChange={(v) => setForm({ ...form, positionOperationnelle: v })} placeholder="Dernière position connue..." />
      <ChampTexte label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
    </>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        titre="Coursiers"
        sous="Disponibilité, charge de travail et suivi des coursiers ORCONDIS."
        actions={<Button size="sm" onClick={ouvrirCreation}>Nouveau coursier</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Coursiers actifs" valeur={stats.total} />
        <StatCard label="Disponibles" valeur={stats.disponibles} ton="positif" />
        <StatCard label="Occupés" valeur={stats.occupes} ton="alerte" />
        <StatCard label="Indisponibles" valeur={stats.indisponibles} ton="critique" />
      </div>

      <Panel
        titre="Liste des coursiers"
        actions={
          <Button size="sm" variant="outline" onClick={() => setVoirArchives((v) => !v)}>
            {voirArchives ? "Voir actifs" : "Voir archivés"}
          </Button>
        }
      >
        <div className="mb-3 space-y-2">
          <FilterBar>
            <SearchInput value={recherche} onChange={setRecherche} placeholder="Code, nom, GSM…" />
            <SelectFilter label="Statut" value={statut} onChange={setStatut} options={STATUTS_COURSIER} />
            <SelectFilter label="Zone" value={zone} onChange={setZone} options={ZONES} />
            <SelectFilter label="Transport" value={transport} onChange={setTransport} options={TRANSPORTS} />
          </FilterBar>
        </div>
        <DataTable colonnes={colonnes} lignes={coursiers} onRowClick={ouvrirDetail} vide="Aucun coursier trouvé." />
      </Panel>

      <FormDialog open={nouveauDialog.open} onOpenChange={nouveauDialog.setOpen} titre="Nouveau coursier" onSubmit={soumettreCreation} large>
        <p className="text-xs text-muted-foreground">Code : <span className="font-medium text-navy">{form.code}</span></p>
        {champsFormulaire}
      </FormDialog>

      <FormDialog open={editDialog.open} onOpenChange={editDialog.setOpen} titre={`Modifier ${editDialog.item?.code ?? ""}`} onSubmit={soumettreEdition} large>
        {champsFormulaire}
      </FormDialog>

      <FormDialog
        open={detailDialog.open}
        onOpenChange={detailDialog.setOpen}
        titre={`${detailDialog.item?.prenom ?? ""} ${detailDialog.item?.nom ?? ""}`}
        {...(detailDialog.item?.code ? { description: detailDialog.item.code } : {})}
        large
      >
        {detailDialog.item && (
          <div className="space-y-4">
            <Onglets
              items={["Informations", "Courses affectées", "Kilométrage", "Réaffectations", "Audios", "Historique"]}
              actif={ongletDetail}
              onChange={setOngletDetail}
            />
            {ongletDetail === "Informations" && (
              <Grille>
                <Detail label="GSM">{detailDialog.item.gsm}</Detail>
                <Detail label="WhatsApp">{detailDialog.item.whatsapp}</Detail>
                <Detail label="Transport">{detailDialog.item.transport}</Detail>
                <Detail label="Immatriculation">{detailDialog.item.immatriculation}</Detail>
                <Detail label="Zone principale">{detailDialog.item.zonePrincipale}</Detail>
                <Detail label="Zone actuelle">{detailDialog.item.zoneActuelle}</Detail>
                <Detail label="Statut"><Statut ton={toneCoursier(detailDialog.item.statut)}>{detailDialog.item.statut}</Statut></Detail>
                <Detail label="Actif">{detailDialog.item.actif ? "Oui" : "Non"}</Detail>
                <div className="sm:col-span-2"><Detail label="Notes">{detailDialog.item.notes}</Detail></div>
              </Grille>
            )}
            {ongletDetail === "Courses affectées" && (
              <ul className="space-y-2">
                {coursesDu(detailDialog.item.id).map((c) => (
                  <li key={c.id} className="rounded-md border border-border px-3 py-2 text-sm">
                    <span className="font-medium text-navy">{c.numero}</span> — {c.typeCourse} · <Statut ton={toneCourse(c.statut)}>{c.statut}</Statut>
                  </li>
                ))}
                {coursesDu(detailDialog.item.id).length === 0 && <p className="text-sm text-muted-foreground">Aucune course affectée.</p>}
              </ul>
            )}
            {ongletDetail === "Kilométrage" && (
              <Grille cols={2}>
                <StatCard label="Km parcourus" valeur={kmParcourus(detailDialog.item.id)} />
                <StatCard label="Km à vide" valeur={kmVideDu(detailDialog.item.id)} ton="alerte" />
              </Grille>
            )}
            {ongletDetail === "Réaffectations" && (
              <ul className="space-y-2">
                {reaffectationsDu(detailDialog.item.id).map((r) => (
                  <li key={r.id} className="rounded-md border border-border px-3 py-2 text-sm">
                    {r.ancien} → {r.nouveau} · {r.motif} · {r.date} {r.heure}
                  </li>
                ))}
                {reaffectationsDu(detailDialog.item.id).length === 0 && <p className="text-sm text-muted-foreground">Aucune réaffectation.</p>}
              </ul>
            )}
            {ongletDetail === "Audios" && (
              <ul className="space-y-2">
                {audiosDu(detailDialog.item.id).map((a) => (
                  <li key={a.id} className="rounded-md border border-border px-3 py-2 text-sm">
                    {a.date} {a.heure} · {a.duree} — {a.transcription}
                  </li>
                ))}
                {audiosDu(detailDialog.item.id).length === 0 && <p className="text-sm text-muted-foreground">Aucun message audio.</p>}
              </ul>
            )}
            {ongletDetail === "Historique" && <Historique items={detailDialog.item.historique} />}
          </div>
        )}
      </FormDialog>
    </div>
  );
}
