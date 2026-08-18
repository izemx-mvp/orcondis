// Modèle de données ORCONDIS (Partie 1) — données simulées cohérentes.

export const SERVICES = [
  "Récupération de documents",
  "Livraison de documents",
  "Courses administratives",
  "Paiement de factures",
  "Paiement de fournisseurs",
  "Récupération de chèques",
  "Dépôt de chèques",
  "Procédures administratives",
  "Vérification / contrôle",
  "Exclusive (Tizzla & Serve)",
  "Autres prestations",
] as const;

export type Service = (typeof SERVICES)[number];

export const SOURCES = [
  "Site web",
  "WhatsApp",
  "Téléphone",
  "Back-Office",
  "Email",
  "Autre",
] as const;
export type Source = (typeof SOURCES)[number];

export const STATUSES = [
  "À qualifier",
  "Qualification WhatsApp",
  "Intervention humaine requise",
  "En attente client",
  "Informations complètes",
  "Transformée",
  "Annulée",
] as const;
export type Statut = (typeof STATUSES)[number];

export type Completion = "Complété" | "Manquant" | "À confirmer";

export type DocumentJoint = {
  id: string;
  nom: string;
  type: "PDF" | "Photo" | "Facture" | "Chèque" | "Bon" | "Document administratif" | "Autre";
  taille: string;
  ajoutePar: string;
  date: string;
};

export type NoteInterne = {
  id: string;
  auteur: string;
  texte: string;
  date: string;
};

export type EvenementHistorique = {
  id: string;
  date: string;
  auteur: string;
  action: string;
};

export type MessageWhatsApp = {
  id: string;
  auteur: "client" | "agent" | "humain";
  nom: string;
  texte: string;
  heure: string;
};

export type Adresse = {
  ville: string;
  quartier: string;
  adresse: string;
  zone: string;
  contact: string;
  gsm: string;
  instructions?: string;
};

export type Qualification = {
  typeClient: string;
  denomination: string;
  raisonSociale: string;
  typeCourse: string;
  niveauImportance: string;
  instructionsSpeciales: string;
  retrait: Adresse | null;
  destinations: Adresse[];
  planning: {
    date: string;
    trancheHoraire: string;
    heureFixe: string;
    urgence: "Normale" | "Urgente" | "Exclusive";
  };
  resumeIA: string;
};

export type Demande = {
  id: string;
  numero: string;
  jour: string;
  date: string;
  heure: string;
  source: Source;
  typeClient: "Client existant" | "Nouveau client";
  nom: string;
  prenom: string;
  societe: string;
  telephone: string;
  whatsapp: string;
  email: string;
  service: Service | string;
  messageInitial: string;
  documents: DocumentJoint[];
  agentWhatsApp: string;
  responsableHumain: string;
  informationsManquantes: string[];
  derniereInteraction: string;
  statut: Statut;
  notes: NoteInterne[];
  historique: EvenementHistorique[];
  conversation: MessageWhatsApp[];
  qualification: Qualification;
  archivee: boolean;
  consentementWhatsApp: boolean;
};

export const RESPONSABLES = [
  "Yassine Bennani",
  "Salma Idrissi",
  "Hamza Ouali",
  "Nadia Cherkaoui",
];

const JOURS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export function jourDe(dateIso: string) {
  const d = new Date(dateIso + "T12:00:00");
  return JOURS[d.getDay()] ?? "";
}

export function formatDateFr(dateIso: string) {
  const [a, m, j] = dateIso.split("-");
  return `${j}/${m}/${a}`;
}

export function emptyQualification(): Qualification {
  return {
    typeClient: "",
    denomination: "",
    raisonSociale: "",
    typeCourse: "",
    niveauImportance: "",
    instructionsSpeciales: "",
    retrait: null,
    destinations: [],
    planning: { date: "", trancheHoraire: "", heureFixe: "", urgence: "Normale" as "Normale" | "Urgente" | "Exclusive" },
    resumeIA: "",
  };
}

export function statutTone(statut: Statut) {
  switch (statut) {
    case "À qualifier":
      return "bg-warning/15 text-warning-foreground border-warning/40";
    case "Qualification WhatsApp":
      return "bg-whatsapp/15 text-navy border-whatsapp/40";
    case "Intervention humaine requise":
      return "bg-destructive/12 text-destructive border-destructive/35";
    case "En attente client":
      return "bg-muted text-muted-foreground border-border";
    case "Informations complètes":
      return "bg-success/15 text-navy border-success/40";
    case "Transformée":
      return "bg-primary/12 text-primary border-primary/35";
    case "Annulée":
      return "bg-muted text-muted-foreground border-border line-through";
  }
}

export function urgenceTone(urgence: string) {
  switch (urgence) {
    case "Exclusive":
      return "bg-amber-500/10 text-amber-700 border-amber-500/30 font-bold";
    case "Urgente":
      return "bg-destructive/10 text-destructive border-destructive/30";
    default:
      return "bg-primary/10 text-primary border-primary/30";
  }
}

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

let counter = 1000;
export function nextNumero(existants: Demande[]) {
  const max = existants.reduce((acc, d) => {
    const n = Number(d.numero.replace(/\D/g, ""));
    return Number.isFinite(n) && n > acc ? n : acc;
  }, counter);
  return `DEM-${max + 1}`;
}

export function uid() {
  counter += 1;
  return `${Date.now().toString(36)}-${counter.toString(36)}`;
}

function base(
  partial: Partial<Demande> & { numero: string; date: string; heure: string },
): Demande {
  return {
    id: partial.numero,
    jour: jourDe(partial.date),
    source: "Site web",
    typeClient: "Client existant",
    nom: "",
    prenom: "",
    societe: "",
    telephone: "",
    whatsapp: "",
    email: "",
    service: "Autres prestations",
    messageInitial: "",
    documents: [],
    agentWhatsApp: "Assistant ORCONDIS",
    responsableHumain: "",
    informationsManquantes: [],
    derniereInteraction: `${formatDateFr(partial.date)} ${partial.heure}`,
    statut: "À qualifier",
    notes: [],
    historique: [],
    conversation: [],
    qualification: emptyQualification(),
    archivee: false,
    consentementWhatsApp: true,
    ...partial,
  } as Demande;
}

export function seedDemandes(): Demande[] {
  return [
    base({
      numero: "DEM-1041",
      date: today(),
      heure: "08:42",
      typeClient: "Client existant",
      nom: "Benjelloun",
      prenom: "Karim",
      societe: "Atlas Industrie",
      telephone: "+212 661 45 22 10",
      whatsapp: "+212 661 45 22 10",
      email: "k.benjelloun@atlas-industrie.ma",
      service: "Récupération de chèques",
      messageInitial:
        "Je dois récupérer un chèque et payer un fournisseur demain matin.",
      statut: "Informations complètes",
      responsableHumain: "Yassine Bennani",
      informationsManquantes: [],
      derniereInteraction: `${formatDateFr(today())} 09:15`,
      documents: [
        {
          id: "d1",
          nom: "Bon-de-commande-4471.pdf",
          type: "PDF",
          taille: "218 Ko",
          ajoutePar: "Karim Benjelloun",
          date: `${formatDateFr(today())} 09:02`,
        },
      ],
      conversation: [
        {
          id: "m1",
          auteur: "agent",
          nom: "Assistant ORCONDIS",
          heure: "08:45",
          texte:
            "Bonjour Monsieur Karim. Votre demande a bien été reçue. Pouvez-vous m’indiquer l’adresse où le chèque doit être récupéré ?",
        },
        { id: "m2", auteur: "client", nom: "Karim Benjelloun", heure: "08:48", texte: "Maarif, Casablanca." },
        {
          id: "m3",
          auteur: "agent",
          nom: "Assistant ORCONDIS",
          heure: "08:49",
          texte: "Merci. Quel est le nom du fournisseur et son adresse ?",
        },
        { id: "m4", auteur: "client", nom: "Karim Benjelloun", heure: "08:53", texte: "Fournitures Atlas, Aïn Sebaâ." },
        {
          id: "m5",
          auteur: "agent",
          nom: "Assistant ORCONDIS",
          heure: "08:54",
          texte:
            "Souhaitez-vous que la mission soit réalisée à une heure précise ou durant la matinée ?",
        },
        { id: "m6", auteur: "client", nom: "Karim Benjelloun", heure: "08:57", texte: "Avant 11h." },
        {
          id: "m7",
          auteur: "agent",
          nom: "Assistant ORCONDIS",
          heure: "08:58",
          texte:
            "Parfait, toutes les informations nécessaires sont réunies. Votre demande est transmise à notre équipe opérationnelle.",
        },
      ],
      qualification: {
        typeClient: "Entreprise",
        denomination: "Atlas Industrie",
        raisonSociale: "Atlas Industrie SARL",
        typeCourse: "Récupération + paiement fournisseur",
        niveauImportance: "Élevé",
        instructionsSpeciales: "Chèque à remettre en main propre au service comptabilité.",
        retrait: {
          ville: "Casablanca",
          quartier: "Maarif",
          adresse: "12, rue Ibnou Mounir, Maarif",
          zone: "Zone A",
          contact: "Karim Benjelloun",
          gsm: "+212 661 45 22 10",
        },
        destinations: [
          {
            ville: "Casablanca",
            quartier: "Aïn Sebaâ",
            adresse: "Zone industrielle, lot 42, Aïn Sebaâ",
            zone: "Zone C",
            contact: "Fournitures Atlas — M. Rachid",
            gsm: "+212 522 66 14 05",
            instructions: "Récupérer le reçu de paiement signé.",
          },
        ],
        planning: {
          date: today(),
          trancheHoraire: "Matin (08h – 12h)",
          heureFixe: "Avant 11h00",
          urgence: "Urgente",
        },
        resumeIA:
          "Récupération d’un chèque à Maarif puis paiement du fournisseur Fournitures Atlas à Aïn Sebaâ, à réaliser avant 11h00.",
      },
      notes: [
        {
          id: "n1",
          auteur: "Yassine Bennani",
          texte: "Client prioritaire, prévoir un coursier disponible dès 08h30.",
          date: `${formatDateFr(today())} 09:10`,
        },
      ],
      historique: [
        { id: "h1", date: `${formatDateFr(today())} 08:42`, auteur: "Site web", action: "Demande créée" },
        { id: "h2", date: `${formatDateFr(today())} 08:45`, auteur: "Assistant ORCONDIS", action: "Qualification WhatsApp démarrée" },
        { id: "h3", date: `${formatDateFr(today())} 08:58`, auteur: "Assistant ORCONDIS", action: "Informations complètes" },
      ],
    }),
    base({
      numero: "DEM-1042",
      date: today(),
      heure: "09:20",
      nom: "Alaoui",
      prenom: "Fatima",
      societe: "Société Marocaine de Distribution",
      telephone: "+212 662 10 88 34",
      whatsapp: "+212 662 10 88 34",
      email: "f.alaoui@smd.ma",
      service: "Paiement de factures",
      messageInitial:
        "Nous avons trois factures d’électricité à régler avant vendredi.",
      statut: "Qualification WhatsApp",
      informationsManquantes: ["Adresse de retrait", "Tranche horaire", "Montant total"],
      derniereInteraction: `${formatDateFr(today())} 10:05`,
      conversation: [
        {
          id: "m1",
          auteur: "agent",
          nom: "Assistant ORCONDIS",
          heure: "09:22",
          texte:
            "Bonjour Madame Alaoui, nous avons bien reçu votre demande de paiement de factures. Pouvez-vous me préciser où récupérer les avis de paiement ?",
        },
        { id: "m2", auteur: "client", nom: "Fatima Alaoui", heure: "10:05", texte: "Je vous confirme l’adresse dans la journée." },
      ],
      qualification: {
        ...emptyQualification(),
        typeClient: "Entreprise",
        denomination: "Société Marocaine de Distribution",
        raisonSociale: "SMD SA",
        typeCourse: "Paiement",
        niveauImportance: "Normal",
        resumeIA: "Règlement de trois factures d’électricité avant vendredi. Adresse de retrait en attente.",
      },
      historique: [
        { id: "h1", date: `${formatDateFr(today())} 09:20`, auteur: "Site web", action: "Demande créée" },
      ],
    }),
    base({
      numero: "DEM-1043",
      date: today(),
      heure: "10:35",
      source: "WhatsApp",
      typeClient: "Nouveau client",
      nom: "El Mansouri",
      prenom: "Omar",
      societe: "Cabinet El Mansouri",
      telephone: "+212 663 74 91 20",
      whatsapp: "+212 663 74 91 20",
      email: "contact@cabinet-elmansouri.ma",
      service: "Procédures administratives",
      messageInitial:
        "Dépôt d’un dossier au tribunal de commerce, avec des frais à avancer.",
      statut: "Intervention humaine requise",
      responsableHumain: "Salma Idrissi",
      informationsManquantes: ["Montant des frais", "Mandat signé"],
      derniereInteraction: `${formatDateFr(today())} 11:12`,
      conversation: [
        {
          id: "m1",
          auteur: "client",
          nom: "Omar El Mansouri",
          heure: "10:35",
          texte: "Bonjour, il faut avancer des frais de greffe. Je préfère parler à un responsable.",
        },
        {
          id: "m2",
          auteur: "agent",
          nom: "Assistant ORCONDIS",
          heure: "10:36",
          texte: "Bien entendu Maître, je transmets votre demande à un responsable ORCONDIS.",
        },
      ],
      qualification: {
        ...emptyQualification(),
        typeClient: "Professionnel",
        denomination: "Cabinet El Mansouri",
        raisonSociale: "Cabinet El Mansouri",
        typeCourse: "Procédure administrative",
        niveauImportance: "Élevé",
        resumeIA:
          "Dépôt de dossier au tribunal de commerce avec avance de frais : instruction financière sensible, validation humaine requise.",
      },
      notes: [
        {
          id: "n1",
          auteur: "Salma Idrissi",
          texte: "Instructions financières sensibles : valider le plafond d’avance avec la direction.",
          date: `${formatDateFr(today())} 11:12`,
        },
      ],
      historique: [
        { id: "h1", date: `${formatDateFr(today())} 10:35`, auteur: "WhatsApp", action: "Demande créée" },
        { id: "h2", date: `${formatDateFr(today())} 10:40`, auteur: "Assistant ORCONDIS", action: "Escalade : intervention humaine requise" },
      ],
    }),
    base({
      numero: "DEM-1044",
      date: daysAgo(1),
      heure: "14:05",
      nom: "Tazi",
      prenom: "Sanaa",
      societe: "Laboratoire Al Amal",
      telephone: "+212 664 30 55 77",
      whatsapp: "+212 664 30 55 77",
      email: "s.tazi@labalamal.ma",
      service: "Livraison de documents",
      messageInitial: "Livraison de résultats d’analyses à deux cliniques partenaires.",
      statut: "En attente client",
      informationsManquantes: ["Contact sur place clinique 2"],
      derniereInteraction: `${formatDateFr(daysAgo(1))} 16:40`,
      conversation: [
        {
          id: "m1",
          auteur: "agent",
          nom: "Assistant ORCONDIS",
          heure: "14:10",
          texte:
            "Bonjour Madame Tazi, il me manque uniquement le contact sur place de la seconde clinique pour finaliser votre demande.",
        },
      ],
      qualification: {
        ...emptyQualification(),
        typeClient: "Entreprise",
        denomination: "Laboratoire Al Amal",
        raisonSociale: "Laboratoire Al Amal SARL",
        typeCourse: "Livraison multi-destinations",
        niveauImportance: "Normal",
        retrait: {
          ville: "Casablanca",
          quartier: "Gauthier",
          adresse: "45, boulevard d’Anfa",
          zone: "Zone A",
          contact: "Sanaa Tazi",
          gsm: "+212 664 30 55 77",
        },
        destinations: [
          {
            ville: "Casablanca",
            quartier: "Bourgogne",
            adresse: "Clinique Al Madina, rue Jaafar Essadik",
            zone: "Zone A",
            contact: "Dr. Amrani",
            gsm: "+212 522 27 41 09",
          },
        ],
        planning: {
          date: daysAgo(0),
          trancheHoraire: "Après-midi (14h – 18h)",
          heureFixe: "",
          urgence: "Normale",
        },
        resumeIA: "Livraison de résultats vers deux cliniques ; contact de la seconde clinique manquant.",
      },
      historique: [
        { id: "h1", date: `${formatDateFr(daysAgo(1))} 14:05`, auteur: "Site web", action: "Demande créée" },
      ],
    }),
    base({
      numero: "DEM-1045",
      date: daysAgo(2),
      heure: "11:15",
      source: "Téléphone",
      nom: "Berrada",
      prenom: "Youssef",
      societe: "Atlas Industrie",
      telephone: "+212 661 45 22 18",
      whatsapp: "+212 661 45 22 18",
      email: "y.berrada@atlas-industrie.ma",
      service: "Dépôt de chèques",
      messageInitial: "Dépôt de quatre chèques à la banque, agence Sidi Maârouf.",
      statut: "Transformée",
      responsableHumain: "Hamza Ouali",
      derniereInteraction: `${formatDateFr(daysAgo(2))} 12:30`,
      qualification: {
        ...emptyQualification(),
        typeClient: "Entreprise",
        denomination: "Atlas Industrie",
        typeCourse: "Dépôt bancaire",
        niveauImportance: "Normal",
        resumeIA: "Dépôt de 4 chèques à l’agence bancaire de Sidi Maârouf. Demande transformée en dossier opérationnel.",
      },
      historique: [
        { id: "h1", date: `${formatDateFr(daysAgo(2))} 11:15`, auteur: "Téléphone", action: "Demande créée" },
        { id: "h2", date: `${formatDateFr(daysAgo(2))} 12:30`, auteur: "Hamza Ouali", action: "Demande transformée" },
      ],
    }),
    base({
      numero: "DEM-1046",
      date: daysAgo(3),
      heure: "16:48",
      source: "Email",
      typeClient: "Nouveau client",
      nom: "Chraibi",
      prenom: "Leila",
      societe: "Cabinet El Mansouri",
      telephone: "+212 665 22 08 41",
      whatsapp: "+212 665 22 08 41",
      email: "l.chraibi@cabinet-elmansouri.ma",
      service: "Vérification / contrôle",
      messageInitial: "Vérification de l’affichage légal sur un chantier à Bouskoura.",
      statut: "Annulée",
      derniereInteraction: `${formatDateFr(daysAgo(3))} 17:20`,
      notes: [
        {
          id: "n1",
          auteur: "Nadia Cherkaoui",
          texte: "Annulée à la demande du client, prestation reportée au mois prochain.",
          date: `${formatDateFr(daysAgo(3))} 17:20`,
        },
      ],
      historique: [
        { id: "h1", date: `${formatDateFr(daysAgo(3))} 16:48`, auteur: "Email", action: "Demande créée" },
        { id: "h2", date: `${formatDateFr(daysAgo(3))} 17:20`, auteur: "Nadia Cherkaoui", action: "Demande annulée" },
      ],
    }),
    base({
      numero: "DEM-1047",
      date: today(),
      heure: "11:58",
      nom: "Naciri",
      prenom: "Mehdi",
      societe: "Société Marocaine de Distribution",
      telephone: "+212 667 91 33 02",
      whatsapp: "+212 667 91 33 02",
      email: "m.naciri@smd.ma",
      service: "Courses administratives",
      messageInitial: "Retrait d’un certificat de conformité à la commune de Sidi Belyout.",
      statut: "À qualifier",
      informationsManquantes: ["Adresse de retrait", "Date souhaitée", "Pièce d’identité mandataire"],
      derniereInteraction: `${formatDateFr(today())} 11:58`,
      historique: [
        { id: "h1", date: `${formatDateFr(today())} 11:58`, auteur: "Site web", action: "Demande créée" },
      ],
    }),
  ];
}
