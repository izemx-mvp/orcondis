import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Champ,
  ChampSelect,
  ChampTexte,
  Colonne,
  DataTable,
  Detail,
  FilterBar,
  FormDialog,
  Grille,
  PageHeader,
  Panel,
  SearchInput,
  SelectFilter,
  StatCard,
  Statut,
  tonStatut,
  useDialog,
} from "@/components/bo/kit";
import { Button } from "@/components/ui/button";
import { useBO, useLookups } from "@/lib/bo-store";
import { CATEGORIES_DOC, SOURCES_DOC, fr, uid, type DocumentBO } from "@/lib/bo-data";

export const Route = createFileRoute("/backoffice/documents_temp")({
  head: () => ({
    meta: [
      { title: "Documents — Back-Office ORCONDIS" },
      { name: "description", content: "Gestion documentaire centralisée : dépôt, prévisualisation, rattachement et archivage." },
      { property: "og:title", content: "Documents ORCONDIS" },
      { property: "og:description", content: "Bibliothèque documentaire ORCONDIS." },
    ],
  }),
  component: Documents,
});

const VIDE_FORM = {
  nom: "",
  type: "PDF",
  categorie: "" as (typeof CATEGORIES_DOC)[number] | "",
  clientId: "",
  dossierId: "",
  courseId: "",
  paiementId: "",
  ajoutePar: "Opérateur Back-Office",
  source: "Back-Office" as (typeof SOURCES_DOC)[number],
  notes: "",
};

function Documents() {
  const { data, add, patch, toggleArchive, log } = useBO();
  const l = useLookups();

  const [recherche, setRecherche] = useState("");
  const [categorie, setCategorie] = useState("");
  const [source, setSource] = useState("");
  const [clientId, setClientId] = useState("");
  const [dossierId, setDossierId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [voirArchives, setVoirArchives] = useState(false);

  const ajout = useDialog<null>();
  const [form, setForm] = useState(VIDE_FORM);

  const apercu = useDialog<DocumentBO>();
  const renommer = useDialog<DocumentBO>();
  const [nomTmp, setNomTmp] = useState("");
  const categoriser = useDialog<DocumentBO>();
  const [catTmp, setCatTmp] = useState("");
  const rattacher = useDialog<DocumentBO>();
  const [ratTmp, setRatTmp] = useState({ clientId: "", dossierId: "", courseId: "", paiementId: "" });

  const documents = useMemo(() => {
    return data.documents.filter((d) => {
      if (voirArchives ? !d.archive : d.archive) return false;
      if (categorie && d.categorie !== categorie) return false;
      if (source && d.source !== source) return false;
      if (clientId && d.clientId !== clientId) return false;
      if (dossierId && d.dossierId !== dossierId) return false;
      if (courseId && d.courseId !== courseId) return false;
      if (recherche) {
        const q = recherche.toLowerCase();
        const hay = `${d.nom} ${d.notes} ${l.clientNom(d.clientId)} ${d.ajoutePar}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data.documents, voirArchives, categorie, source, clientId, dossierId, courseId, recherche, l]);

  const stats = useMemo(() => {
    const actifs = data.documents.filter((d) => !d.archive);
    const parCategorie = new Map<string, number>();
    const parSource = new Map<string, number>();
    for (const d of actifs) {
      parCategorie.set(d.categorie, (parCategorie.get(d.categorie) ?? 0) + 1);
      parSource.set(d.source, (parSource.get(d.source) ?? 0) + 1);
    }
    const topCategorie = [...parCategorie.entries()].sort((a, b) => b[1] - a[1])[0];
    const topSource = [...parSource.entries()].sort((a, b) => b[1] - a[1])[0];
    return {
      total: actifs.length,
      archives: data.documents.filter((d) => d.archive).length,
      topCategorie,
      topSource,
      parCategorie,
      parSource,
    };
  }, [data.documents]);

  function telecharger(d: DocumentBO) {
    const contenu = [
      `Document : ${d.nom}`,
      `Type : ${d.type}`,
      `Catégorie : ${d.categorie}`,
      `Client : ${l.clientNom(d.clientId)}`,
      `Dossier : ${l.dossierNom(d.dossierId)}`,
      `Course : ${d.courseId || "—"}`,
      `Date : ${fr(d.date)}`,
      `Ajouté par : ${d.ajoutePar}`,
      `Source : ${d.source}`,
      `Notes : ${d.notes || "—"}`,
    ].join("\n");
    const blob = new Blob([contenu], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = d.nom.includes(".") ? d.nom : `${d.nom}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    log({ entite: "Document", entiteId: d.id, utilisateur: "Opérateur Back-Office", action: "Téléchargement", ancienneValeur: "", nouvelleValeur: d.nom });
  }

  const colonnes: Colonne<DocumentBO>[] = [
    { cle: "nom", titre: "Nom", rendu: (d) => <span className="font-medium text-navy">{d.nom}</span> },
    { cle: "type", titre: "Type", rendu: (d) => d.type },
    { cle: "categorie", titre: "Catégorie", rendu: (d) => <Statut ton={tonStatut(d.categorie)}>{d.categorie}</Statut> },
    { cle: "client", titre: "Client", rendu: (d) => l.clientNom(d.clientId) },
    { cle: "dossier", titre: "Dossier", rendu: (d) => l.dossierNom(d.dossierId) },
    { cle: "course", titre: "Course", rendu: (d) => d.courseId || "—" },
    { cle: "paiement", titre: "Paiement", rendu: (d) => d.paiementId || "—" },
    { cle: "date", titre: "Date", rendu: (d) => fr(d.date) },
    { cle: "ajoutePar", titre: "Ajouté par", rendu: (d) => d.ajoutePar },
    { cle: "source", titre: "Source", rendu: (d) => <Statut>{d.source}</Statut> },
    {
      cle: "actions",
      titre: "Actions",
      align: "right",
      rendu: (d) => (
        <div className="flex flex-wrap justify-end gap-1">
          <Button size="sm" variant="outline" onClick={() => apercu.ouvrir(d)}>Prévisualiser</Button>
          <Button size="sm" variant="outline" onClick={() => telecharger(d)}>Télécharger</Button>
          <Button size="sm" variant="outline" onClick={() => { setNomTmp(d.nom); renommer.ouvrir(d); }}>Renommer</Button>
          <Button size="sm" variant="outline" onClick={() => { setCatTmp(d.categorie); categoriser.ouvrir(d); }}>Catégorie</Button>
          <Button size="sm" variant="outline" onClick={() => { setRatTmp({ clientId: d.clientId, dossierId: d.dossierId, courseId: d.courseId, paiementId: d.paiementId }); rattacher.ouvrir(d); }}>Rattacher</Button>
          <Button
            size="sm"
            variant={d.archive ? "outline" : "destructive"}
            onClick={() => {
              toggleArchive("documents", d.id);
              log({ entite: "Document", entiteId: d.id, utilisateur: "Opérateur Back-Office", action: d.archive ? "Restauration" : "Archivage", ancienneValeur: d.archive ? "Archivé" : "Actif", nouvelleValeur: d.archive ? "Actif" : "Archivé" });
            }}
          >
            {d.archive ? "Restaurer" : "Archiver"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        titre="Documents"
        sous="Bibliothèque documentaire centralisée de tous les clients, dossiers, courses et paiements."
        actions={<Button onClick={() => { setForm(VIDE_FORM); ajout.ouvrir(null); }}>Ajouter un document</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Documents actifs" valeur={stats.total} />
        <StatCard label="Documents archivés" valeur={stats.archives} ton="alerte" />
        <StatCard label="Catégorie dominante" valeur={stats.topCategorie?.[0] ?? "—"} detail={stats.topCategorie ? `${stats.topCategorie[1]} document(s)` : ""} />
        <StatCard label="Source dominante" valeur={stats.topSource?.[0] ?? "—"} detail={stats.topSource ? `${stats.topSource[1]} document(s)` : ""} />
      </div>

      <Panel titre="Répartition par catégorie et par source">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            {[...stats.parCategorie.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => (
              <div key={k} className="space-y-1">
                <div className="flex justify-between text-xs"><span>{k}</span><span className="text-muted-foreground">{v}</span></div>
                <div className="h-2 rounded-full bg-surface"><div className="h-2 rounded-full bg-primary" style={{ width: `${(v / Math.max(1, stats.total)) * 100}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {[...stats.parSource.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => (
              <div key={k} className="space-y-1">
                <div className="flex justify-between text-xs"><span>{k}</span><span className="text-muted-foreground">{v}</span></div>
                <div className="h-2 rounded-full bg-surface"><div className="h-2 rounded-full bg-success" style={{ width: `${(v / Math.max(1, stats.total)) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel>
        <FilterBar>
          <SearchInput value={recherche} onChange={setRecherche} placeholder="Rechercher un document…" />
          <SelectFilter value={categorie} onChange={setCategorie} options={CATEGORIES_DOC} label="Catégorie" />
          <SelectFilter value={source} onChange={setSource} options={SOURCES_DOC} label="Source" />
          <SelectFilter value={clientId} onChange={setClientId} options={data.clients.map((c) => c.id)} label="Client" />
          <SelectFilter value={dossierId} onChange={setDossierId} options={data.dossiers.map((d) => d.id)} label="Dossier" />
          <SelectFilter value={courseId} onChange={setCourseId} options={data.courses.map((c) => c.id)} label="Course" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={voirArchives} onChange={(e) => setVoirArchives(e.target.checked)} className="h-4 w-4" />
            Voir les archives
          </label>
        </FilterBar>
      </Panel>

      <DataTable colonnes={colonnes} lignes={documents} vide="Aucun document ne correspond aux filtres." />

      <FormDialog
        open={ajout.open}
        onOpenChange={ajout.setOpen}
        titre="Ajouter un document"
        submitLabel="Enregistrer"
        onSubmit={() => {
          if (!form.nom || !form.categorie) return;
          const doc: DocumentBO = {
            id: uid("DOC"),
            nom: form.nom,
            type: form.type,
            categorie: form.categorie,
            clientId: form.clientId,
            dossierId: form.dossierId,
            courseId: form.courseId,
            paiementId: form.paiementId,
            date: new Date().toISOString().slice(0, 10),
            ajoutePar: form.ajoutePar,
            source: form.source,
            notes: form.notes,
            archive: false,
          };
          add("documents", doc);
          log({ entite: "Document", entiteId: doc.id, utilisateur: form.ajoutePar, action: "Création", ancienneValeur: "", nouvelleValeur: doc.nom });
        }}
      >
        <Grille>
          <Champ label="Nom du fichier" value={form.nom} onChange={(v) => setForm({ ...form, nom: v })} placeholder="ex: Facture-4471.pdf" />
          <ChampSelect label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={["PDF", "Photo", "Word", "Excel", "Autre"]} />
          <ChampSelect label="Catégorie" value={form.categorie} onChange={(v) => setForm({ ...form, categorie: v as any })} options={CATEGORIES_DOC} />
          <ChampSelect label="Source" value={form.source} onChange={(v) => setForm({ ...form, source: v as any })} options={SOURCES_DOC} />
          <ChampSelect label="Client" value={form.clientId} onChange={(v) => setForm({ ...form, clientId: v })} options={data.clients.map((c) => ({ value: c.id, label: c.raisonSociale }))} />
          <ChampSelect label="Dossier" value={form.dossierId} onChange={(v) => setForm({ ...form, dossierId: v })} options={data.dossiers.map((d) => ({ value: d.id, label: d.numero }))} />
          <ChampSelect label="Course" value={form.courseId} onChange={(v) => setForm({ ...form, courseId: v })} options={data.courses.map((c) => ({ value: c.id, label: c.numero }))} />
          <ChampSelect label="Paiement" value={form.paiementId} onChange={(v) => setForm({ ...form, paiementId: v })} options={data.paiements.map((p) => ({ value: p.id, label: p.numero }))} />
          <Champ label="Ajouté par" value={form.ajoutePar} onChange={(v) => setForm({ ...form, ajoutePar: v })} />
        </Grille>
        <ChampTexte label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
      </FormDialog>

      <FormDialog open={apercu.open} onOpenChange={apercu.setOpen} titre="Prévisualisation du document" large>
        {apercu.item && (
          <div className="space-y-4">
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border bg-surface text-sm text-muted-foreground">
              Aperçu non disponible en démonstration — {apercu.item.type}
            </div>
            <Grille>
              <Detail label="Nom">{apercu.item.nom}</Detail>
              <Detail label="Type">{apercu.item.type}</Detail>
              <Detail label="Catégorie">{apercu.item.categorie}</Detail>
              <Detail label="Client">{l.clientNom(apercu.item.clientId)}</Detail>
              <Detail label="Dossier">{l.dossierNom(apercu.item.dossierId)}</Detail>
              <Detail label="Course">{apercu.item.courseId || "—"}</Detail>
              <Detail label="Paiement">{apercu.item.paiementId || "—"}</Detail>
              <Detail label="Date">{fr(apercu.item.date)}</Detail>
              <Detail label="Ajouté par">{apercu.item.ajoutePar}</Detail>
              <Detail label="Source">{apercu.item.source}</Detail>
            </Grille>
            <Detail label="Notes">{apercu.item.notes}</Detail>
          </div>
        )}
      </FormDialog>

      <FormDialog
        open={renommer.open}
        onOpenChange={renommer.setOpen}
        titre="Renommer le document"
        onSubmit={() => {
          if (!renommer.item || !nomTmp) return;
          patch("documents", renommer.item.id, { nom: nomTmp });
          log({ entite: "Document", entiteId: renommer.item.id, utilisateur: "Opérateur Back-Office", action: "Renommage", ancienneValeur: renommer.item.nom, nouvelleValeur: nomTmp });
        }}
      >
        <Champ label="Nouveau nom" value={nomTmp} onChange={setNomTmp} />
      </FormDialog>

      <FormDialog
        open={categoriser.open}
        onOpenChange={categoriser.setOpen}
        titre="Modifier la catégorie"
        onSubmit={() => {
          if (!categoriser.item || !catTmp) return;
          patch("documents", categoriser.item.id, { categorie: catTmp as any });
          log({ entite: "Document", entiteId: categoriser.item.id, utilisateur: "Opérateur Back-Office", action: "Changement de catégorie", ancienneValeur: categoriser.item.categorie, nouvelleValeur: catTmp });
        }}
      >
        <ChampSelect label="Catégorie" value={catTmp} onChange={setCatTmp} options={CATEGORIES_DOC} />
      </FormDialog>

      <FormDialog
        open={rattacher.open}
        onOpenChange={rattacher.setOpen}
        titre="Rattacher le document"
        description="Modifier les liens vers le client, le dossier, la course ou le paiement."
        onSubmit={() => {
          if (!rattacher.item) return;
          patch("documents", rattacher.item.id, { ...ratTmp });
          log({ entite: "Document", entiteId: rattacher.item.id, utilisateur: "Opérateur Back-Office", action: "Rattachement", ancienneValeur: rattacher.item.clientId, nouvelleValeur: ratTmp.clientId });
        }}
      >
        <Grille>
          <ChampSelect label="Client" value={ratTmp.clientId} onChange={(v) => setRatTmp({ ...ratTmp, clientId: v })} options={data.clients.map((c) => ({ value: c.id, label: c.raisonSociale }))} />
          <ChampSelect label="Dossier" value={ratTmp.dossierId} onChange={(v) => setRatTmp({ ...ratTmp, dossierId: v })} options={data.dossiers.map((d) => ({ value: d.id, label: d.numero }))} />
          <ChampSelect label="Course" value={ratTmp.courseId} onChange={(v) => setRatTmp({ ...ratTmp, courseId: v })} options={data.courses.map((c) => ({ value: c.id, label: c.numero }))} />
          <ChampSelect label="Paiement" value={ratTmp.paiementId} onChange={(v) => setRatTmp({ ...ratTmp, paiementId: v })} options={data.paiements.map((p) => ({ value: p.id, label: p.numero }))} />
        </Grille>
      </FormDialog>
    </div>
  );
}
