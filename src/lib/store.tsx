import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  emptyQualification,
  formatDateFr,
  jourDe,
  nextNumero,
  seedDemandes,
  uid,
  type Demande,
  type DocumentJoint,
  type MessageWhatsApp,
  type Qualification,
  type Statut,
} from "./orcondis";

const STORAGE_KEY = "orcondis.demandes.v1";

type NouvelleDemande = {
  categorie: string;
  sousType: string;
  autrePrecision: string;
  nom: string;
  prenom: string;
  denomination: string;
  raisonSociale: string;
  ville: string;
  quartier: string;
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
  service: string;
  messageInitial: string;
  source?: Demande["source"];
  consentementWhatsApp: boolean;
  documents?: DocumentJoint[];
};

type Ctx = {
  demandes: Demande[];
  getDemande: (id: string) => Demande | undefined;
  creerDemande: (d: NouvelleDemande) => Demande;
  majDemande: (id: string, patch: Partial<Demande>, action?: string) => void;
  majQualification: (id: string, patch: Partial<Qualification>) => void;
  changerStatut: (id: string, statut: Statut) => void;
  assigner: (id: string, responsable: string) => void;
  ajouterNote: (id: string, texte: string, auteur?: string) => void;
  ajouterDocument: (id: string, doc: Omit<DocumentJoint, "id" | "date">) => void;
  ajouterMessage: (id: string, msg: Omit<MessageWhatsApp, "id" | "heure">) => void;
  archiver: (id: string, archivee: boolean) => void;
  reinitialiser: () => void;
};

const StoreContext = createContext<Ctx | null>(null);

const maintenant = () => {
  const d = new Date();
  return {
    date: d.toISOString().slice(0, 10),
    heure: d.toTimeString().slice(0, 5),
    horodatage: `${formatDateFr(d.toISOString().slice(0, 10))} ${d.toTimeString().slice(0, 5)}`,
  };
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [demandes, setDemandes] = useState<Demande[]>(() => seedDemandes());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setDemandes(JSON.parse(raw) as Demande[]);
    } catch {
      /* données de démonstration conservées */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(demandes));
    } catch {
      /* stockage indisponible */
    }
  }, [demandes]);

  const patchOne = useCallback(
    (id: string, fn: (d: Demande) => Demande) =>
      setDemandes((prev) => prev.map((d) => (d.id === id ? fn(d) : d))),
    [],
  );

  const withHistory = (d: Demande, action: string, auteur = "Back-Office"): Demande => ({
    ...d,
    derniereInteraction: maintenant().horodatage,
    historique: [
      ...d.historique,
      { id: uid(), date: maintenant().horodatage, auteur, action },
    ],
  });

  const value = useMemo<Ctx>(
    () => ({
      demandes,
      getDemande: (id) => demandes.find((d) => d.id === id),
      creerDemande: (input) => {
        const { date, heure, horodatage } = maintenant();
        const numero = nextNumero(demandes);
        const nouvelle: Demande = {
          id: numero,
          numero,
          jour: jourDe(date),
          date,
          heure,
          source: input.source ?? "Site web",
          typeClient: "Nouveau client", // On force "Nouveau" par défaut pour les demandes site
          nom: input.nom,
          prenom: input.prenom,
          societe: input.denomination || input.raisonSociale || "",
          telephone: input.gsm || input.telephoneFixe || "",
          whatsapp: input.whatsapp || input.gsm || "",
          email: input.email,
          service: input.service,
          messageInitial: input.messageInitial,
          documents: input.documents ?? [],
          agentWhatsApp: "Assistant ORCONDIS",
          responsableHumain: "",
          informationsManquantes: [
            "Adresse de retrait",
            "Destination",
            "Date et tranche horaire",
            "Contact sur place",
          ],
          derniereInteraction: horodatage,
          statut: "À qualifier",
          notes: [],
          historique: [
            { id: uid(), date: horodatage, auteur: input.source ?? "Site web", action: "Demande créée" },
          ],
          conversation: input.consentementWhatsApp
            ? [
                {
                  id: uid(),
                  auteur: "agent",
                  nom: "Assistant ORCONDIS",
                  heure,
                  texte: `Bonjour ${input.prenom ? "Monsieur/Madame " + input.prenom : ""}, nous avons bien reçu votre demande concernant « ${input.service} ». J’ai besoin de quelques informations complémentaires afin de préparer votre demande.`.replace(
                    /\s+,/,
                    ",",
                  ),
                },
              ]
            : [],
          qualification: {
            ...emptyQualification(),
            typeClient: input.categorie,
            denomination: input.denomination || input.raisonSociale || "",
            resumeIA: input.messageInitial,
          },
          archivee: false,
          consentementWhatsApp: input.consentementWhatsApp,
        };
        setDemandes((prev) => [nouvelle, ...prev]);
        return nouvelle;
      },
      majDemande: (id, patch, action = "Demande modifiée") =>
        patchOne(id, (d) => withHistory({ ...d, ...patch }, action)),
      majQualification: (id, patch) =>
        patchOne(id, (d) =>
          withHistory({ ...d, qualification: { ...d.qualification, ...patch } }, "Informations collectées mises à jour"),
        ),
      changerStatut: (id, statut) =>
        patchOne(id, (d) => withHistory({ ...d, statut }, `Statut : ${statut}`)),
      assigner: (id, responsable) =>
        patchOne(id, (d) =>
          withHistory({ ...d, responsableHumain: responsable }, `Assignée à ${responsable}`),
        ),
      ajouterNote: (id, texte, auteur = "Yassine Bennani") =>
        patchOne(id, (d) =>
          withHistory(
            {
              ...d,
              notes: [...d.notes, { id: uid(), auteur, texte, date: maintenant().horodatage }],
            },
            "Note interne ajoutée",
          ),
        ),
      ajouterDocument: (id, doc) =>
        patchOne(id, (d) =>
          withHistory(
            { ...d, documents: [...d.documents, { ...doc, id: uid(), date: maintenant().horodatage }] },
            `Document ajouté : ${doc.nom}`,
          ),
        ),
      ajouterMessage: (id, msg) =>
        patchOne(id, (d) => ({
          ...d,
          derniereInteraction: maintenant().horodatage,
          conversation: [...d.conversation, { ...msg, id: uid(), heure: maintenant().heure }],
        })),
      archiver: (id, archivee) =>
        patchOne(id, (d) => withHistory({ ...d, archivee }, archivee ? "Demande archivée" : "Demande restaurée")),
      reinitialiser: () => setDemandes(seedDemandes()),
    }),
    [demandes, patchOne],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore doit être utilisé dans StoreProvider");
  return ctx;
}
