// ORCONDIS — Module WhatsApp : conversations, agent IA, handoff humain.

export const RAISONS_HANDOFF = [
  "Demande ambiguë",
  "Tarification spéciale",
  "Procédure complexe",
  "Client demande un conseiller",
  "Informations contradictoires",
  "Agent incapable de continuer",
  "Instruction financière sensible",
  "Exception",
] as const;
export type RaisonHandoff = (typeof RAISONS_HANDOFF)[number];

export const STATUTS_CONVERSATION = [
  "Agent WhatsApp",
  "Intervention humaine",
  "En attente client",
  "Informations complètes",
  "Clôturée",
] as const;
export type StatutConversation = (typeof STATUTS_CONVERSATION)[number];

export const CHAMPS_REQUIS = [
  "Client",
  "Contact",
  "Type de demande",
  "Retrait",
  "Destination",
  "Date",
  "Tranche horaire",
  "Heure",
  "Priorité",
  "Documents",
  "Instructions",
] as const;

export type MessageWA = {
  id: string;
  auteur: "Client" | "Agent IA" | "Opérateur";
  nom: string;
  texte: string;
  date: string;
  heure: string;
};

export type Handoff = {
  id: string;
  raison: RaisonHandoff;
  date: string;
  heure: string;
  operateur: string;
  resumeIA: string;
};

export type NoteWA = { id: string; auteur: string; texte: string; date: string };

export type Conversation = {
  id: string;
  clientId: string;
  clientNom: string;
  numero: string;
  contact: string;
  demandeNumero: string;
  dossierId: string;
  courseId: string;
  statut: StatutConversation;
  responsable: string;
  resumeIA: string;
  infos: Record<string, string>;
  manquantes: string[];
  messages: MessageWA[];
  handoffs: Handoff[];
  notes: NoteWA[];
  documents: { id: string; nom: string; type: string; date: string }[];
  nonLus: number;
  derniereActivite: string;
  archive: boolean;
};

let wseq = 100;
export const wid = (p = "wa") => {
  wseq += 1;
  return `${p}-${wseq.toString(36)}-${Date.now().toString(36)}`;
};

const jour = (n: number) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

const msg = (
  auteur: MessageWA["auteur"],
  nom: string,
  texte: string,
  heure: string,
  date = jour(0),
): MessageWA => ({ id: wid("msg"), auteur, nom, texte, date, heure });

export function toneConversation(statut: StatutConversation) {
  switch (statut) {
    case "Intervention humaine":
      return "border-destructive/30 bg-destructive/15 text-destructive";
    case "En attente client":
      return "border-warning/30 bg-warning/15 text-warning";
    case "Informations complètes":
      return "border-success/30 bg-success/15 text-success";
    case "Clôturée":
      return "border-border bg-muted text-muted-foreground";
    default:
      return "border-primary/30 bg-primary/15 text-primary";
  }
}

export function seedConversations(): Conversation[] {
  return [
    {
      id: "WA-001",
      clientId: "CLI-001",
      clientNom: "Atlas Industrie SARL",
      numero: "+212 661 45 22 10",
      contact: "Karim Benjelloun",
      demandeNumero: "DEM-2401",
      dossierId: "DOS-001",
      courseId: "",
      statut: "Agent WhatsApp",
      responsable: "Agent IA",
      resumeIA:
        "Le client souhaite faire récupérer un chèque au siège et le déposer en banque. Le retrait et la date sont connus, la tranche horaire reste à confirmer.",
      infos: {
        Client: "Atlas Industrie SARL",
        Contact: "Karim Benjelloun",
        "Type de demande": "Récupération de chèques",
        Retrait: "12, rue Ibnou Mounir, Maarif",
        Destination: "Agence bancaire Anfa",
        Date: jour(0),
        "Priorité": "Normale",
      },
      manquantes: ["Tranche horaire", "Heure", "Documents", "Instructions"],
      messages: [
        msg("Agent IA", "Agent ORCONDIS", "Bonjour, ici l’assistant ORCONDIS. Nous avons bien reçu votre demande du site web.", "09:02"),
        msg("Agent IA", "Agent ORCONDIS", "Merci de confirmer l’adresse de retrait ainsi que la date souhaitée.", "09:03"),
        msg("Client", "Karim Benjelloun", "Retrait au siège, 12 rue Ibnou Mounir. Pour aujourd’hui si possible.", "09:11"),
        msg("Agent IA", "Agent ORCONDIS", "Parfait. Quelle tranche horaire vous convient : matin ou après-midi ?", "09:12"),
      ],
      handoffs: [],
      notes: [{ id: wid("nt"), auteur: "Salma Idrissi", texte: "Client sensible aux délais, prévoir une moto.", date: jour(0) }],
      documents: [],
      nonLus: 2,
      derniereActivite: "09:12",
      archive: false,
    },
    {
      id: "WA-002",
      clientId: "CLI-002",
      clientNom: "Cabinet Lahlou & Associés",
      numero: "+212 663 78 90 12",
      contact: "Imane Sabir",
      demandeNumero: "DEM-2402",
      dossierId: "DOS-002",
      courseId: "CRS-002",
      statut: "Intervention humaine",
      responsable: "Hamza Ouali",
      resumeIA:
        "Dépôt de pièces au greffe avec exigence de tampon. Le client demande une tarification particulière pour une seconde destination.",
      infos: {
        Client: "Cabinet Lahlou & Associés",
        Contact: "Imane Sabir",
        "Type de demande": "Dépôt greffe",
        Retrait: "8, boulevard Anfa",
        Destination: "Tribunal de commerce",
        Date: jour(0),
        "Tranche horaire": "Matin (08h – 12h)",
        "Priorité": "Urgente",
        Instructions: "Faire tamponner la copie de dépôt.",
      },
      manquantes: ["Heure", "Documents"],
      messages: [
        msg("Client", "Imane Sabir", "Bonjour, nous avons un dépôt urgent au greffe ce matin.", "08:20"),
        msg("Agent IA", "Agent ORCONDIS", "Bien noté. Souhaitez-vous une seconde destination après le greffe ?", "08:21"),
        msg("Client", "Imane Sabir", "Oui, et je voudrais connaître le tarif exact pour la seconde adresse.", "08:26"),
        msg("Opérateur", "Hamza Ouali", "Bonjour Madame Sabir, Hamza du back-office ORCONDIS prend le relais sur votre demande.", "08:31"),
      ],
      handoffs: [
        {
          id: wid("ho"),
          raison: "Tarification spéciale",
          date: jour(0),
          heure: "08:30",
          operateur: "Hamza Ouali",
          resumeIA:
            "Le client demande un tarif pour une destination supplémentaire non couverte par la grille standard.",
        },
      ],
      notes: [],
      documents: [{ id: wid("doc"), nom: "Liste des pièces.pdf", type: "PDF", date: jour(0) }],
      nonLus: 0,
      derniereActivite: "08:31",
      archive: false,
    },
    {
      id: "WA-003",
      clientId: "CLI-003",
      clientNom: "Pharma Distrib Maroc",
      numero: "+212 667 30 44 21",
      contact: "Hicham Filali",
      demandeNumero: "DEM-2403",
      dossierId: "",
      courseId: "",
      statut: "En attente client",
      responsable: "Agent IA",
      resumeIA: "Demande de livraison inter-sites. En attente de l’adresse exacte de destination.",
      infos: {
        Client: "Pharma Distrib Maroc",
        Contact: "Hicham Filali",
        "Type de demande": "Livraison de documents",
        Retrait: "Zone industrielle Sidi Maârouf, lot 118",
        Date: jour(1),
        "Priorité": "Normale",
      },
      manquantes: ["Destination", "Tranche horaire", "Heure", "Documents", "Instructions"],
      messages: [
        msg("Agent IA", "Agent ORCONDIS", "Bonjour, pouvez-vous préciser l’adresse de destination ?", "16:40", jour(1)),
        msg("Agent IA", "Agent ORCONDIS", "Relance : nous restons en attente de l’adresse de destination.", "09:00"),
      ],
      handoffs: [],
      notes: [],
      documents: [],
      nonLus: 0,
      derniereActivite: "09:00",
      archive: false,
    },
    {
      id: "WA-004",
      clientId: "CLI-004",
      clientNom: "Résidences Zerktouni",
      numero: "+212 668 15 62 90",
      contact: "Latifa Amrani",
      demandeNumero: "DEM-2398",
      dossierId: "DOS-003",
      courseId: "CRS-004",
      statut: "Informations complètes",
      responsable: "Salma Idrissi",
      resumeIA: "Récupération de chèque puis règlement fournisseur. Toutes les informations sont réunies.",
      infos: {
        Client: "Résidences Zerktouni",
        Contact: "Latifa Amrani",
        "Type de demande": "Paiement de fournisseurs",
        Retrait: "45, boulevard Zerktouni",
        Destination: "Sté Nettoyage Al Wafa",
        Date: jour(1),
        "Tranche horaire": "Après-midi (14h – 18h)",
        Heure: "15:00",
        "Priorité": "Normale",
        Documents: "Chèque n° 4471203",
        Instructions: "Obtenir un reçu signé et le photographier.",
      },
      manquantes: [],
      messages: [
        msg("Client", "Latifa Amrani", "Le chèque est prêt à être récupéré à l’accueil.", "14:02", jour(1)),
        msg("Agent IA", "Agent ORCONDIS", "Merci, toutes les informations sont réunies. Votre demande passe en traitement.", "14:05", jour(1)),
        msg("Opérateur", "Salma Idrissi", "Course programmée cet après-midi, un coursier vous contactera à l’arrivée.", "14:20", jour(1)),
      ],
      handoffs: [],
      notes: [],
      documents: [{ id: wid("doc"), nom: "Photo chèque 4471203.jpg", type: "Image", date: jour(1) }],
      nonLus: 0,
      derniereActivite: "14:20",
      archive: false,
    },
    {
      id: "WA-005",
      clientId: "CLI-005",
      clientNom: "Younes Berrada",
      numero: "+212 669 84 12 03",
      contact: "Younes Berrada",
      demandeNumero: "DEM-2390",
      dossierId: "",
      courseId: "CRS-005",
      statut: "Clôturée",
      responsable: "Nadia Cherkaoui",
      resumeIA: "Retrait d’un document administratif effectué et validé par le client.",
      infos: {
        Client: "Younes Berrada",
        Contact: "Younes Berrada",
        "Type de demande": "Courses administratives",
        Retrait: "Résidence Al Manar, Californie",
        Destination: "Préfecture Anfa",
        Date: jour(6),
        "Tranche horaire": "Matin (08h – 12h)",
        Heure: "10:00",
        "Priorité": "Normale",
        Documents: "Copie CIN",
        Instructions: "Présenter la procuration.",
      },
      manquantes: [],
      messages: [
        msg("Agent IA", "Agent ORCONDIS", "La prestation liée à votre demande a été réalisée. Merci de confirmer sa bonne exécution.", "17:30", jour(5)),
        msg("Client", "Younes Berrada", "Je confirme, tout est en ordre. Merci.", "18:02", jour(5)),
      ],
      handoffs: [],
      notes: [],
      documents: [],
      nonLus: 0,
      derniereActivite: "18:02",
      archive: false,
    },
  ];
}
