import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useBO, useLookups } from "@/lib/bo-store";
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
      { name: "description", content: "Gestion des fournisseurs et des paiements fournisseurs." },
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
  const { data, add, patch, toggleArchive } = useBO();
  const l = useLookups();
  const [recherche, setRecherche] = useState("");
  const [onglet, setOnglet] = useState("Fournisseurs");
  
  const fournisseurs = useMemo(() => {
    return data.fournisseurs.filter(f => !f.archive && (recherche ? `${f.code} ${f.raisonSociale}`.toLowerCase().includes(recherche.toLowerCase()) : true));
  }, [data.fournisseurs, recherche]);

  const paiementsFournisseurs = useMemo(() => {
    return data.paiements.filter(p => !!p.fournisseurId && !p.archive);
  }, [data.paiements]);

  const creerDialog = useDialog<Fournisseur | null>();
  const [form, setForm] = useState<Omit<Fournisseur, "id">>(FOURNISSEUR_VIDE);

  return (
    <div className="space-y-6">
      <PageHeader titre="Fournisseurs" sous="Gestion des fournisseurs et des paiements fournisseurs." />
      <Onglets items={["Fournisseurs", "Paiements"]} actif={onglet} onChange={setOnglet} />

      {onglet === "Fournisseurs" ? (
        <Panel titre="Liste des fournisseurs" actions={<Button size="sm" onClick={() => { setForm(FOURNISSEUR_VIDE); creerDialog.ouvrir(null); }}>Nouveau Fournisseur</Button>}>
          <FilterBar>
            <SearchInput value={recherche} onChange={setRecherche} placeholder="Rechercher..." />
          </FilterBar>
          <DataTable 
            colonnes={[
              { cle: "code", titre: "Code", rendu: (f) => <span className="font-mono text-xs">{f.code}</span> },
              { cle: "raison", titre: "Raison sociale", rendu: (f) => <span className="font-medium text-navy">{f.raisonSociale}</span> },
              { cle: "contact", titre: "Contact", rendu: (f) => f.contact },
              { cle: "statut", titre: "Statut", rendu: (f) => <Statut ton={tonStatut(f.actif ? "Actif" : "Inactif")}>{f.actif ? "Actif" : "Inactif"}</Statut> },
              { cle: "actions", titre: "Actions", align: "right", rendu: (f) => (
                <Button size="sm" variant="ghost" onClick={() => { setForm(f); creerDialog.ouvrir(f); }}>Modifier</Button>
              )}
            ]}
            lignes={fournisseurs}
            vide="Aucun fournisseur trouvé."
          />
        </Panel>
      ) : (
        <Panel titre="Paiements fournisseurs">
          <DataTable 
            colonnes={[
              { cle: "numero", titre: "N°", rendu: (p) => <span className="font-mono text-xs">{p.numero}</span> },
              { cle: "fournisseur", titre: "Fournisseur", rendu: (p) => l.fournisseurNom(p.fournisseurId) },
              { cle: "montant", titre: "Montant", rendu: (p) => dh(p.montant, p.devise) },
              { cle: "statut", titre: "Statut", rendu: (p) => <Statut ton={tonStatut(p.statut)}>{p.statut}</Statut> },
            ]}
            lignes={paiementsFournisseurs}
            vide="Aucun paiement trouvé."
          />
        </Panel>
      )}

      <FormDialog open={creerDialog.open} onOpenChange={creerDialog.setOpen} titre={creerDialog.item ? "Modifier Fournisseur" : "Nouveau Fournisseur"} onSubmit={() => {
        if (creerDialog.item) patch("fournisseurs", creerDialog.item.id, form);
        else add("fournisseurs", { id: uid("FRS"), ...form, code: form.code || uid("FRS") });
      }} large>
        <Grille>
          <Champ label="Raison sociale" value={form.raisonSociale} onChange={(v) => setForm({...form, raisonSociale: v})} />
          <Champ label="Contact" value={form.contact} onChange={(v) => setForm({...form, contact: v})} />
          <Champ label="GSM" value={form.gsm} onChange={(v) => setForm({...form, gsm: v})} />
          <ChampCase label="Actif" checked={form.actif} onChange={(v) => setForm({...form, actif: v})} />
        </Grille>
      </FormDialog>
    </div>
  );
}
