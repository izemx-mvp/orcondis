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
import { useBO, useLookups } from "@/lib/bo-store";
import { fr, CATEGORIES_DOC, SOURCES_DOC, uid, type DocumentBO } from "@/lib/bo-data";

export const Route = createFileRoute("/backoffice/dossiers")({
  head: () => ({
    meta: [
      { title: "Dossiers & Documents — Back-Office ORCONDIS" },
      { name: "description", content: "Gestion des dossiers clients et documents ORCONDIS." },
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
  const { data: opsData, ajouter, modifier, archiver, ajouterNote } = useOps();
  const { data: boData, add, patch, toggleArchive, log } = useBO();
  const lOps = useOpsLookups();
  const lBO = useLookups();

  const [ongletPrincipal, setOngletPrincipal] = useState("Dossiers");
  
  // Dossier states
  const [rechercheDos, setRechercheDos] = useState("");
  const [voirArchivesDos, setVoirArchivesDos] = useState(false);
  const detailDialogDos = useDialog<DossierOps>();
  const [ongletDetailDos, setOngletDetailDos] = useState("Informations");
  const nouveauDialogDos = useDialog<null>();
  const [formDos, setFormDos] = useState<DossierOps>(() => dossierVide(prochainNumeroDossier(opsData.dossiers)));

  // Document states
  const [rechercheDoc, setRechercheDoc] = useState("");
  const [voirArchivesDoc, setVoirArchivesDoc] = useState(false);

  const dossiers = useMemo(() => {
    return opsData.dossiers.filter(d => {
      if (d.archive !== voirArchivesDos) return false;
      if (rechercheDos && !`${d.numero} ${lOps.clientNom(d.clientId)} ${d.objet}`.toLowerCase().includes(rechercheDos.toLowerCase())) return false;
      return true;
    });
  }, [opsData.dossiers, voirArchivesDos, rechercheDos, lOps]);

  const documents = useMemo(() => {
    return boData.documents.filter(d => {
      if (voirArchivesDoc ? !d.archive : d.archive) return false;
      if (rechercheDoc && !`${d.nom} ${lBO.clientNom(d.clientId)}`.toLowerCase().includes(rechercheDoc.toLowerCase())) return false;
      return true;
    });
  }, [boData.documents, voirArchivesDoc, rechercheDoc, lBO]);

  const colonnesDos: Colonne<DossierOps>[] = [
    { cle: "numero", titre: "N°", rendu: (d) => <span className="font-medium text-navy">{d.numero}</span> },
    { cle: "client", titre: "Client", rendu: (d) => lOps.clientNom(d.clientId) },
    { cle: "objet", titre: "Objet", rendu: (d) => d.objet },
    { cle: "statut", titre: "Statut", rendu: (d) => <Statut ton={toneDossier(d.statut)}>{d.statut}</Statut> },
    { cle: "actions", titre: "Actions", align: "right", rendu: (d) => (
      <Button size="sm" variant="ghost" onClick={() => { setOngletDetailDos("Informations"); detailDialogDos.ouvrir(d); }}>Voir</Button>
    )}
  ];

  const colonnesDoc: Colonne<DocumentBO>[] = [
    { cle: "nom", titre: "Nom", rendu: (d) => <span className="font-medium text-navy">{d.nom}</span> },
    { cle: "type", titre: "Type", rendu: (d) => d.type },
    { cle: "client", titre: "Client", rendu: (d) => lBO.clientNom(d.clientId) },
    { cle: "date", titre: "Date", rendu: (d) => fr(d.date) },
    { cle: "actions", titre: "Actions", align: "right", rendu: (d) => (
      <Button size="sm" variant="ghost" onClick={() => toggleArchive("documents", d.id)}>{d.archive ? "Restaurer" : "Archiver"}</Button>
    )}
  ];

  return (
    <div className="space-y-6">
      <PageHeader titre="Dossiers & Documents" sous="Gestion des dossiers clients et bibliothèque documentaire." />
      <Onglets items={["Dossiers", "Documents"]} actif={ongletPrincipal} onChange={setOngletPrincipal} />

      {ongletPrincipal === "Dossiers" ? (
        <Panel titre="Dossiers" actions={<Button size="sm" onClick={() => { setFormDos(dossierVide(prochainNumeroDossier(opsData.dossiers))); nouveauDialogDos.ouvrir(null); }}>Nouveau Dossier</Button>}>
          <FilterBar>
            <SearchInput value={rechercheDos} onChange={setRechercheDos} placeholder="Rechercher un dossier..." />
            <Button size="sm" variant="ghost" onClick={() => setVoirArchivesDos(!voirArchivesDos)}>{voirArchivesDos ? "Voir actifs" : "Voir archives"}</Button>
          </FilterBar>
          <DataTable colonnes={colonnesDos} lignes={dossiers} vide="Aucun dossier trouvé." />
        </Panel>
      ) : (
        <Panel titre="Documents">
          <FilterBar>
            <SearchInput value={rechercheDoc} onChange={setRechercheDoc} placeholder="Rechercher un document..." />
            <Button size="sm" variant="ghost" onClick={() => setVoirArchivesDoc(!voirArchivesDoc)}>{voirArchivesDoc ? "Voir actifs" : "Voir archives"}</Button>
          </FilterBar>
          <DataTable colonnes={colonnesDoc} lignes={documents} vide="Aucun document trouvé." />
        </Panel>
      )}

      {detailDialogDos.item && (
        <FormDialog open={detailDialogDos.open} onOpenChange={detailDialogDos.setOpen} titre={`Dossier ${detailDialogDos.item.numero}`} large>
           <Onglets items={["Informations", "Documents", "Historique"]} actif={ongletDetailDos} onChange={setOngletDetailDos} />
           {ongletDetailDos === "Informations" && (
             <Grille>
               <Detail label="Client">{lOps.clientNom(detailDialogDos.item.clientId)}</Detail>
               <Detail label="Objet">{detailDialogDos.item.objet}</Detail>
               <Detail label="Statut">{detailDialogDos.item.statut}</Detail>
               <Detail label="Description">{detailDialogDos.item.description}</Detail>
             </Grille>
           )}
           {ongletDetailDos === "Documents" && (
             <ul className="space-y-2">
               {boData.documents.filter(d => d.dossierId === detailDialogDos.item?.id).map(d => (
                 <li key={d.id} className="rounded-md border p-2 text-sm">{d.nom} ({d.type})</li>
               ))}
             </ul>
           )}
        </FormDialog>
      )}
    </div>
  );
}
