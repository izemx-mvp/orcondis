// ORCONDIS — Référentiels simples (nom + description + actif), avec protection des éléments système.
import { ReferentielTable } from "./generic";
import type { Referentiel } from "@/lib/bo-data";

const systeme = (item: Referentiel) => Boolean((item as { systeme?: boolean }).systeme);

export function SectionTypesCourse() {
  return (
    <ReferentielTable<Referentiel>
      collectionKey="typesCourse"
      entiteLabel="Type de course"
      idPrefix="TC"
      titre="Types de course"
      sous="Nature des courses réalisées (simple, multi-destinations, dépôt greffe…)."
    />
  );
}

export function SectionTypesClient() {
  return (
    <ReferentielTable<Referentiel>
      collectionKey="typesClient"
      entiteLabel="Type de client"
      idPrefix="TCL"
      titre="Types de client"
      sous="Catégories utilisées pour qualifier les clients. Les types par défaut peuvent être modifiés ou désactivés mais pas supprimés."
      nonDeletable={systeme}
    />
  );
}

export function SectionTypesContact() {
  return (
    <ReferentielTable<Referentiel>
      collectionKey="typesContact"
      entiteLabel="Type de contact"
      idPrefix="TCO"
      titre="Types de contact"
      sous="Rôle des contacts au sein des fiches client (décideur, opérationnel, comptabilité…)."
    />
  );
}

export function SectionTransports() {
  return (
    <ReferentielTable<Referentiel>
      collectionKey="transports"
      entiteLabel="Mode de transport"
      idPrefix="TR"
      titre="Modes de transport"
      sous="Moyens de transport utilisables par les coursiers pour la réalisation des courses."
    />
  );
}

export function SectionPriorites() {
  return (
    <ReferentielTable<Referentiel>
      collectionKey="priorites"
      entiteLabel="Priorité"
      idPrefix="PR"
      titre="Priorités"
      sous="Niveaux de priorité applicables aux demandes, dossiers et courses."
    />
  );
}

export function SectionTranchesHoraires() {
  return (
    <ReferentielTable<Referentiel>
      collectionKey="tranchesHoraires"
      entiteLabel="Tranche horaire"
      idPrefix="TH"
      titre="Tranches horaires"
      sous="Créneaux proposés pour la planification des courses."
    />
  );
}

export function SectionProcedures() {
  return (
    <ReferentielTable<Referentiel>
      collectionKey="procedures"
      entiteLabel="Modèle de procédure"
      idPrefix="PC"
      titre="Modèles de procédures"
      sous="Étapes types associées aux services, décrites dans la description de chaque modèle."
    />
  );
}
