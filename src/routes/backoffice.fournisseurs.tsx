import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useBO } from "@/lib/bo-store";
import type { Fournisseur, Paiement } from "@/lib/bo-data";
import { dh, fr, today, uid } from "@/lib/bo-data";
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

export const Route = createFileRoute("/backoffice/fournisseurs")({
  head: () => ({
    meta: [
      { title: "Fournisseurs — Back-Office ORCONDIS" },
      {
        name: "description",
        content: "Gestion des fournisseurs ORCONDIS.",
      },
    ],
  }),
  component: FournisseursPage,
});

const FOURNISSEUR_VIDE: Omit<Fournisseur, "id"> = {
  code: "",
  raisonSociale: "",
  contact: "",
  gsm: "",
  email: "",
  adresse: "",
  ville: "",
  zone: "",
  conditions: "",
  notes: "",
  actif: true,
  archive: false,
};

function FournisseursPage() {
  const { data, add, patch, toggleArchive, log } = useBO();
  const [recherche, setRecherche] = useState("");
  const [voirArchives, setVoirArchives] = useState(false);
  
  const fournisseurs = useMemo(() => {
    return data.fournisseurs.filter((f) => {
      if (f.archive !== voirArchives) return false;
      if (recherche && !`${f.code} ${f.raisonSociale}`.toLowerCase().includes(recherche.toLowerCase())) return false;
      return true;
    });
  }, [data.fournisseurs, recherche, voirArchives]);

  const creerDialog = useDialog<Fournisseur | null>();
  const [form, setForm] = useState<Omit<Fournisseur, "id">>(FOURNISSEUR_VIDE);

  function enregistrer() {
    if (creerDialog.item) {
      patch("fournisseurs", creerDialog.item.id, form);
    } else {
      const id = uid("FRS");
      add("fournisseurs", { id, ...form, code: form.code || id });
    }
  }

  const colonnes: Colonne<Fournisseur>[] = [
    { cle: "code", titre: "Code", rendu: (f) => <span className="font-mono text-xs">{f.code}</span> },
    { cle: "raison", titre: "Raison sociale", rendu: (f) => <span className="font-medium text-navy">{f.raisonSociale}</span> },
    { cle: "contact", titre: "Contact", rendu: (f) => f.contact || "—" },
    { cle: "gsm", titre: "GSM", rendu: (f) => f.gsm || "—" },
    { cle: "statut", titre: "Statut", rendu: (f) => <Statut ton={tonStatut(f.actif ? "Actif" : "Inactif")}>{f.actif ? "Actif" : "Inactif"}</Statut> },
    {
      cle: "actions",
      titre: "Actions",
      align: "right",
      rendu: (f) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="outline" onClick={() => { setForm(f); creerDialog.ouvrir(f); }}>Modifier</Button>
          <Button size="sm" variant={f.archive ? "outline" : "destructive"} onClick={() => toggleArchive("fournisseurs", f.id)}>
            {f.archive ? "Restaurer" : "Archiver"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        titre="Fournisseurs"
        sous="Gestion des fournisseurs et contacts associés."
        actions={<Button onClick={() => { setForm(FOURNISSEUR_VIDE); creerDialog.ouvrir(null); }}>Nouveau fournisseur</Button>}
      />

      <Panel titre="Recherche">
        <FilterBar>
          <SearchInput value={recherche} onChange={setRecherche} placeholder="Rechercher un fournisseur…" />
          <Button variant={voirArchives ? "default" : "outline"} size="sm" onClick={() => setVoirArchives(!voirArchives)}>
            {voirArchives ? "Voir actifs" : "Voir archivés"}
          </Button>
        </FilterBar>
      </Panel>

      <DataTable colonnes={colonnes} lignes={fournisseurs} vide="Aucun fournisseur trouvé." />

      <FormDialog
        open={creerDialog.open}
        onOpenChange={creerDialog.setOpen}
        titre={creerDialog.item ? "Modifier le fournisseur" : "Nouveau fournisseur"}
        onSubmit={enregistrer}
        large
      >
        <Grille>
          <Champ label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} />
          <Champ label="Raison sociale" value={form.raisonSociale} onChange={(v) => setForm({ ...form, raisonSociale: v })} />
          <Champ label="Contact" value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} />
          <Champ label="GSM" value={form.gsm} onChange={(v) => setForm({ ...form, gsm: v })} />
          <Champ label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Champ label="Adresse" value={form.adresse} onChange={(v) => setForm({ ...form, adresse: v })} />
          <Champ label="Ville" value={form.ville} onChange={(v) => setForm({ ...form, ville: v })} />
          <Champ label="Conditions" value={form.conditions} onChange={(v) => setForm({ ...form, conditions: v })} />
          <ChampCase label="Actif" checked={form.actif} onChange={(v) => setForm({ ...form, actif: v })} />
        </Grille>
        <ChampTexte label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
      </FormDialog>
    </div>
  );
}
