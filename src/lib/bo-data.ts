// ORCONDIS — Modèle de données opérationnel (Partie 3)
// Données simulées cohérentes, aucune valeur tarifaire codée en dur dans la logique :
// tous les montants proviennent des règles de tarification configurables ci-dessous.

import { seedConversations, type Conversation } from "./bo-whatsapp";
export type { Conversation };

export const iso = (d: Date) => d.toISOString().slice(0, 10);
export const today = () => iso(new Date());
export const daysAgo = (n: number) => iso(new Date(Date.now() - n * 86400000));
export const daysAhead = (n: number) => iso(new Date(Date.now() + n * 86400000));

export function fr(dateIso: string) {
  if (!dateIso) return "—";
  const [a, m, j] = dateIso.split("-");
  return `${j}/${m}/${a}`;
}

export function dh(v: number, devise = "MAD") {
  return `${new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)} ${devise}`;
}

let seq = 500;
export function uid(prefix = "id") {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq.toString(36)}`;
}

/* ------------------------------------------------------------------ */
/* Référentiels (Paramètres)                                           */
/* ------------------------------------------------------------------ */

export type Referentiel = {
  id: string;
  nom: string;
  description?: string;
  actif: boolean;
  archive?: boolean;
  [k: string]: unknown;
};

export type ServiceParam = Referentiel & { prixDefaut: number; procedure: string };
export type ZoneParam = Referentiel & { ville: string; quartiers: string };

/* ------------------------------------------------------------------ */
/* Clients                                                             */
/* ------------------------------------------------------------------ */

export type ContactClient = {
  id: string;
  nom: string;
  fonction: string;
  gsm: string;
  email: string;
  type: string;
  actif: boolean;
};

export type Client = {
  id: string;
  code: string;
  raisonSociale: string;
  type: string;
  ice: string;
  contactPrincipal: string;
  gsm: string;
  whatsapp: string;
  email: string;
  adresse: string;
  ville: string;
  zone: string;
  frequenceFacturation: FrequenceFacturation;
  conditionsPaiement: string;
  notes: string;
  actif: boolean;
  archive: boolean;
  contacts: ContactClient[];
  creeLe: string;
};

export const FREQUENCES = [
  "Par course",
  "Journalière",
  "Hebdomadaire",
  "Quinzaine",
  "Mensuelle",
  "Par dossier",
  "Forfait",
  "Personnalisée",
] as const;
export type FrequenceFacturation = (typeof FREQUENCES)[number];

/* ------------------------------------------------------------------ */
/* Dossiers                                                            */
/* ------------------------------------------------------------------ */

export type Dossier = {
  id: string;
  numero: string;
  intitule: string;
  clientId: string;
  service: string;
  responsable: string;
  statut: "Ouvert" | "En cours" | "En attente" | "Clôturé" | "Annulé";
  priorite: "Basse" | "Normale" | "Haute" | "Critique";
  dateOuverture: string;
  dateCloture: string;
  procedures: string[];
  notes: string;
  archive: boolean;
};

/* ------------------------------------------------------------------ */
/* Coursiers                                                           */
/* ------------------------------------------------------------------ */

export type Coursier = {
  id: string;
  code: string;
  nom: string;
  gsm: string;
  transport: string;
  zone: string;
  statut: "Disponible" | "En mission" | "Indisponible" | "Congé";
  actif: boolean;
  archive: boolean;
};

/* ------------------------------------------------------------------ */
/* Courses                                                             */
/* ------------------------------------------------------------------ */

export const STATUTS_COURSE = [
  "À affecter",
  "Affectée",
  "Acceptée",
  "En cours",
  "Bloquée",
  "Terminée",
  "Validée client",
  "À facturer",
  "Facturée",
  "Annulée",
] as const;
export type StatutCourse = (typeof STATUTS_COURSE)[number];

export type Destination = {
  id: string;
  libelle: string;
  ville: string;
  zone: string;
  contact: string;
  gsm: string;
};

export type Course = {
  id: string;
  numero: string;
  clientId: string;
  dossierId: string;
  demandeNumero: string;
  service: string;
  typeCourse: string;
  priorite: "Normale" | "Urgente" | "Exclusive";
  transport: string;
  date: string;
  trancheHoraire: string;
  coursierId: string;
  retrait: Destination;
  destinations: Destination[];
  statut: StatutCourse;
  kmDepart: number;
  kmArrivee: number;
  kmMission: number;
  kmVide: number;
  heureArrivee: string;
  heureDepart: string;
  attenteMinutes: number;
  fraisSupplementaires: number;
  nuit: boolean;
  weekend: boolean;
  validationClient: {
    demandeeLe: string;
    reponse: "Validée" | "Problème signalé" | "En attente" | "";
    commentaire: string;
    heure: string;
  };
  factureId: string;
  notes: string;
  archive: boolean;
};

/* ------------------------------------------------------------------ */
/* Fournisseurs & paiements                                            */
/* ------------------------------------------------------------------ */

export type Fournisseur = {
  id: string;
  code: string;
  raisonSociale: string;
  contact: string;
  gsm: string;
  email: string;
  adresse: string;
  ville: string;
  zone: string;
  conditions: string;
  notes: string;
  actif: boolean;
  archive: boolean;
};

export const MOYENS_PAIEMENT = ["Chèque", "Espèces", "Virement", "Autre"] as const;
export const STATUTS_PAIEMENT = [
  "À recevoir",
  "Chèque reçu",
  "À payer",
  "Affecté au coursier",
  "En cours",
  "Paiement effectué",
  "Justificatif reçu",
  "Validé",
  "Annulé",
] as const;
export type StatutPaiement = (typeof STATUTS_PAIEMENT)[number];

export type Paiement = {
  id: string;
  numero: string;
  clientId: string;
  dossierId: string;
  courseId: string;
  fournisseurId: string;
  montant: number;
  devise: string;
  moyen: (typeof MOYENS_PAIEMENT)[number];
  numeroCheque: string;
  banque: string;
  dateCheque: string;
  coursierId: string;
  datePrevue: string;
  datePaiement: string;
  heure: string;
  justificatif: string;
  photoRecu: string;
  documentId: string;
  notes: string;
  statut: StatutPaiement;
  archive: boolean;
};

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

export const CATEGORIES_DOC = [
  "Document client",
  "Document contact",
  "Document dossier",
  "Document course",
  "Chèque",
  "Facture",
  "Reçu",
  "Bon",
  "Document administratif",
  "Photo",
  "Justificatif",
  "Autre",
] as const;

export const SOURCES_DOC = ["Site web", "WhatsApp", "Coursier", "Back-Office"] as const;

export type DocumentBO = {
  id: string;
  nom: string;
  type: string;
  categorie: (typeof CATEGORIES_DOC)[number];
  clientId: string;
  dossierId: string;
  courseId: string;
  paiementId: string;
  date: string;
  ajoutePar: string;
  source: (typeof SOURCES_DOC)[number];
  notes: string;
  archive: boolean;
};

/* ------------------------------------------------------------------ */
/* Tarification & facturation                                          */
/* ------------------------------------------------------------------ */

export type Tarif = {
  id: string;
  clientId: string; // "" = tarif général
  service: string;
  typeCourse: string;
  zoneDepart: string;
  zoneArrivee: string;
  transport: string;
  prixFixe: number;
  prixKm: number;
  prixKmVide: number;
  facturerKmMission: boolean;
  facturerKmVide: boolean;
  tarifAttente: number; // par minute facturable
  franchiseAttente: number; // minutes gratuites
  majorationUrgence: number; // %
  majorationNuit: number; // %
  majorationWeekend: number; // %
  prixDestinationSup: number;
  forfait: number;
  dateDebut: string;
  dateFin: string;
  actif: boolean;
  archive: boolean;
};

export const STATUTS_FACTURE = [
  "Brouillon",
  "À valider",
  "Émise",
  "Envoyée",
  "Partiellement payée",
  "Payée",
  "En retard",
  "Annulée",
] as const;
export type StatutFacture = (typeof STATUTS_FACTURE)[number];

export type LigneFacture = {
  id: string;
  courseId: string;
  libelle: string;
  montant: number;
};

export type ReglementFacture = {
  id: string;
  date: string;
  montant: number;
  moyen: string;
  reference: string;
};

export type Facture = {
  id: string;
  numero: string;
  clientId: string;
  periode: string;
  dateDebut: string;
  dateFin: string;
  dossiers: string[];
  lignes: LigneFacture[];
  frais: number;
  remises: number;
  tauxTaxe: number;
  dateEmission: string;
  dateEcheance: string;
  statut: StatutFacture;
  reglements: ReglementFacture[];
  notes: string;
  archive: boolean;
};

/* ------------------------------------------------------------------ */
/* Utilisateurs, rôles, notifications, audit                           */
/* ------------------------------------------------------------------ */

export const PERMISSIONS = [
  "Voir",
  "Créer",
  "Modifier",
  "Archiver",
  "Affecter",
  "Valider",
  "Facturer",
  "Exporter",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export type Role = {
  id: string;
  nom: string;
  description: string;
  permissions: Permission[];
  systeme: boolean;
  actif: boolean;
  archive: boolean;
};

export type Utilisateur = {
  id: string;
  nom: string;
  email: string;
  gsm: string;
  role: string;
  actif: boolean;
  archive: boolean;
};

export type Notification = {
  id: string;
  type: string;
  titre: string;
  detail: string;
  date: string;
  lien: string;
  lue: boolean;
  gravite: "info" | "alerte" | "critique";
};

export type AuditEntry = {
  id: string;
  entite: string;
  entiteId: string;
  utilisateur: string;
  action: string;
  date: string;
  heure: string;
  ancienneValeur: string;
  nouvelleValeur: string;
};

export type MessageClient = {
  id: string;
  clientId: string;
  courseId: string;
  modele: string;
  texte: string;
  date: string;
  heure: string;
  canal: "WhatsApp";
  reponse: string;
  commentaire: string;
};

/* ------------------------------------------------------------------ */
/* Calculs de facturation (règles configurables)                       */
/* ------------------------------------------------------------------ */

export type LigneCalcul = { libelle: string; montant: number };

export function tarifApplicable(tarifs: Tarif[], course: Course): Tarif | undefined {
  const candidats = tarifs.filter(
    (t) =>
      t.actif &&
      !t.archive &&
      (t.clientId === course.clientId || t.clientId === "") &&
      (t.service === course.service || t.service === "Tous services") &&
      (t.zoneDepart === course.retrait.zone || t.zoneDepart === "Toutes zones") &&
      (t.zoneArrivee === (course.destinations[0]?.zone ?? "") || t.zoneArrivee === "Toutes zones"),
  );
  candidats.sort((a, b) => (a.clientId ? 0 : 1) - (b.clientId ? 0 : 1));
  return candidats[0] ?? tarifs.find((t) => t.clientId === "" && t.service === "Tous services");
}

export function calculerCourse(course: Course, tarif: Tarif | undefined) {
  const lignes: LigneCalcul[] = [];
  if (!tarif) return { lignes, total: 0, tarif };

  const base = tarif.forfait > 0 ? tarif.forfait : tarif.prixFixe;
  if (base > 0) lignes.push({ libelle: tarif.forfait > 0 ? "Forfait" : "Prestation (prix fixe)", montant: base });

  if (tarif.facturerKmMission && course.kmMission > 0 && tarif.prixKm > 0)
    lignes.push({
      libelle: `Kilomètres mission (${course.kmMission} km × ${dh(tarif.prixKm)})`,
      montant: course.kmMission * tarif.prixKm,
    });

  if (tarif.facturerKmVide && course.kmVide > 0 && tarif.prixKmVide > 0)
    lignes.push({
      libelle: `Kilomètres à vide (${course.kmVide} km × ${dh(tarif.prixKmVide)})`,
      montant: course.kmVide * tarif.prixKmVide,
    });

  const attenteFacturable = Math.max(0, course.attenteMinutes - tarif.franchiseAttente);
  if (attenteFacturable > 0 && tarif.tarifAttente > 0)
    lignes.push({
      libelle: `Temps d’attente facturable (${attenteFacturable} min, franchise ${tarif.franchiseAttente} min)`,
      montant: attenteFacturable * tarif.tarifAttente,
    });

  const destSup = Math.max(0, course.destinations.length - 1);
  if (destSup > 0 && tarif.prixDestinationSup > 0)
    lignes.push({
      libelle: `Destination(s) supplémentaire(s) × ${destSup}`,
      montant: destSup * tarif.prixDestinationSup,
    });

  if (course.fraisSupplementaires > 0)
    lignes.push({ libelle: "Frais supplémentaires", montant: course.fraisSupplementaires });

  let sousTotal = lignes.reduce((s, l) => s + l.montant, 0);

  const maj = (taux: number, libelle: string) => {
    if (taux > 0) {
      const m = (sousTotal * taux) / 100;
      lignes.push({ libelle: `${libelle} (+${taux} %)`, montant: m });
      sousTotal += m;
    }
  };
  if (course.priorite === "Urgente") maj(tarif.majorationUrgence, "Majoration urgence");
  if (course.nuit) maj(tarif.majorationNuit, "Majoration nuit");
  if (course.weekend) maj(tarif.majorationWeekend, "Majoration week-end");

  return { lignes, total: Math.round(sousTotal * 100) / 100, tarif };
}

export function totalFacture(f: Facture) {
  const sousTotal = f.lignes.reduce((s, l) => s + l.montant, 0);
  const base = sousTotal + f.frais - f.remises;
  const taxes = (base * f.tauxTaxe) / 100;
  const total = Math.round((base + taxes) * 100) / 100;
  const paye = f.reglements.reduce((s, r) => s + r.montant, 0);
  return { sousTotal, taxes, total, paye, reste: Math.round((total - paye) * 100) / 100 };
}

/* ------------------------------------------------------------------ */
/* Données simulées                                                    */
/* ------------------------------------------------------------------ */

export type BOData = {
  clients: Client[];
  dossiers: Dossier[];
  coursiers: Coursier[];
  courses: Course[];
  fournisseurs: Fournisseur[];
  paiements: Paiement[];
  documents: DocumentBO[];
  tarifs: Tarif[];
  factures: Facture[];
  utilisateurs: Utilisateur[];
  roles: Role[];
  notifications: Notification[];
  audit: AuditEntry[];
  messages: MessageClient[];
  conversations: Conversation[];
  societe: {
    nom: string;
    nomCommercial: string;
    telephone: string;
    email: string;
    horaires: string;
    villePrincipale: string;
    description: string;
  };
  regles: {
    commandeVeilleObligatoire: boolean;
    autoriserDemandeMemeJour: boolean;
    supplementMemeJour: string;
    rayonStandardKm: number;
    poidsMaxStandardKg: number;
    tarifMensuelMin: number;
  };
  services: ServiceParam[];
  typesCourse: Referentiel[];
  typesClient: Referentiel[];
  typesContact: Referentiel[];
  zones: ZoneParam[];
  transports: Referentiel[];
  priorites: Referentiel[];
  tranchesHoraires: Referentiel[];
  procedures: Referentiel[];
  modelesNotification: Referentiel[];
  whatsapp: {
    numero: string;
    agentActif: boolean;
    messageBienvenue: string;
    tonalite: string;
    handoffHumain: string;
    horaires: string;
  };
};

const ref = (id: string, nom: string, description = ""): Referentiel => ({
  id,
  nom,
  description,
  actif: true,
  archive: false,
});

export function seedBO(): BOData {
  const clients: Client[] = [
    {
      id: "CLI-001",
      code: "CLI-001",
      raisonSociale: "Atlas Industrie SARL",
      type: "Entreprise",
      ice: "001789456000042",
      contactPrincipal: "Karim Benjelloun",
      gsm: "+212 661 45 22 10",
      whatsapp: "+212 661 45 22 10",
      email: "k.benjelloun@atlas-industrie.ma",
      adresse: "12, rue Ibnou Mounir, Maarif",
      ville: "Casablanca",
      zone: "Zone A",
      frequenceFacturation: "Mensuelle",
      conditionsPaiement: "30 jours fin de mois",
      notes: "Client prioritaire — validation systématique avant facturation.",
      actif: true,
      archive: false,
      creeLe: daysAgo(420),
      contacts: [
        { id: "CT-1", nom: "Karim Benjelloun", fonction: "Directeur administratif", gsm: "+212 661 45 22 10", email: "k.benjelloun@atlas-industrie.ma", type: "Décideur", actif: true },
        { id: "CT-2", nom: "Sanae Rmiki", fonction: "Comptabilité", gsm: "+212 662 11 08 34", email: "compta@atlas-industrie.ma", type: "Comptabilité", actif: true },
      ],
    },
    {
      id: "CLI-002",
      code: "CLI-002",
      raisonSociale: "Cabinet Lahlou & Associés",
      type: "Profession libérale",
      ice: "002456123000077",
      contactPrincipal: "Me Nabil Lahlou",
      gsm: "+212 663 78 90 12",
      whatsapp: "+212 663 78 90 12",
      email: "contact@lahlou-avocats.ma",
      adresse: "8, boulevard Anfa",
      ville: "Casablanca",
      zone: "Zone A",
      frequenceFacturation: "Par dossier",
      conditionsPaiement: "Paiement à réception",
      notes: "Documents confidentiels — remise en main propre obligatoire.",
      actif: true,
      archive: false,
      creeLe: daysAgo(310),
      contacts: [
        { id: "CT-3", nom: "Me Nabil Lahlou", fonction: "Associé", gsm: "+212 663 78 90 12", email: "n.lahlou@lahlou-avocats.ma", type: "Décideur", actif: true },
        { id: "CT-4", nom: "Imane Sabir", fonction: "Assistante juridique", gsm: "+212 664 22 51 77", email: "i.sabir@lahlou-avocats.ma", type: "Opérationnel", actif: true },
      ],
    },
    {
      id: "CLI-003",
      code: "CLI-003",
      raisonSociale: "Pharma Distrib Maroc",
      type: "Entreprise",
      ice: "003112998000015",
      contactPrincipal: "Hicham Filali",
      gsm: "+212 667 30 44 21",
      whatsapp: "+212 667 30 44 21",
      email: "h.filali@pharmadistrib.ma",
      adresse: "Zone industrielle Sidi Maârouf, lot 118",
      ville: "Casablanca",
      zone: "Zone B",
      frequenceFacturation: "Hebdomadaire",
      conditionsPaiement: "15 jours",
      notes: "Fort volume de courses urgentes en fin de semaine.",
      actif: true,
      archive: false,
      creeLe: daysAgo(260),
      contacts: [
        { id: "CT-5", nom: "Hicham Filali", fonction: "Responsable logistique", gsm: "+212 667 30 44 21", email: "h.filali@pharmadistrib.ma", type: "Opérationnel", actif: true },
      ],
    },
    {
      id: "CLI-004",
      code: "CLI-004",
      raisonSociale: "Résidences Zerktouni",
      type: "Syndic",
      ice: "004778211000033",
      contactPrincipal: "Latifa Amrani",
      gsm: "+212 668 15 62 90",
      whatsapp: "+212 668 15 62 90",
      email: "syndic@residences-zerktouni.ma",
      adresse: "45, boulevard Zerktouni",
      ville: "Casablanca",
      zone: "Zone A",
      frequenceFacturation: "Quinzaine",
      conditionsPaiement: "30 jours",
      notes: "Paiements fournisseurs récurrents par chèque.",
      actif: true,
      archive: false,
      creeLe: daysAgo(180),
      contacts: [
        { id: "CT-6", nom: "Latifa Amrani", fonction: "Gestionnaire", gsm: "+212 668 15 62 90", email: "syndic@residences-zerktouni.ma", type: "Décideur", actif: true },
      ],
    },
    {
      id: "CLI-005",
      code: "CLI-005",
      raisonSociale: "Younes Berrada",
      type: "Particulier",
      ice: "—",
      contactPrincipal: "Younes Berrada",
      gsm: "+212 669 84 12 03",
      whatsapp: "+212 669 84 12 03",
      email: "younes.berrada@gmail.com",
      adresse: "Résidence Al Manar, Californie",
      ville: "Casablanca",
      zone: "Zone C",
      frequenceFacturation: "Par course",
      conditionsPaiement: "Paiement immédiat",
      notes: "Démarches administratives ponctuelles.",
      actif: true,
      archive: false,
      creeLe: daysAgo(90),
      contacts: [
        { id: "CT-7", nom: "Younes Berrada", fonction: "—", gsm: "+212 669 84 12 03", email: "younes.berrada@gmail.com", type: "Décideur", actif: true },
      ],
    },
    {
      id: "CLI-006",
      code: "CLI-006",
      raisonSociale: "Sofratech Ingénierie",
      type: "Entreprise",
      ice: "005998112000021",
      contactPrincipal: "Rachida Ait Ali",
      gsm: "+212 661 09 77 45",
      whatsapp: "+212 661 09 77 45",
      email: "r.aitali@sofratech.ma",
      adresse: "Technopark, bureau 312",
      ville: "Casablanca",
      zone: "Zone B",
      frequenceFacturation: "Mensuelle",
      conditionsPaiement: "45 jours",
      notes: "",
      actif: true,
      archive: false,
      creeLe: daysAgo(60),
      contacts: [
        { id: "CT-8", nom: "Rachida Ait Ali", fonction: "Office manager", gsm: "+212 661 09 77 45", email: "r.aitali@sofratech.ma", type: "Opérationnel", actif: true },
      ],
    },
  ];

  const dossiers: Dossier[] = [
    { id: "DOS-2401", numero: "DOS-2401", intitule: "Paiements fournisseurs — trimestre en cours", clientId: "CLI-001", service: "Paiement de fournisseurs", responsable: "Yassine Bennani", statut: "En cours", priorite: "Haute", dateOuverture: daysAgo(38), dateCloture: "", procedures: ["Récupération chèque", "Paiement fournisseur", "Retour justificatif"], notes: "Deux fournisseurs récurrents.", archive: false },
    { id: "DOS-2402", numero: "DOS-2402", intitule: "Constitution dossier tribunal — affaire Sekkat", clientId: "CLI-002", service: "Procédures administratives", responsable: "Salma Idrissi", statut: "En cours", priorite: "Critique", dateOuverture: daysAgo(21), dateCloture: "", procedures: ["Dépôt greffe", "Retrait copie certifiée"], notes: "Délai légal impératif.", archive: false },
    { id: "DOS-2403", numero: "DOS-2403", intitule: "Livraisons pharmacies — semaine courante", clientId: "CLI-003", service: "Livraison de documents", responsable: "Hamza Ouali", statut: "En cours", priorite: "Normale", dateOuverture: daysAgo(6), dateCloture: "", procedures: ["Livraison multi-destinations"], notes: "", archive: false },
    { id: "DOS-2404", numero: "DOS-2404", intitule: "Règlement prestataires syndic", clientId: "CLI-004", service: "Paiement de fournisseurs", responsable: "Nadia Cherkaoui", statut: "Ouvert", priorite: "Normale", dateOuverture: daysAgo(12), dateCloture: "", procedures: ["Récupération chèque", "Paiement fournisseur"], notes: "", archive: false },
    { id: "DOS-2405", numero: "DOS-2405", intitule: "Renouvellement carte grise", clientId: "CLI-005", service: "Courses administratives", responsable: "Salma Idrissi", statut: "Clôturé", priorite: "Normale", dateOuverture: daysAgo(45), dateCloture: daysAgo(30), procedures: ["Dépôt dossier", "Retrait document"], notes: "Dossier clôturé et facturé.", archive: false },
    { id: "DOS-2406", numero: "DOS-2406", intitule: "Appels d’offres — dépôts administratifs", clientId: "CLI-006", service: "Procédures administratives", responsable: "Yassine Bennani", statut: "En attente", priorite: "Haute", dateOuverture: daysAgo(9), dateCloture: "", procedures: ["Dépôt pli", "Accusé de réception"], notes: "En attente de pièces client.", archive: false },
  ];

  const coursiers: Coursier[] = [
    { id: "COU-01", code: "COU-01", nom: "Mehdi Ait Taleb", gsm: "+212 670 11 22 33", transport: "Moto", zone: "Zone A", statut: "En mission", actif: true, archive: false },
    { id: "COU-02", code: "COU-02", nom: "Abdelilah Ziani", gsm: "+212 670 44 55 66", transport: "Moto", zone: "Zone B", statut: "Disponible", actif: true, archive: false },
    { id: "COU-03", code: "COU-03", nom: "Soufiane Kabbaj", gsm: "+212 671 77 88 99", transport: "Voiture", zone: "Zone C", statut: "Disponible", actif: true, archive: false },
    { id: "COU-04", code: "COU-04", nom: "Ilyas Naciri", gsm: "+212 672 10 20 30", transport: "Bicyclette", zone: "Zone A", statut: "Indisponible", actif: true, archive: false },
    { id: "COU-05", code: "COU-05", nom: "Anas Chraibi", gsm: "+212 673 40 50 60", transport: "Moto", zone: "Zone B", statut: "Disponible", actif: true, archive: false },
  ];

  const adr = (libelle: string, ville: string, zone: string, contact: string, gsm: string): Destination => ({
    id: uid("adr"),
    libelle,
    ville,
    zone,
    contact,
    gsm,
  });

  const mkCourse = (c: Partial<Course> & { numero: string; clientId: string }): Course => ({
    id: c.numero,
    dossierId: "",
    demandeNumero: "",
    service: "Livraison de documents",
    typeCourse: "Simple",
    priorite: "Normale",
    transport: "Moto",
    date: today(),
    trancheHoraire: "Matin (08h – 12h)",
    coursierId: "",
    retrait: adr("Siège client", "Casablanca", "Zone A", "Accueil", "+212 522 00 00 00"),
    destinations: [],
    statut: "À affecter",
    kmDepart: 0,
    kmArrivee: 0,
    kmMission: 0,
    kmVide: 0,
    heureArrivee: "",
    heureDepart: "",
    attenteMinutes: 0,
    fraisSupplementaires: 0,
    nuit: false,
    weekend: false,
    validationClient: { demandeeLe: "", reponse: "", commentaire: "", heure: "" },
    factureId: "",
    notes: "",
    archive: false,
    ...c,
  } as Course);

  const courses: Course[] = [
    mkCourse({
      numero: "CRS-3101",
      clientId: "CLI-001",
      dossierId: "DOS-2401",
      demandeNumero: "DEM-1041",
      service: "Récupération de chèques",
      typeCourse: "Récupération + paiement fournisseur",
      priorite: "Urgente",
      date: daysAgo(2),
      coursierId: "COU-01",
      statut: "À facturer",
      retrait: adr("Atlas Industrie — Maarif", "Casablanca", "Zone A", "Karim Benjelloun", "+212 661 45 22 10"),
      destinations: [adr("Fournitures Atlas — Aïn Sebaâ", "Casablanca", "Zone C", "M. Rachid", "+212 522 66 14 05")],
      kmDepart: 12480,
      kmArrivee: 12491,
      kmMission: 7,
      kmVide: 4,
      heureArrivee: "09:20",
      heureDepart: "09:52",
      attenteMinutes: 32,
      validationClient: { demandeeLe: daysAgo(2), reponse: "Validée", commentaire: "Reçu conforme.", heure: "18:04" },
    }),
    mkCourse({
      numero: "CRS-3102",
      clientId: "CLI-002",
      dossierId: "DOS-2402",
      service: "Procédures administratives",
      typeCourse: "Dépôt greffe",
      date: daysAgo(1),
      coursierId: "COU-03",
      transport: "Voiture",
      statut: "Validée client",
      retrait: adr("Cabinet Lahlou — Anfa", "Casablanca", "Zone A", "Imane Sabir", "+212 664 22 51 77"),
      destinations: [adr("Tribunal de commerce", "Casablanca", "Zone B", "Greffe", "+212 522 30 11 22")],
      kmDepart: 45210,
      kmArrivee: 45224,
      kmMission: 9,
      kmVide: 5,
      heureArrivee: "10:05",
      heureDepart: "11:10",
      attenteMinutes: 65,
      validationClient: { demandeeLe: daysAgo(1), reponse: "Validée", commentaire: "", heure: "16:30" },
    }),
    mkCourse({
      numero: "CRS-3103",
      clientId: "CLI-003",
      dossierId: "DOS-2403",
      service: "Livraison de documents",
      typeCourse: "Multi-destinations",
      date: today(),
      coursierId: "COU-02",
      statut: "En cours",
      retrait: adr("Pharma Distrib — Sidi Maârouf", "Casablanca", "Zone B", "Hicham Filali", "+212 667 30 44 21"),
      destinations: [
        adr("Pharmacie Al Massira", "Casablanca", "Zone B", "Dr. Alaoui", "+212 522 55 66 77"),
        adr("Pharmacie Ghandi", "Casablanca", "Zone A", "Dr. Saoud", "+212 522 88 99 00"),
      ],
      kmDepart: 30110,
      kmArrivee: 0,
      kmMission: 0,
      kmVide: 3,
      trancheHoraire: "Après-midi (14h – 18h)",
    }),
    mkCourse({
      numero: "CRS-3104",
      clientId: "CLI-004",
      dossierId: "DOS-2404",
      service: "Paiement de fournisseurs",
      typeCourse: "Récupération chèque + règlement",
      date: today(),
      coursierId: "",
      statut: "À affecter",
      priorite: "Urgente",
      retrait: adr("Résidences Zerktouni", "Casablanca", "Zone A", "Latifa Amrani", "+212 668 15 62 90"),
      destinations: [adr("Sté Propreté Plus", "Casablanca", "Zone C", "M. Hakim", "+212 522 44 33 22")],
    }),
    mkCourse({
      numero: "CRS-3105",
      clientId: "CLI-005",
      dossierId: "DOS-2405",
      service: "Courses administratives",
      typeCourse: "Dépôt + retrait",
      date: daysAgo(31),
      coursierId: "COU-03",
      transport: "Voiture",
      statut: "Facturée",
      factureId: "FAC-2026-0007",
      retrait: adr("Résidence Al Manar — Californie", "Casablanca", "Zone C", "Younes Berrada", "+212 669 84 12 03"),
      destinations: [adr("Centre d’immatriculation", "Casablanca", "Zone B", "Guichet 4", "+212 522 12 34 56")],
      kmMission: 15,
      kmVide: 6,
      attenteMinutes: 45,
      heureArrivee: "09:00",
      heureDepart: "09:45",
      validationClient: { demandeeLe: daysAgo(31), reponse: "Validée", commentaire: "", heure: "17:12" },
    }),
    mkCourse({
      numero: "CRS-3106",
      clientId: "CLI-006",
      dossierId: "DOS-2406",
      service: "Procédures administratives",
      typeCourse: "Dépôt pli",
      date: daysAgo(4),
      coursierId: "COU-05",
      statut: "Terminée",
      retrait: adr("Sofratech — Technopark", "Casablanca", "Zone B", "Rachida Ait Ali", "+212 661 09 77 45"),
      destinations: [adr("Direction régionale", "Rabat", "Zone D", "Bureau d’ordre", "+212 537 66 55 44")],
      kmMission: 88,
      kmVide: 7,
      attenteMinutes: 25,
      heureArrivee: "11:30",
      heureDepart: "11:55",
    }),
    mkCourse({
      numero: "CRS-3107",
      clientId: "CLI-001",
      dossierId: "DOS-2401",
      service: "Livraison de documents",
      typeCourse: "Simple",
      date: daysAgo(9),
      coursierId: "COU-01",
      statut: "À facturer",
      retrait: adr("Atlas Industrie — Maarif", "Casablanca", "Zone A", "Sanae Rmiki", "+212 662 11 08 34"),
      destinations: [adr("Cabinet comptable Bennis", "Casablanca", "Zone A", "M. Bennis", "+212 522 77 11 22")],
      kmMission: 5,
      kmVide: 2,
      attenteMinutes: 10,
      heureArrivee: "14:10",
      heureDepart: "14:20",
      validationClient: { demandeeLe: daysAgo(9), reponse: "Validée", commentaire: "", heure: "15:00" },
    }),
    mkCourse({
      numero: "CRS-3108",
      clientId: "CLI-003",
      dossierId: "DOS-2403",
      service: "Livraison de documents",
      typeCourse: "Simple",
      date: daysAgo(3),
      coursierId: "COU-02",
      statut: "À facturer",
      retrait: adr("Pharma Distrib — Sidi Maârouf", "Casablanca", "Zone B", "Hicham Filali", "+212 667 30 44 21"),
      destinations: [adr("Clinique Yasmine", "Casablanca", "Zone C", "Accueil", "+212 522 90 12 34")],
      kmMission: 11,
      kmVide: 4,
      attenteMinutes: 18,
      weekend: true,
      heureArrivee: "09:40",
      heureDepart: "09:58",
      validationClient: { demandeeLe: daysAgo(3), reponse: "Validée", commentaire: "", heure: "12:00" },
    }),
    mkCourse({
      numero: "CRS-3109",
      clientId: "CLI-002",
      dossierId: "DOS-2402",
      service: "Récupération de documents",
      typeCourse: "Retrait copie certifiée",
      date: today(),
      coursierId: "COU-01",
      statut: "Bloquée",
      priorite: "Urgente",
      retrait: adr("Tribunal de commerce", "Casablanca", "Zone B", "Greffe", "+212 522 30 11 22"),
      destinations: [adr("Cabinet Lahlou — Anfa", "Casablanca", "Zone A", "Imane Sabir", "+212 664 22 51 77")],
      notes: "Document non prêt au guichet — relance nécessaire.",
      kmVide: 3,
    }),
    mkCourse({
      numero: "CRS-3110",
      clientId: "CLI-004",
      service: "Paiement de factures",
      typeCourse: "Règlement guichet",
      date: daysAgo(16),
      coursierId: "COU-05",
      statut: "Facturée",
      factureId: "FAC-2026-0006",
      retrait: adr("Résidences Zerktouni", "Casablanca", "Zone A", "Latifa Amrani", "+212 668 15 62 90"),
      destinations: [adr("Agence Lydec", "Casablanca", "Zone A", "Guichet 2", "+212 522 11 22 33")],
      kmMission: 6,
      kmVide: 2,
      attenteMinutes: 40,
      heureArrivee: "08:50",
      heureDepart: "09:30",
    }),
  ];

  const fournisseurs: Fournisseur[] = [
    { id: "FRS-001", code: "FRS-001", raisonSociale: "Fournitures Atlas", contact: "Rachid El Idrissi", gsm: "+212 522 66 14 05", email: "contact@fournitures-atlas.ma", adresse: "Zone industrielle, lot 42", ville: "Casablanca", zone: "Zone C", conditions: "Paiement par chèque à 30 jours", notes: "Réception des chèques au service comptabilité.", actif: true, archive: false },
    { id: "FRS-002", code: "FRS-002", raisonSociale: "Sté Propreté Plus", contact: "Hakim Berrada", gsm: "+212 522 44 33 22", email: "compta@proprete-plus.ma", adresse: "24, rue Al Farabi", ville: "Casablanca", zone: "Zone C", conditions: "Chèque mensuel", notes: "", actif: true, archive: false },
    { id: "FRS-003", code: "FRS-003", raisonSociale: "Imprimerie Chaouia", contact: "Nawal Ait Ben", gsm: "+212 522 77 55 11", email: "devis@imp-chaouia.ma", adresse: "9, rue de Fès", ville: "Casablanca", zone: "Zone B", conditions: "Espèces ou virement", notes: "", actif: true, archive: false },
    { id: "FRS-004", code: "FRS-004", raisonSociale: "Maintenance Ascenseurs Nord", contact: "Omar Tazi", gsm: "+212 522 31 09 88", email: "service@man-ascenseurs.ma", adresse: "Boulevard Moulay Youssef", ville: "Casablanca", zone: "Zone A", conditions: "Chèque trimestriel", notes: "", actif: true, archive: false },
    { id: "FRS-005", code: "FRS-005", raisonSociale: "Sécurité Atlantique", contact: "Yassir Ouahbi", gsm: "+212 522 90 44 12", email: "admin@securite-atlantique.ma", adresse: "Route d’El Jadida, km 8", ville: "Casablanca", zone: "Zone C", conditions: "Virement 45 jours", notes: "Inactif depuis la fin du contrat.", actif: false, archive: false },
  ];

  const paiements: Paiement[] = [
    { id: "PAY-4001", numero: "PAY-4001", clientId: "CLI-001", dossierId: "DOS-2401", courseId: "CRS-3101", fournisseurId: "FRS-001", montant: 24800, devise: "MAD", moyen: "Chèque", numeroCheque: "CHQ-7741220", banque: "Attijariwafa Bank", dateCheque: daysAgo(3), coursierId: "COU-01", datePrevue: daysAgo(2), datePaiement: daysAgo(2), heure: "09:52", justificatif: "Reçu signé n° 1188", photoRecu: "recu-1188.jpg", documentId: "DOC-5003", notes: "Remis au service comptabilité.", statut: "Validé", archive: false },
    { id: "PAY-4002", numero: "PAY-4002", clientId: "CLI-004", dossierId: "DOS-2404", courseId: "CRS-3104", fournisseurId: "FRS-002", montant: 9600, devise: "MAD", moyen: "Chèque", numeroCheque: "CHQ-2290114", banque: "BMCE Bank", dateCheque: today(), coursierId: "", datePrevue: today(), datePaiement: "", heure: "", justificatif: "", photoRecu: "", documentId: "", notes: "Chèque à récupérer chez le syndic.", statut: "À recevoir", archive: false },
    { id: "PAY-4003", numero: "PAY-4003", clientId: "CLI-004", dossierId: "DOS-2404", courseId: "", fournisseurId: "FRS-004", montant: 15200, devise: "MAD", moyen: "Chèque", numeroCheque: "CHQ-2290115", banque: "BMCE Bank", dateCheque: daysAgo(1), coursierId: "COU-05", datePrevue: daysAhead(1), datePaiement: "", heure: "", justificatif: "", photoRecu: "", documentId: "", notes: "", statut: "Affecté au coursier", archive: false },
    { id: "PAY-4004", numero: "PAY-4004", clientId: "CLI-001", dossierId: "DOS-2401", courseId: "", fournisseurId: "FRS-003", montant: 4300, devise: "MAD", moyen: "Espèces", numeroCheque: "", banque: "", dateCheque: "", coursierId: "COU-02", datePrevue: today(), datePaiement: today(), heure: "11:15", justificatif: "", photoRecu: "", documentId: "", notes: "Justificatif en attente de remontée coursier.", statut: "Paiement effectué", archive: false },
    { id: "PAY-4005", numero: "PAY-4005", clientId: "CLI-006", dossierId: "DOS-2406", courseId: "", fournisseurId: "FRS-003", montant: 2750, devise: "MAD", moyen: "Virement", numeroCheque: "", banque: "CIH Bank", dateCheque: "", coursierId: "", datePrevue: daysAhead(3), datePaiement: "", heure: "", justificatif: "", photoRecu: "", documentId: "", notes: "", statut: "À payer", archive: false },
    { id: "PAY-4006", numero: "PAY-4006", clientId: "CLI-002", dossierId: "DOS-2402", courseId: "CRS-3102", fournisseurId: "FRS-003", montant: 1180, devise: "MAD", moyen: "Espèces", numeroCheque: "", banque: "", dateCheque: "", coursierId: "COU-03", datePrevue: daysAgo(1), datePaiement: daysAgo(1), heure: "11:20", justificatif: "Reçu greffe n° 4412", photoRecu: "recu-4412.jpg", documentId: "DOC-5006", notes: "", statut: "Justificatif reçu", archive: false },
  ];

  const documents: DocumentBO[] = [
    { id: "DOC-5001", nom: "Bon-de-commande-4471.pdf", type: "PDF", categorie: "Bon", clientId: "CLI-001", dossierId: "DOS-2401", courseId: "CRS-3101", paiementId: "", date: daysAgo(3), ajoutePar: "Karim Benjelloun", source: "Site web", notes: "Transmis par le client à la création de la demande.", archive: false },
    { id: "DOC-5002", nom: "Cheque-7741220.jpg", type: "Photo", categorie: "Chèque", clientId: "CLI-001", dossierId: "DOS-2401", courseId: "CRS-3101", paiementId: "PAY-4001", date: daysAgo(2), ajoutePar: "Mehdi Ait Taleb", source: "Coursier", notes: "Photo prise à la récupération.", archive: false },
    { id: "DOC-5003", nom: "Recu-fournisseur-1188.pdf", type: "PDF", categorie: "Justificatif", clientId: "CLI-001", dossierId: "DOS-2401", courseId: "CRS-3101", paiementId: "PAY-4001", date: daysAgo(2), ajoutePar: "Mehdi Ait Taleb", source: "Coursier", notes: "", archive: false },
    { id: "DOC-5004", nom: "Pli-tribunal-scelle.jpg", type: "Photo", categorie: "Photo", clientId: "CLI-002", dossierId: "DOS-2402", courseId: "CRS-3102", paiementId: "", date: daysAgo(1), ajoutePar: "Soufiane Kabbaj", source: "Coursier", notes: "Preuve de dépôt.", archive: false },
    { id: "DOC-5005", nom: "Statuts-societe.pdf", type: "PDF", categorie: "Document administratif", clientId: "CLI-006", dossierId: "DOS-2406", courseId: "", paiementId: "", date: daysAgo(9), ajoutePar: "Rachida Ait Ali", source: "WhatsApp", notes: "", archive: false },
    { id: "DOC-5006", nom: "Recu-greffe-4412.pdf", type: "PDF", categorie: "Reçu", clientId: "CLI-002", dossierId: "DOS-2402", courseId: "CRS-3102", paiementId: "PAY-4006", date: daysAgo(1), ajoutePar: "Soufiane Kabbaj", source: "Coursier", notes: "", archive: false },
    { id: "DOC-5007", nom: "Facture-FAC-2026-0006.pdf", type: "PDF", categorie: "Facture", clientId: "CLI-004", dossierId: "", courseId: "CRS-3110", paiementId: "", date: daysAgo(14), ajoutePar: "Nadia Cherkaoui", source: "Back-Office", notes: "", archive: false },
    { id: "DOC-5008", nom: "CIN-Younes-Berrada.pdf", type: "PDF", categorie: "Document client", clientId: "CLI-005", dossierId: "DOS-2405", courseId: "CRS-3105", paiementId: "", date: daysAgo(45), ajoutePar: "Salma Idrissi", source: "Back-Office", notes: "Pièce nécessaire au dossier.", archive: false },
  ];

  const tarifBase = (t: Partial<Tarif> & { id: string }): Tarif => ({
    clientId: "",
    service: "Tous services",
    typeCourse: "Tous types",
    zoneDepart: "Toutes zones",
    zoneArrivee: "Toutes zones",
    transport: "Tous",
    prixFixe: 0,
    prixKm: 0,
    prixKmVide: 0,
    facturerKmMission: true,
    facturerKmVide: false,
    tarifAttente: 0,
    franchiseAttente: 15,
    majorationUrgence: 0,
    majorationNuit: 0,
    majorationWeekend: 0,
    prixDestinationSup: 0,
    forfait: 0,
    dateDebut: daysAgo(365),
    dateFin: "",
    actif: true,
    archive: false,
    ...t,
  } as Tarif);

  const tarifs: Tarif[] = [
    tarifBase({ id: "TRF-01", prixFixe: 60, prixKm: 3.5, prixKmVide: 2, facturerKmVide: true, tarifAttente: 1.5, franchiseAttente: 15, majorationUrgence: 25, majorationNuit: 30, majorationWeekend: 20, prixDestinationSup: 25 }),
    tarifBase({ id: "TRF-02", clientId: "CLI-001", service: "Récupération de chèques", prixFixe: 90, prixKm: 3, prixKmVide: 1.8, facturerKmVide: true, tarifAttente: 1.2, franchiseAttente: 20, majorationUrgence: 20, majorationNuit: 30, majorationWeekend: 15, prixDestinationSup: 30 }),
    tarifBase({ id: "TRF-03", clientId: "CLI-001", prixFixe: 55, prixKm: 3, prixKmVide: 1.8, facturerKmVide: true, tarifAttente: 1.2, franchiseAttente: 20, majorationUrgence: 20, majorationWeekend: 15, prixDestinationSup: 25 }),
    tarifBase({ id: "TRF-04", clientId: "CLI-002", service: "Procédures administratives", prixFixe: 120, prixKm: 3.2, prixKmVide: 2, facturerKmVide: true, tarifAttente: 2, franchiseAttente: 30, majorationUrgence: 30, prixDestinationSup: 40 }),
    tarifBase({ id: "TRF-05", clientId: "CLI-003", prixFixe: 50, prixKm: 3.8, prixKmVide: 2.2, facturerKmVide: true, tarifAttente: 1.5, franchiseAttente: 10, majorationUrgence: 25, majorationWeekend: 25, prixDestinationSup: 20 }),
    tarifBase({ id: "TRF-06", clientId: "CLI-004", service: "Paiement de fournisseurs", forfait: 150, facturerKmMission: false, tarifAttente: 1, franchiseAttente: 20, majorationUrgence: 15 }),
    tarifBase({ id: "TRF-07", clientId: "CLI-006", prixFixe: 80, prixKm: 2.8, prixKmVide: 1.5, facturerKmVide: true, tarifAttente: 1.5, franchiseAttente: 15, majorationUrgence: 20, prixDestinationSup: 30 }),
  ];

  const factures: Facture[] = [
    {
      id: "FAC-2026-0006",
      numero: "FAC-2026-0006",
      clientId: "CLI-004",
      periode: "Quinzaine précédente",
      dateDebut: daysAgo(30),
      dateFin: daysAgo(16),
      dossiers: ["DOS-2404"],
      lignes: [{ id: uid("lig"), courseId: "CRS-3110", libelle: "CRS-3110 — Paiement de factures (règlement guichet)", montant: 218 }],
      frais: 0,
      remises: 0,
      tauxTaxe: 20,
      dateEmission: daysAgo(14),
      dateEcheance: daysAgo(2),
      statut: "En retard",
      reglements: [],
      notes: "",
      archive: false,
    },
    {
      id: "FAC-2026-0007",
      numero: "FAC-2026-0007",
      clientId: "CLI-005",
      periode: "Par dossier — DOS-2405",
      dateDebut: daysAgo(45),
      dateFin: daysAgo(30),
      dossiers: ["DOS-2405"],
      lignes: [{ id: uid("lig"), courseId: "CRS-3105", libelle: "CRS-3105 — Courses administratives (dépôt + retrait)", montant: 189.5 }],
      frais: 0,
      remises: 0,
      tauxTaxe: 20,
      dateEmission: daysAgo(29),
      dateEcheance: daysAgo(14),
      statut: "Payée",
      reglements: [{ id: uid("reg"), date: daysAgo(20), montant: 227.4, moyen: "Virement", reference: "VIR-88120" }],
      notes: "",
      archive: false,
    },
    {
      id: "FAC-2026-0008",
      numero: "FAC-2026-0008",
      clientId: "CLI-002",
      periode: "Dossier DOS-2402",
      dateDebut: daysAgo(21),
      dateFin: today(),
      dossiers: ["DOS-2402"],
      lignes: [],
      frais: 0,
      remises: 0,
      tauxTaxe: 20,
      dateEmission: "",
      dateEcheance: daysAhead(30),
      statut: "Brouillon",
      reglements: [],
      notes: "Facture en préparation — courses en attente de validation client.",
      archive: false,
    },
  ];

  const roles: Role[] = [
    { id: "ROL-1", nom: "Administrateur", description: "Accès complet à toutes les fonctionnalités.", permissions: [...PERMISSIONS], systeme: true, actif: true, archive: false },
    { id: "ROL-2", nom: "Direction", description: "Consultation globale et rapports.", permissions: ["Voir", "Exporter"], systeme: true, actif: true, archive: false },
    { id: "ROL-3", nom: "Opérateur", description: "Demandes, clients, dossiers, courses et WhatsApp.", permissions: ["Voir", "Créer", "Modifier", "Archiver"], systeme: true, actif: true, archive: false },
    { id: "ROL-4", nom: "Dispatcher", description: "Courses, coursiers et affectations.", permissions: ["Voir", "Modifier", "Affecter"], systeme: true, actif: true, archive: false },
    { id: "ROL-5", nom: "Facturation", description: "Factures, tarification et paiements.", permissions: ["Voir", "Créer", "Modifier", "Valider", "Facturer", "Exporter"], systeme: true, actif: true, archive: false },
    { id: "ROL-6", nom: "Coursier", description: "Interface mobile des missions affectées uniquement.", permissions: ["Voir", "Modifier"], systeme: true, actif: true, archive: false },
  ];

  const utilisateurs: Utilisateur[] = [
    { id: "USR-1", nom: "Yassine Bennani", email: "y.bennani@orcondis.ma", gsm: "+212 661 00 00 01", role: "Administrateur", actif: true, archive: false },
    { id: "USR-2", nom: "Salma Idrissi", email: "s.idrissi@orcondis.ma", gsm: "+212 661 00 00 02", role: "Opérateur", actif: true, archive: false },
    { id: "USR-3", nom: "Hamza Ouali", email: "h.ouali@orcondis.ma", gsm: "+212 661 00 00 03", role: "Dispatcher", actif: true, archive: false },
    { id: "USR-4", nom: "Nadia Cherkaoui", email: "n.cherkaoui@orcondis.ma", gsm: "+212 661 00 00 04", role: "Facturation", actif: true, archive: false },
    { id: "USR-5", nom: "Mehdi Ait Taleb", email: "m.aittaleb@orcondis.ma", gsm: "+212 670 11 22 33", role: "Coursier", actif: true, archive: false },
    { id: "USR-6", nom: "Sofia Amrani", email: "direction@orcondis.ma", gsm: "+212 661 00 00 05", role: "Direction", actif: true, archive: false },
  ];

  const notifications: Notification[] = [
    { id: "NOT-1", type: "Nouvelle demande", titre: "Nouvelle demande reçue", detail: "DEM-1042 — Cabinet Lahlou & Associés", date: `${fr(today())} 08:12`, lien: "/bo/demandes", lue: false, gravite: "info" },
    { id: "NOT-2", type: "Intervention humaine", titre: "Intervention humaine requise", detail: "Le client ne répond plus à l’agent WhatsApp.", date: `${fr(today())} 09:04`, lien: "/bo/demandes", lue: false, gravite: "alerte" },
    { id: "NOT-3", type: "Course non affectée", titre: "Course urgente non affectée", detail: "CRS-3104 — Résidences Zerktouni", date: `${fr(today())} 09:30`, lien: "/bo/courses", lue: false, gravite: "critique" },
    { id: "NOT-4", type: "Course bloquée", titre: "Course bloquée", detail: "CRS-3109 — document non prêt au guichet.", date: `${fr(today())} 10:15`, lien: "/bo/courses", lue: false, gravite: "critique" },
    { id: "NOT-5", type: "Paiement à effectuer", titre: "Paiement fournisseur à effectuer", detail: "PAY-4003 — Maintenance Ascenseurs Nord", date: `${fr(today())} 10:40`, lien: "/bo/paiements", lue: false, gravite: "alerte" },
    { id: "NOT-6", type: "Justificatif reçu", titre: "Justificatif reçu", detail: "PAY-4006 — Reçu greffe n° 4412", date: `${fr(daysAgo(1))} 11:25`, lien: "/bo/paiements", lue: true, gravite: "info" },
    { id: "NOT-7", type: "Facture en retard", titre: "Facture en retard", detail: "FAC-2026-0006 — Résidences Zerktouni", date: `${fr(daysAgo(1))} 08:00`, lien: "/bo/facturation", lue: false, gravite: "alerte" },
    { id: "NOT-8", type: "Audio reçu", titre: "Message audio reçu", detail: "Pharma Distrib Maroc — 42 s", date: `${fr(today())} 07:55`, lien: "/bo/demandes", lue: true, gravite: "info" },
  ];

  const audit: AuditEntry[] = [
    { id: "AUD-1", entite: "Course", entiteId: "CRS-3101", utilisateur: "Hamza Ouali", action: "Affectation coursier", date: fr(daysAgo(2)), heure: "08:35", ancienneValeur: "—", nouvelleValeur: "Mehdi Ait Taleb" },
    { id: "AUD-2", entite: "Paiement", entiteId: "PAY-4001", utilisateur: "Nadia Cherkaoui", action: "Changement de statut", date: fr(daysAgo(2)), heure: "17:10", ancienneValeur: "Justificatif reçu", nouvelleValeur: "Validé" },
    { id: "AUD-3", entite: "Facture", entiteId: "FAC-2026-0007", utilisateur: "Nadia Cherkaoui", action: "Enregistrement paiement", date: fr(daysAgo(20)), heure: "10:02", ancienneValeur: "Émise", nouvelleValeur: "Payée" },
    { id: "AUD-4", entite: "Tarif", entiteId: "TRF-05", utilisateur: "Yassine Bennani", action: "Modification tarif", date: fr(daysAgo(11)), heure: "15:44", ancienneValeur: "Prix km 3,50", nouvelleValeur: "Prix km 3,80" },
    { id: "AUD-5", entite: "Course", entiteId: "CRS-3109", utilisateur: "Hamza Ouali", action: "Changement de statut", date: fr(today()), heure: "10:15", ancienneValeur: "En cours", nouvelleValeur: "Bloquée" },
    { id: "AUD-6", entite: "Client", entiteId: "CLI-003", utilisateur: "Salma Idrissi", action: "Modification fiche", date: fr(daysAgo(5)), heure: "09:20", ancienneValeur: "Fréquence : Mensuelle", nouvelleValeur: "Fréquence : Hebdomadaire" },
  ];

  const messages: MessageClient[] = [
    { id: "MSG-1", clientId: "CLI-001", courseId: "CRS-3101", modele: "Validation demandée", texte: "La prestation liée à votre demande a été réalisée. Merci de confirmer sa bonne exécution.", date: fr(daysAgo(2)), heure: "17:45", canal: "WhatsApp", reponse: "Valider", commentaire: "Reçu conforme." },
    { id: "MSG-2", clientId: "CLI-002", courseId: "CRS-3102", modele: "Prestation réalisée", texte: "Votre pli a été déposé au greffe. Le reçu est disponible dans votre espace.", date: fr(daysAgo(1)), heure: "11:30", canal: "WhatsApp", reponse: "Valider", commentaire: "" },
    { id: "MSG-3", clientId: "CLI-003", courseId: "CRS-3103", modele: "Course affectée", texte: "Votre course a été affectée à un coursier. Elle sera réalisée dans la tranche horaire prévue.", date: fr(today()), heure: "13:50", canal: "WhatsApp", reponse: "", commentaire: "" },
    { id: "MSG-4", clientId: "CLI-004", courseId: "CRS-3110", modele: "Facture disponible", texte: "Votre facture FAC-2026-0006 est disponible.", date: fr(daysAgo(14)), heure: "09:10", canal: "WhatsApp", reponse: "", commentaire: "" },
  ];

  const services: ServiceParam[] = [
    { id: "SRV-1", nom: "Récupération de documents", description: "Collecte de documents chez le client ou un tiers.", prixDefaut: 60, procedure: "Retrait standard", actif: true, archive: false },
    { id: "SRV-2", nom: "Livraison de documents", description: "Remise de documents à une ou plusieurs destinations.", prixDefaut: 60, procedure: "Livraison standard", actif: true, archive: false },
    { id: "SRV-3", nom: "Courses administratives", description: "Dépôts et retraits auprès des administrations.", prixDefaut: 90, procedure: "Dépôt dossier", actif: true, archive: false },
    { id: "SRV-4", nom: "Paiement de factures", description: "Règlement de factures aux guichets.", prixDefaut: 80, procedure: "Règlement guichet", actif: true, archive: false },
    { id: "SRV-5", nom: "Paiement de fournisseurs", description: "Récupération de chèque et règlement fournisseur.", prixDefaut: 150, procedure: "Paiement fournisseur", actif: true, archive: false },
    { id: "SRV-6", nom: "Récupération de chèques", description: "Collecte de chèques auprès du client.", prixDefaut: 90, procedure: "Récupération chèque", actif: true, archive: false },
    { id: "SRV-7", nom: "Dépôt de chèques", description: "Dépôt bancaire de chèques.", prixDefaut: 90, procedure: "Dépôt bancaire", actif: true, archive: false },
    { id: "SRV-8", nom: "Procédures administratives", description: "Suivi de procédures complètes.", prixDefaut: 120, procedure: "Procédure complète", actif: true, archive: false },
    { id: "SRV-9", nom: "Vérification / contrôle", description: "Vérification sur place et compte rendu.", prixDefaut: 70, procedure: "Contrôle sur site", actif: true, archive: false },
  ];

  return {
    conversations: seedConversations(),
    societe: {
      nom: "ORCONDIS",
      nomCommercial: "Tizzla and Serve",
      telephone: "0666 70 99 41",
      email: "orcondiscourses@gmail.com",
      horaires: "Lundi – Vendredi : 08h00 – 18h30",
      villePrincipale: "Casablanca",
      description: "Services de courses, accompagnement et prestations de proximité.",
    },
    regles: {
      commandeVeilleObligatoire: true,
      autoriserDemandeMemeJour: true,
      supplementMemeJour: "Potentiel / À étudier",
      rayonStandardKm: 7,
      poidsMaxStandardKg: 3,
      tarifMensuelMin: 900,
    },
    clients,
    dossiers,
    coursiers,
    courses,
    fournisseurs,
    paiements,
    documents,
    tarifs,
    factures,
    utilisateurs,
    roles,
    notifications,
    audit,
    messages,
    services,
    typesCourse: [
      ref("TC-1", "Simple"),
      ref("TC-2", "Multi-destinations"),
      ref("TC-3", "Récupération + paiement fournisseur"),
      ref("TC-4", "Dépôt greffe"),
      ref("TC-5", "Dépôt + retrait"),
      ref("TC-6", "Règlement guichet"),
    ],
    typesClient: [
      { ...ref("TCL-1", "Entreprise"), systeme: true },
      { ...ref("TCL-2", "Particulier"), systeme: true },
      { ...ref("TCL-3", "Profession libérale"), systeme: true },
      ref("TCL-4", "Syndic"),
      ref("TCL-5", "Association"),
    ],
    typesContact: [ref("TCO-1", "Décideur"), ref("TCO-2", "Opérationnel"), ref("TCO-3", "Comptabilité"), ref("TCO-4", "Accueil")],
    zones: [
      { id: "ZN-1", nom: "Zone A", ville: "Casablanca", quartiers: "Maarif, Anfa, Gauthier, Racine", description: "Centre d’affaires", actif: true, archive: false },
      { id: "ZN-2", nom: "Zone B", ville: "Casablanca", quartiers: "Sidi Maârouf, Californie, Oasis", description: "Sud-est", actif: true, archive: false },
      { id: "ZN-3", nom: "Zone C", ville: "Casablanca", quartiers: "Aïn Sebaâ, Hay Mohammadi, Roches Noires", description: "Zone industrielle", actif: true, archive: false },
      { id: "ZN-4", nom: "Zone D", ville: "Rabat", quartiers: "Agdal, Hassan, Souissi", description: "Hors Casablanca", actif: true, archive: false },
    ],
    transports: [ref("TR-1", "Moto"), ref("TR-2", "Bicyclette"), ref("TR-3", "Voiture")],
    priorites: [ref("PR-1", "Normale"), ref("PR-2", "Urgente"), ref("PR-3", "Exclusive")],
    tranchesHoraires: [
      ref("TH-1", "Matin (08h – 12h)"),
      ref("TH-2", "Après-midi (14h – 18h)"),
      ref("TH-3", "Journée complète"),
      ref("TH-4", "Heure fixe"),
    ],
    procedures: [
      ref("PC-1", "Récupération chèque", "Vérifier le numéro, photographier le chèque, confirmer au back-office."),
      ref("PC-2", "Paiement fournisseur", "Remettre le chèque, obtenir un reçu signé et le photographier."),
      ref("PC-3", "Dépôt greffe", "Faire tamponner la copie de dépôt et la remonter."),
      ref("PC-4", "Dépôt dossier", "Contrôler la liste des pièces avant dépôt."),
      ref("PC-5", "Retrait document", "Présenter la procuration et vérifier la conformité."),
    ],
    modelesNotification: [
      ref("MN-1", "Demande reçue", "Votre demande a bien été reçue par ORCONDIS."),
      ref("MN-2", "Informations complètes", "Toutes les informations nécessaires sont réunies."),
      ref("MN-3", "Demande prise en charge", "Votre demande est prise en charge par notre équipe."),
      ref("MN-4", "Information complémentaire requise", "Une information complémentaire est nécessaire."),
      ref("MN-5", "Course affectée", "Votre course a été affectée à un coursier."),
      ref("MN-6", "Prestation réalisée", "La prestation a été réalisée."),
      ref("MN-7", "Validation demandée", "La prestation liée à votre demande a été réalisée. Merci de confirmer sa bonne exécution."),
      ref("MN-8", "Facture disponible", "Votre facture est disponible."),
    ],
    whatsapp: {
      numero: "+212 661 00 00 00",
      agentActif: true,
      messageBienvenue:
        "Bonjour, ici l’assistant ORCONDIS. Nous avons bien reçu votre demande. Je vais vous poser quelques questions afin de la préparer.",
      tonalite: "Professionnelle et courtoise",
      handoffHumain: "Après 2 relances sans réponse ou à la demande du client.",
      horaires: "Lundi – Vendredi : 08h00 – 18h30",
    },
  };
}