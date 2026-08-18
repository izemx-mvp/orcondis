// ORCONDIS — Modèle opérationnel du Back-Office (Partie 1)
// Données de démonstration cohérentes et connectées entre les modules.

export const todayIso = () => new Date().toISOString().slice(0, 10);
export const daysAgoIso = (n: number) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
export const daysAheadIso = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

const JOURS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
export const jourDe = (dateIso: string) => JOURS[new Date(dateIso + "T12:00:00").getDay()] ?? "";
export const dateFr = (dateIso: string) => {
  if (!dateIso) return "—";
  const [a, m, j] = dateIso.split("-");
  return `${j}/${m}/${a}`;
};
export const mad = (v: number) =>
  `${new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0)} MAD`;

let seq = 0;
export function oid(prefix = "id") {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq.toString(36)}`;
}

export function horodatage() {
  const d = new Date();
  return `${dateFr(d.toISOString().slice(0, 10))} ${d.toTimeString().slice(0, 5)}`;
}

/* ------------------------------------------------------------------ */
/* Référentiels                                                        */
/* ------------------------------------------------------------------ */

export const CATEGORIES_CLIENT = ["Personne physique", "Entreprise", "Société", "Autres"] as const;
export type CategorieClient = (typeof CATEGORIES_CLIENT)[number];

export const PREFIXES_CLIENT: Record<CategorieClient, string> = {
  "Personne physique": "10",
  Entreprise: "20",
  Société: "30",
  Autres: "40",
};

export const SOUS_TYPES_AUTRES = [
  "Administration",
  "Organisation",
  "Association",
  "Médecins",
  "Laboratoire médical",
  "Laboratoire autre",
  "École",
  "Lycée",
  "Collège",
  "Autres",
  "Autre à préciser",
] as const;

export const ROLES_CONTACT = [
  "Responsable",
  "Autorisé à passer les ordres / commandes",
  "Responsable achat",
  "Autorisé à régler les factures",
  "Autres",
  "Autre à préciser",
] as const;
export type RoleContact = (typeof ROLES_CONTACT)[number];

export const ZONES = [
  "Casablanca Centre",
  "Maarif",
  "Anfa",
  "Aïn Sebaâ",
  "Sidi Maârouf",
  "Hay Hassani",
  "Ain Diab",
  "Sidi Bernoussi",
  "Mohammedia",
] as const;

export const TRANSPORTS = ["Moto", "Bicyclette", "Voiture"] as const;
export type Transport = (typeof TRANSPORTS)[number];

export const TRANCHES_HORAIRES = ["Matin", "Midi", "Après-midi", "Fin de journée"] as const;

export const PRIORITES_COURSE = ["Normale", "Urgente", "Exclusive"] as const;
export type PrioriteCourse = (typeof PRIORITES_COURSE)[number];

export const TYPES_COURSE = [
  "Récupération de documents",
  "Livraison de documents",
  "Dépôt administratif",
  "Course administrative",
  "Paiement de facture",
  "Paiement fournisseur",
  "Récupération de chèque",
  "Dépôt de chèque",
  "Course bancaire",
  "Livraison fournisseur",
  "Procédure provisoire",
  "Vérification du poids",
  "Vérification / contrôle",
  "Autre",
] as const;

export const TYPES_DOSSIER = [
  "Dossier administratif",
  "Dossier fournisseur",
  "Dossier bancaire",
  "Dossier juridique",
  "Dossier logistique",
  "Autre",
] as const;

export const TYPES_PROCEDURE = [
  "Procédure provisoire",
  "Vérification poids",
  "Procédure administrative",
  "Dépôt administratif",
  "Récupération validation",
  "Vérification document",
  "Autre",
] as const;

export const RESPONSABLES_BO = ["Yassine Bennani", "Salma Idrissi", "Hamza Ouali", "Nadia Cherkaoui"];

export const STATUTS_DOSSIER = [
  "Nouveau",
  "En préparation",
  "En attente de documents",
  "En cours",
  "En attente client",
  "En attente administration",
  "En attente fournisseur",
  "À valider",
  "Terminé",
  "Facturé",
  "Archivé",
] as const;
export type StatutDossier = (typeof STATUTS_DOSSIER)[number];

export const STATUTS_COURSE = [
  "En attente",
  "À affecter",
  "Affectée",
  "Acceptée",
  "En cours",
  "Bloquée",
  "Terminée",
  "Validée",
  "À facturer",
  "Facturée",
  "Annulée",
] as const;
export type StatutCourse = (typeof STATUTS_COURSE)[number];

export const STATUTS_COURSIER = ["Disponible", "Occupé", "Indisponible"] as const;
export type StatutCoursier = (typeof STATUTS_COURSIER)[number];

export const STATUTS_PROCEDURE = ["Nouvelle", "En cours", "En attente", "Terminée", "Annulée"] as const;
export type StatutProcedure = (typeof STATUTS_PROCEDURE)[number];

export const PRIORITES_DOSSIER = ["Basse", "Normale", "Haute", "Critique"] as const;

/* ------------------------------------------------------------------ */
/* Types métier                                                        */
/* ------------------------------------------------------------------ */

export type Note = { id: string; auteur: string; texte: string; date: string };
export type Evenement = { id: string; date: string; auteur: string; action: string };
export type DocumentOps = { id: string; nom: string; type: string; date: string; ajoutePar: string };

export type ClientOps = {
  id: string;
  code: string;
  categorie: CategorieClient;
  sousType: string;
  autrePrecision: string;
  nom: string;
  prenom: string;
  denomination: string;
  raisonSociale: string;
  ville: string;
  quartier: string;
  rue: string;
  numeroRue: string;
  etage: string;
  appartement: string;
  adresseComplete: string;
  pays: string;
  site: string;
  email: string;
  telephoneFixe: string;
  fax: string;
  gsm: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  zone: string;
  notes: string;
  archive: boolean;
  creeLe: string;
  documents: DocumentOps[];
  notesInternes: Note[];
  historique: Evenement[];
};

export function nomClient(c?: ClientOps) {
  if (!c) return "—";
  if (c.categorie === "Personne physique") return `${c.prenom} ${c.nom}`.trim() || c.code;
  if (c.categorie === "Entreprise") return c.denomination || c.code;
  if (c.categorie === "Société") return c.raisonSociale || c.code;
  return c.denomination || c.raisonSociale || c.nom || c.code;
}

export type ContactOps = {
  id: string;
  code: string;
  clientId: string;
  nom: string;
  prenom: string;
  service: string;
  fonction: string;
  role: RoleContact;
  autreRole: string;
  gsm: string;
  fixe: string;
  fax: string;
  email: string;
  whatsapp: string;
  notes: string;
  actif: boolean;
  archive: boolean;
  historique: Evenement[];
};

export type DossierOps = {
  id: string;
  numero: string;
  clientId: string;
  contactId: string;
  responsable: string;
  type: string;
  objet: string;
  description: string;
  dateOuverture: string;
  datePrevue: string;
  dateCloture: string;
  priorite: (typeof PRIORITES_DOSSIER)[number];
  statut: StatutDossier;
  montantEstime: number;
  notes: string;
  documents: DocumentOps[];
  notesInternes: Note[];
  historique: Evenement[];
  archive: boolean;
};

export type PointOps = {
  id: string;
  zone: string;
  ville: string;
  quartier: string;
  adresse: string;
  contact: string;
  gsm: string;
  instructions: string;
  ordre: number;
};

export const pointVide = (ordre = 1): PointOps => ({
  id: oid("pt"),
  zone: "",
  ville: "Casablanca",
  quartier: "",
  adresse: "",
  contact: "",
  gsm: "",
  instructions: "",
  ordre,
});

export type Reaffectation = {
  id: string;
  ancien: string;
  nouveau: string;
  motif: string;
  commentaire: string;
  date: string;
  heure: string;
  utilisateur: string;
};

export type CourseOps = {
  id: string;
  numero: string;
  jour: string;
  dateAppel: string;
  heureAppel: string;
  correspondant: string;
  clientId: string;
  contactId: string;
  dossierId: string;
  demandeNumero: string;
  message: string;
  service: string;
  typeCourse: string;
  priorite: PrioriteCourse;
  dateCourse: string;
  trancheHoraire: string;
  heureFixe: string;
  transport: Transport | "";
  coursierId: string;
  statut: StatutCourse;
  retrait: PointOps;
  destinations: PointOps[];
  instructions: string;
  instructionsAudio: string;
  noteInterne: string;
  heureEnvoiOrdre: string;
  heureDepart: string;
  kmDepart: number;
  litresDepart: number;
  heureArrivee: string;
  heureFin: string;
  kmArrivee: number;
  litresArrivee: number;
  kmMission: number;
  kmVide: number;
  attenteMinutes: number;
  notesCoursier: string;
  documents: DocumentOps[];
  notesInternes: Note[];
  reaffectations: Reaffectation[];
  historique: Evenement[];
  archive: boolean;
};

export type CoursierOps = {
  id: string;
  code: string;
  photo: string;
  nom: string;
  prenom: string;
  gsm: string;
  whatsapp: string;
  email: string;
  adresse: string;
  ville: string;
  zonePrincipale: string;
  zonesSecondaires: string;
  zoneActuelle: string;
  transport: Transport;
  immatriculation: string;
  statut: StatutCoursier;
  dateDebut: string;
  notes: string;
  actif: boolean;
  archive: boolean;
  documents: DocumentOps[];
  notesInternes: Note[];
  historique: Evenement[];
};

export const nomCoursier = (c?: CoursierOps) => (c ? `${c.prenom} ${c.nom}`.trim() : "Non affecté");

export type EtapeProcedure = {
  id: string;
  libelle: string;
  statut: "À faire" | "En cours" | "Validée" | "Bloquée";
  responsable: string;
  date: string;
  commentaire: string;
};

export type ProcedureOps = {
  id: string;
  numero: string;
  type: string;
  clientId: string;
  dossierId: string;
  courseId: string;
  responsable: string;
  coursierId: string;
  date: string;
  statut: StatutProcedure;
  etapes: EtapeProcedure[];
  documents: DocumentOps[];
  notesInternes: Note[];
  notes: string;
  historique: Evenement[];
  archive: boolean;
};

export type AudioCoursier = {
  id: string;
  courseId: string;
  coursierId: string;
  date: string;
  heure: string;
  duree: string;
  transcription: string;
  lu: boolean;
};

export type NotificationOps = {
  id: string;
  titre: string;
  detail: string;
  date: string;
  gravite: "info" | "alerte" | "critique";
  lue: boolean;
};

export const MODELE_PROCEDURE_PROVISOIRE = [
  "Récupérer les documents",
  "Vérifier les documents",
  "Se rendre au service concerné",
  "Effectuer la procédure",
  "Vérifier le poids",
  "Confirmer les informations",
  "Récupérer la validation",
  "Ajouter le justificatif",
  "Informer le Back-Office",
  "Clôturer",
];

export type OpsData = {
  clients: ClientOps[];
  contacts: ContactOps[];
  dossiers: DossierOps[];
  courses: CourseOps[];
  coursiers: CoursierOps[];
  procedures: ProcedureOps[];
  audios: AudioCoursier[];
  notifications: NotificationOps[];
  audit: Evenement[];
};

/* ------------------------------------------------------------------ */
/* Numérotation automatique                                            */
/* ------------------------------------------------------------------ */

export function prochainCodeClient(clients: ClientOps[], categorie: CategorieClient) {
  const prefixe = PREFIXES_CLIENT[categorie];
  const max = clients
    .filter((c) => c.code.startsWith(prefixe + "-"))
    .reduce((acc, c) => Math.max(acc, Number(c.code.split("-")[1] ?? 0)), 0);
  return `${prefixe}-${String(max + 1).padStart(5, "0")}`;
}

export function prochainCodeContact(contacts: ContactOps[]) {
  const max = contacts.reduce((acc, c) => Math.max(acc, Number(c.code.replace(/\D/g, "")) || 0), 0);
  return `CT-${String(max + 1).padStart(5, "0")}`;
}

function prochainNumeroAnnuel(items: { numero: string }[], prefixe: string, taille = 4) {
  const annee = new Date().getFullYear();
  const max = items.reduce((acc, i) => {
    const parts = i.numero.split("-");
    const n = Number(parts[parts.length - 1]);
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `${prefixe}-${annee}-${String(max + 1).padStart(taille, "0")}`;
}

export const prochainNumeroDossier = (d: DossierOps[]) => prochainNumeroAnnuel(d, "D");
export const prochainNumeroCourse = (c: CourseOps[]) => prochainNumeroAnnuel(c, "C");
export const prochainNumeroProcedure = (p: ProcedureOps[]) => prochainNumeroAnnuel(p, "PR", 3);
export function prochainCodeCoursier(coursiers: CoursierOps[]) {
  const max = coursiers.reduce((acc, c) => Math.max(acc, Number(c.code.replace(/\D/g, "")) || 0), 0);
  return `CR-${String(max + 1).padStart(3, "0")}`;
}

/* ------------------------------------------------------------------ */
/* Données de démonstration                                            */
/* ------------------------------------------------------------------ */

const clientBase = (over: Partial<ClientOps>): ClientOps => ({
  id: oid("cli"),
  code: "20-00001",
  categorie: "Entreprise",
  sousType: "",
  autrePrecision: "",
  nom: "",
  prenom: "",
  denomination: "",
  raisonSociale: "",
  ville: "Casablanca",
  quartier: "",
  rue: "",
  numeroRue: "",
  etage: "",
  appartement: "",
  adresseComplete: "",
  pays: "Maroc",
  site: "",
  email: "",
  telephoneFixe: "",
  fax: "",
  gsm: "",
  whatsapp: "",
  facebook: "",
  instagram: "",
  zone: "Casablanca Centre",
  notes: "",
  archive: false,
  creeLe: daysAgoIso(200),
  documents: [],
  notesInternes: [],
  historique: [{ id: oid("ev"), date: horodatage(), auteur: "Système", action: "Client créé" }],
  ...over,
});

const point = (over: Partial<PointOps>): PointOps => ({ ...pointVide(), ...over });

export function seedOps(): OpsData {
  const atlas = clientBase({
    id: "CLI-ATLAS",
    code: "20-00001",
    categorie: "Entreprise",
    denomination: "Atlas Industrie",
    raisonSociale: "Atlas Industrie SARL",
    quartier: "Maarif",
    rue: "Rue Ibnou Mounir",
    numeroRue: "12",
    etage: "3",
    appartement: "B",
    adresseComplete: "12, rue Ibnou Mounir, Maarif, Casablanca",
    email: "contact@atlas-industrie.ma",
    telephoneFixe: "+212 522 45 22 10",
    gsm: "+212 661 45 22 10",
    whatsapp: "+212 661 45 22 10",
    site: "www.atlas-industrie.ma",
    zone: "Maarif",
    notes: "Client prioritaire — validation avant facturation.",
  });

  const lahlou = clientBase({
    id: "CLI-LAHLOU",
    code: "30-00001",
    categorie: "Société",
    raisonSociale: "Cabinet Lahlou & Associés",
    quartier: "Anfa",
    rue: "Boulevard Anfa",
    numeroRue: "8",
    adresseComplete: "8, boulevard Anfa, Casablanca",
    email: "contact@lahlou-avocats.ma",
    telephoneFixe: "+212 522 27 11 04",
    gsm: "+212 663 78 90 12",
    whatsapp: "+212 663 78 90 12",
    zone: "Anfa",
    notes: "Documents confidentiels — remise en main propre.",
  });

  const bennis = clientBase({
    id: "CLI-BENNIS",
    code: "10-00001",
    categorie: "Personne physique",
    nom: "Bennis",
    prenom: "Rachid",
    quartier: "Ain Diab",
    adresseComplete: "45, rue de la Corniche, Ain Diab, Casablanca",
    email: "r.bennis@gmail.com",
    gsm: "+212 668 12 45 90",
    whatsapp: "+212 668 12 45 90",
    zone: "Ain Diab",
  });

  const labo = clientBase({
    id: "CLI-LABO",
    code: "40-00001",
    categorie: "Autres",
    sousType: "Laboratoire médical",
    denomination: "Laboratoire Al Amal",
    quartier: "Sidi Maârouf",
    adresseComplete: "Lot 118, Sidi Maârouf, Casablanca",
    email: "contact@labo-alamal.ma",
    gsm: "+212 667 30 44 21",
    whatsapp: "+212 667 30 44 21",
    zone: "Sidi Maârouf",
  });

  const contacts: ContactOps[] = [
    {
      id: "CT-KARIM",
      code: "CT-00001",
      clientId: atlas.id,
      nom: "Benjelloun",
      prenom: "Karim",
      service: "Direction administrative",
      fonction: "Directeur administratif",
      role: "Autorisé à passer les ordres / commandes",
      autreRole: "",
      gsm: "+212 661 45 22 10",
      fixe: "+212 522 45 22 10",
      fax: "+212 522 45 22 11",
      email: "k.benjelloun@atlas-industrie.ma",
      whatsapp: "+212 661 45 22 10",
      notes: "Interlocuteur principal pour les courses urgentes.",
      actif: true,
      archive: false,
      historique: [{ id: oid("ev"), date: horodatage(), auteur: "Système", action: "Contact créé" }],
    },
    {
      id: "CT-SANAE",
      code: "CT-00002",
      clientId: atlas.id,
      nom: "Rmiki",
      prenom: "Sanae",
      service: "Comptabilité",
      fonction: "Responsable comptable",
      role: "Autorisé à régler les factures",
      autreRole: "",
      gsm: "+212 662 11 08 34",
      fixe: "+212 522 45 22 15",
      fax: "",
      email: "compta@atlas-industrie.ma",
      whatsapp: "+212 662 11 08 34",
      notes: "",
      actif: true,
      archive: false,
      historique: [],
    },
    {
      id: "CT-IMANE",
      code: "CT-00003",
      clientId: lahlou.id,
      nom: "Sabir",
      prenom: "Imane",
      service: "Juridique",
      fonction: "Assistante juridique",
      role: "Responsable",
      autreRole: "",
      gsm: "+212 664 22 51 77",
      fixe: "",
      fax: "",
      email: "i.sabir@lahlou-avocats.ma",
      whatsapp: "+212 664 22 51 77",
      notes: "",
      actif: true,
      archive: false,
      historique: [],
    },
  ];

  const coursiers: CoursierOps[] = [
    {
      id: "CR-AHMED",
      code: "CR-001",
      photo: "",
      nom: "Benali",
      prenom: "Ahmed",
      gsm: "+212 670 11 22 33",
      whatsapp: "+212 670 11 22 33",
      email: "a.benali@orcondis.ma",
      adresse: "Rue 12, Hay Mohammadi",
      ville: "Casablanca",
      zonePrincipale: "Casablanca Centre",
      zonesSecondaires: "Maarif, Anfa",
      zoneActuelle: "Casablanca Centre",
      transport: "Moto",
      immatriculation: "12345-A-6",
      statut: "Disponible",
      dateDebut: daysAgoIso(500),
      notes: "Excellente connaissance du centre-ville.",
      actif: true,
      archive: false,
      documents: [],
      notesInternes: [],
      historique: [],
    },
    {
      id: "CR-YOUSSEF",
      code: "CR-002",
      photo: "",
      nom: "El Amrani",
      prenom: "Youssef",
      gsm: "+212 671 44 55 66",
      whatsapp: "+212 671 44 55 66",
      email: "y.elamrani@orcondis.ma",
      adresse: "Bd Zerktouni",
      ville: "Casablanca",
      zonePrincipale: "Aïn Sebaâ",
      zonesSecondaires: "Sidi Bernoussi, Mohammedia",
      zoneActuelle: "Aïn Sebaâ",
      transport: "Voiture",
      immatriculation: "78901-B-2",
      statut: "Occupé",
      dateDebut: daysAgoIso(320),
      notes: "",
      actif: true,
      archive: false,
      documents: [],
      notesInternes: [],
      historique: [],
    },
    {
      id: "CR-SOUFIANE",
      code: "CR-003",
      photo: "",
      nom: "Tazi",
      prenom: "Soufiane",
      gsm: "+212 672 77 88 99",
      whatsapp: "+212 672 77 88 99",
      email: "s.tazi@orcondis.ma",
      adresse: "Maarif",
      ville: "Casablanca",
      zonePrincipale: "Maarif",
      zonesSecondaires: "Hay Hassani",
      zoneActuelle: "Maarif",
      transport: "Bicyclette",
      immatriculation: "",
      statut: "Disponible",
      dateDebut: daysAgoIso(120),
      notes: "",
      actif: true,
      archive: false,
      documents: [],
      notesInternes: [],
      historique: [],
    },
    {
      id: "CR-MEHDI",
      code: "CR-004",
      photo: "",
      nom: "Ouazzani",
      prenom: "Mehdi",
      gsm: "+212 673 10 20 30",
      whatsapp: "+212 673 10 20 30",
      email: "m.ouazzani@orcondis.ma",
      adresse: "Sidi Maârouf",
      ville: "Casablanca",
      zonePrincipale: "Sidi Maârouf",
      zonesSecondaires: "Hay Hassani",
      zoneActuelle: "Sidi Maârouf",
      transport: "Moto",
      immatriculation: "44556-C-1",
      statut: "Indisponible",
      dateDebut: daysAgoIso(60),
      notes: "En congé jusqu’à la fin de la semaine.",
      actif: true,
      archive: false,
      documents: [],
      notesInternes: [],
      historique: [],
    },
  ];

  const dossierAtlas: DossierOps = {
    id: "DOS-ATLAS",
    numero: "D-2026-0015",
    clientId: atlas.id,
    contactId: "CT-KARIM",
    responsable: "Yassine Bennani",
    type: "Dossier fournisseur",
    objet: "Règlement fournisseur et récupération des justificatifs",
    description:
      "Dossier complet : récupération de documents, dépôt administratif, procédure provisoire, paiement fournisseur et récupération du justificatif.",
    dateOuverture: daysAgoIso(6),
    datePrevue: daysAheadIso(4),
    dateCloture: "",
    priorite: "Haute",
    statut: "En cours",
    montantEstime: 4800,
    notes: "Le client exige un justificatif signé pour chaque paiement.",
    documents: [
      { id: oid("doc"), nom: "Bon de commande ATL-4471.pdf", type: "PDF", date: daysAgoIso(6), ajoutePar: "Karim Benjelloun" },
    ],
    notesInternes: [
      { id: oid("nt"), auteur: "Yassine Bennani", texte: "Prévoir un coursier moto pour la partie Aïn Sebaâ.", date: horodatage() },
    ],
    historique: [{ id: oid("ev"), date: horodatage(), auteur: "Yassine Bennani", action: "Dossier ouvert" }],
    archive: false,
  };

  const dossiers: DossierOps[] = [
    dossierAtlas,
    {
      id: "DOS-LAHLOU",
      numero: "D-2026-0016",
      clientId: lahlou.id,
      contactId: "CT-IMANE",
      responsable: "Salma Idrissi",
      type: "Dossier juridique",
      objet: "Dépôt de conclusions au tribunal de commerce",
      description: "Dépôt et récupération de l’accusé de réception.",
      dateOuverture: daysAgoIso(2),
      datePrevue: daysAheadIso(1),
      dateCloture: "",
      priorite: "Critique",
      statut: "En attente de documents",
      montantEstime: 1200,
      notes: "",
      documents: [],
      notesInternes: [],
      historique: [],
      archive: false,
    },
    {
      id: "DOS-LABO",
      numero: "D-2026-0017",
      clientId: labo.id,
      contactId: "",
      responsable: "Hamza Ouali",
      type: "Dossier administratif",
      objet: "Renouvellement d’autorisation sanitaire",
      description: "Procédure administrative avec vérification de documents.",
      dateOuverture: daysAgoIso(12),
      datePrevue: daysAheadIso(9),
      dateCloture: "",
      priorite: "Normale",
      statut: "Nouveau",
      montantEstime: 2600,
      notes: "",
      documents: [],
      notesInternes: [],
      historique: [],
      archive: false,
    },
  ];

  const courseBase = (over: Partial<CourseOps>): CourseOps => ({
    id: oid("crs"),
    numero: "C-2026-0000",
    jour: jourDe(todayIso()),
    dateAppel: todayIso(),
    heureAppel: "09:15",
    correspondant: "Karim Benjelloun",
    clientId: atlas.id,
    contactId: "CT-KARIM",
    dossierId: dossierAtlas.id,
    demandeNumero: "",
    message: "",
    service: "Courses administratives",
    typeCourse: "Récupération de documents",
    priorite: "Normale",
    dateCourse: todayIso(),
    trancheHoraire: "Matin",
    heureFixe: "",
    transport: "Moto",
    coursierId: "",
    statut: "À affecter",
    retrait: point({
      zone: "Maarif",
      quartier: "Maarif",
      adresse: "12, rue Ibnou Mounir",
      contact: "Karim Benjelloun",
      gsm: "+212 661 45 22 10",
    }),
    destinations: [
      point({ zone: "Casablanca Centre", quartier: "Centre", adresse: "Bd Mohammed V", contact: "Accueil", ordre: 1 }),
    ],
    instructions: "",
    instructionsAudio: "",
    noteInterne: "",
    heureEnvoiOrdre: "",
    heureDepart: "",
    kmDepart: 0,
    litresDepart: 0,
    heureArrivee: "",
    heureFin: "",
    kmArrivee: 0,
    litresArrivee: 0,
    kmMission: 0,
    kmVide: 0,
    attenteMinutes: 0,
    notesCoursier: "",
    documents: [],
    notesInternes: [],
    reaffectations: [],
    historique: [{ id: oid("ev"), date: horodatage(), auteur: "Back-Office", action: "Course créée" }],
    archive: false,
    ...over,
  });

  const courses: CourseOps[] = [
    courseBase({
      id: "CRS-0084",
      numero: "C-2026-0084",
      typeCourse: "Paiement fournisseur",
      service: "Paiement de fournisseurs",
      priorite: "Urgente",
      transport: "Moto",
      coursierId: "CR-AHMED",
      statut: "En cours",
      demandeNumero: "DEM-1041",
      message: "Régler la facture fournisseur et récupérer le justificatif signé.",
      heureAppel: "08:40",
      trancheHoraire: "Matin",
      heureFixe: "10:30",
      retrait: point({
        zone: "Maarif",
        quartier: "Maarif",
        adresse: "12, rue Ibnou Mounir",
        contact: "Karim Benjelloun",
        gsm: "+212 661 45 22 10",
        instructions: "Récupérer le chèque à l’accueil.",
      }),
      destinations: [
        point({
          zone: "Aïn Sebaâ",
          quartier: "Aïn Sebaâ",
          adresse: "Zone industrielle, lot 42",
          contact: "Service comptabilité",
          gsm: "+212 522 66 11 05",
          instructions: "Exiger le cachet sur le justificatif.",
          ordre: 1,
        }),
      ],
      instructions: "Course urgente — appeler le Back-Office après le règlement.",
      heureEnvoiOrdre: "08:50",
      heureDepart: "09:05",
      kmDepart: 24580,
      litresDepart: 6,
      attenteMinutes: 15,
    }),
    courseBase({
      id: "CRS-0085",
      numero: "C-2026-0085",
      typeCourse: "Récupération de documents",
      priorite: "Urgente",
      coursierId: "",
      statut: "À affecter",
      heureAppel: "09:30",
      trancheHoraire: "Après-midi",
      message: "Récupérer les originaux du dossier fournisseur.",
    }),
    courseBase({
      id: "CRS-0086",
      numero: "C-2026-0086",
      clientId: lahlou.id,
      contactId: "CT-IMANE",
      dossierId: "DOS-LAHLOU",
      correspondant: "Imane Sabir",
      typeCourse: "Dépôt administratif",
      priorite: "Urgente",
      transport: "Voiture",
      coursierId: "CR-YOUSSEF",
      statut: "Bloquée",
      heureAppel: "10:05",
      trancheHoraire: "Midi",
      message: "Dépôt des conclusions au tribunal de commerce.",
      retrait: point({ zone: "Anfa", quartier: "Anfa", adresse: "8, boulevard Anfa", contact: "Imane Sabir", gsm: "+212 664 22 51 77" }),
      destinations: [point({ zone: "Casablanca Centre", quartier: "Centre", adresse: "Tribunal de commerce", contact: "Greffe", ordre: 1 })],
      instructions: "Guichet fermé pour inventaire — attente d’instruction.",
    }),
    courseBase({
      id: "CRS-0087",
      numero: "C-2026-0087",
      clientId: labo.id,
      contactId: "",
      dossierId: "DOS-LABO",
      correspondant: "Laboratoire Al Amal",
      typeCourse: "Course administrative",
      coursierId: "CR-SOUFIANE",
      statut: "Terminée",
      heureAppel: "08:10",
      trancheHoraire: "Matin",
      transport: "Bicyclette",
      heureDepart: "08:30",
      heureArrivee: "09:10",
      heureFin: "09:40",
      kmDepart: 1200,
      kmArrivee: 1214,
      kmMission: 14,
      kmVide: 3,
      attenteMinutes: 10,
      retrait: point({ zone: "Sidi Maârouf", quartier: "Sidi Maârouf", adresse: "Lot 118", contact: "Réception" }),
      destinations: [point({ zone: "Hay Hassani", quartier: "Hay Hassani", adresse: "Délégation de santé", contact: "Bureau d’ordre", ordre: 1 })],
    }),
    courseBase({
      id: "CRS-0088",
      numero: "C-2026-0088",
      clientId: bennis.id,
      contactId: "",
      dossierId: "",
      correspondant: "Rachid Bennis",
      typeCourse: "Dépôt de chèque",
      coursierId: "",
      statut: "En attente",
      heureAppel: "11:20",
      dateCourse: daysAheadIso(1),
      trancheHoraire: "Fin de journée",
      retrait: point({ zone: "Ain Diab", quartier: "Ain Diab", adresse: "45, rue de la Corniche", contact: "Rachid Bennis", gsm: "+212 668 12 45 90" }),
      destinations: [point({ zone: "Casablanca Centre", quartier: "Centre", adresse: "Agence bancaire Bd Zerktouni", contact: "Guichet", ordre: 1 })],
    }),
  ];

  const procedures: ProcedureOps[] = [
    {
      id: "PRC-001",
      numero: "PR-2026-001",
      type: "Procédure provisoire",
      clientId: atlas.id,
      dossierId: dossierAtlas.id,
      courseId: "CRS-0084",
      responsable: "Yassine Bennani",
      coursierId: "CR-AHMED",
      date: todayIso(),
      statut: "En cours",
      etapes: MODELE_PROCEDURE_PROVISOIRE.map((libelle, i) => ({
        id: oid("etp"),
        libelle,
        statut: i < 3 ? ("Validée" as const) : i === 3 ? ("En cours" as const) : ("À faire" as const),
        responsable: i < 4 ? "Ahmed Benali" : "",
        date: i < 4 ? todayIso() : "",
        commentaire: "",
      })),
      documents: [],
      notesInternes: [],
      notes: "Vérification du poids obligatoire avant validation.",
      historique: [{ id: oid("ev"), date: horodatage(), auteur: "Yassine Bennani", action: "Procédure créée" }],
      archive: false,
    },
    {
      id: "PRC-002",
      numero: "PR-2026-002",
      type: "Vérification poids",
      clientId: labo.id,
      dossierId: "DOS-LABO",
      courseId: "CRS-0087",
      responsable: "Hamza Ouali",
      coursierId: "CR-SOUFIANE",
      date: daysAgoIso(1),
      statut: "En attente",
      etapes: [
        { id: oid("etp"), libelle: "Récupérer les documents", statut: "Validée", responsable: "Soufiane Tazi", date: daysAgoIso(1), commentaire: "" },
        { id: oid("etp"), libelle: "Vérifier le poids", statut: "En cours", responsable: "Soufiane Tazi", date: "", commentaire: "" },
        { id: oid("etp"), libelle: "Ajouter le justificatif", statut: "À faire", responsable: "", date: "", commentaire: "" },
      ],
      documents: [],
      notesInternes: [],
      notes: "",
      historique: [],
      archive: false,
    },
  ];

  const audios: AudioCoursier[] = [
    {
      id: oid("aud"),
      courseId: "CRS-0084",
      coursierId: "CR-AHMED",
      date: todayIso(),
      heure: "10:12",
      duree: "0:34",
      transcription: "Je suis arrivé chez le fournisseur, le comptable demande un bon de commande signé.",
      lu: false,
    },
    {
      id: oid("aud"),
      courseId: "CRS-0086",
      coursierId: "CR-YOUSSEF",
      date: todayIso(),
      heure: "11:02",
      duree: "0:21",
      transcription: "Le guichet du tribunal est fermé pour inventaire, j’attends vos instructions.",
      lu: false,
    },
  ];

  const notifications: NotificationOps[] = [
    { id: oid("ntf"), titre: "Course urgente non affectée", detail: "C-2026-0085 — Atlas Industrie", date: horodatage(), gravite: "critique", lue: false },
    { id: oid("ntf"), titre: "Course bloquée", detail: "C-2026-0086 — guichet fermé", date: horodatage(), gravite: "alerte", lue: false },
    { id: oid("ntf"), titre: "Message audio du coursier", detail: "Ahmed Benali — C-2026-0084", date: horodatage(), gravite: "info", lue: false },
  ];

  return {
    clients: [atlas, lahlou, bennis, labo],
    contacts,
    dossiers,
    courses,
    coursiers,
    procedures,
    audios,
    notifications,
    audit: [{ id: oid("ev"), date: horodatage(), auteur: "Système", action: "Données de démonstration chargées" }],
  };
}

/* ------------------------------------------------------------------ */
/* Tonalités de statut                                                 */
/* ------------------------------------------------------------------ */

export function toneCourse(statut: StatutCourse) {
  switch (statut) {
    case "En attente":
    case "À affecter":
      return "bg-warning/15 text-warning-foreground border-warning/40";
    case "Affectée":
    case "Acceptée":
      return "bg-primary/12 text-primary border-primary/35";
    case "En cours":
      return "bg-whatsapp/15 text-navy border-whatsapp/40";
    case "Bloquée":
    case "Annulée":
      return "bg-destructive/12 text-destructive border-destructive/35";
    case "Terminée":
    case "Validée":
      return "bg-success/15 text-navy border-success/40";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function toneDossier(statut: StatutDossier) {
  if (statut === "Terminé" || statut === "Facturé") return "bg-success/15 text-navy border-success/40";
  if (statut === "Nouveau" || statut === "En préparation") return "bg-primary/12 text-primary border-primary/35";
  if (statut.startsWith("En attente")) return "bg-warning/15 text-warning-foreground border-warning/40";
  if (statut === "En cours" || statut === "À valider") return "bg-whatsapp/15 text-navy border-whatsapp/40";
  return "bg-muted text-muted-foreground border-border";
}

export function toneCoursier(statut: StatutCoursier) {
  if (statut === "Disponible") return "bg-success/15 text-navy border-success/40";
  if (statut === "Occupé") return "bg-warning/15 text-warning-foreground border-warning/40";
  return "bg-muted text-muted-foreground border-border";
}

export function toneProcedure(statut: StatutProcedure) {
  if (statut === "Terminée") return "bg-success/15 text-navy border-success/40";
  if (statut === "En cours") return "bg-whatsapp/15 text-navy border-whatsapp/40";
  if (statut === "En attente") return "bg-warning/15 text-warning-foreground border-warning/40";
  if (statut === "Annulée") return "bg-destructive/12 text-destructive border-destructive/35";
  return "bg-primary/12 text-primary border-primary/35";
}
