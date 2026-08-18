import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  horodatage,
  nomClient,
  nomCoursier,
  oid,
  seedOps,
  type ClientOps,
  type ContactOps,
  type CourseOps,
  type CoursierOps,
  type DossierOps,
  type Evenement,
  type OpsData,
  type ProcedureOps,
  type StatutCourse,
} from "./ops-data";

const STORAGE_KEY = "orcondis.ops.v1";

type Collections = "clients" | "contacts" | "dossiers" | "courses" | "coursiers" | "procedures";

type Entite = ClientOps | ContactOps | DossierOps | CourseOps | CoursierOps | ProcedureOps;

type Ctx = {
  data: OpsData;
  ajouter: <K extends Collections>(key: K, item: OpsData[K][number]) => void;
  modifier: <K extends Collections>(key: K, id: string, patch: Partial<OpsData[K][number]>, action?: string) => void;
  archiver: (key: Collections, id: string, archive: boolean) => void;
  journaliser: (action: string, auteur?: string) => void;
  changerStatutCourse: (id: string, statut: StatutCourse) => void;
  affecterCoursier: (courseId: string, coursierId: string) => void;
  reaffecterCoursier: (courseId: string, coursierId: string, motif: string, commentaire: string) => void;
  ajouterNote: (key: Collections, id: string, texte: string, auteur?: string) => void;
  ajouterDocument: (key: Collections, id: string, nom: string, type: string, auteur?: string) => void;
  marquerAudioLu: (id: string, lu: boolean) => void;
  marquerNotifLue: (id: string) => void;
  toutMarquerLu: () => void;
  reinitialiser: () => void;
  // Agent de Dispatch
  majSettingsAgent: (patch: Partial<OpsData["settingsAgent"]>) => void;
  programmerCommunication: (courseId: string, patch: Partial<CourseOps["dispatch"]>) => void;
  annulerCommunication: (courseId: string) => void;
  envoyerCommunication: (courseId: string) => void;
  repondreCommunication: (courseId: string, reponse: "Accepté" | "Refusé" | "Question", motif?: string) => void;
};


const OpsContext = createContext<Ctx | null>(null);

const evt = (action: string, auteur = "Yassine Bennani"): Evenement => ({
  id: oid("ev"),
  date: horodatage(),
  auteur,
  action,
});

export function OpsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OpsData>(() => seedOps());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setData((prev) => ({ ...prev, ...(JSON.parse(raw) as OpsData) }));
    } catch {
      /* données de démonstration conservées */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* stockage indisponible */
    }
  }, [data]);

  const mutate = useCallback(
    (key: Collections, fn: (arr: Entite[]) => Entite[], action?: string) =>
      setData((prev) => ({
        ...prev,
        [key]: fn(prev[key] as Entite[]),
        audit: action ? [evt(action), ...prev.audit] : prev.audit,
      })),
    [],
  );

  const patchItem = useCallback(
    (key: Collections, id: string, patch: Record<string, unknown>, action?: string) =>
      mutate(
        key,
        (arr) =>
          arr.map((it) =>
            it.id === id
              ? {
                  ...it,
                  ...patch,
                  historique: action
                    ? [...(((it as { historique?: Evenement[] }).historique ?? []) as Evenement[]), evt(action)]
                    : ((it as { historique?: Evenement[] }).historique ?? []),
                }
              : it,
          ),
        action,
      ),
    [mutate],
  );

  const value = useMemo<Ctx>(
    () => ({
      data,
      ajouter: (key, item) => mutate(key, (arr) => [item as Entite, ...arr], `Création : ${key}`),
      modifier: (key, id, patch, action = "Modification enregistrée") =>
        patchItem(key, id, patch as Record<string, unknown>, action),
      archiver: (key, id, archive) =>
        patchItem(key, id, { archive }, archive ? "Élément archivé" : "Élément restauré"),
      journaliser: (action, auteur) => setData((prev) => ({ ...prev, audit: [evt(action, auteur), ...prev.audit] })),
      changerStatutCourse: (id, statut) => patchItem("courses", id, { statut }, `Statut : ${statut}`),
      affecterCoursier: (courseId, coursierId) =>
        setData((prev) => {
          const coursier = prev.coursiers.find((c) => c.id === coursierId);
          const course = prev.courses.find((c) => c.id === courseId);
          if (!course) return prev;

          // Logic for Agent Dispatch on assignment
          const dispatchStatut = prev.settingsAgent.actif ? "Programmé" : "En attente";
          const immediate = prev.settingsAgent.programmationParDefaut === "Immédiatement après affectation";

          return {
            ...prev,
            courses: prev.courses.map((c) =>
              c.id === courseId
                ? {
                    ...c,
                    coursierId,
                    statut: "Affectée" as StatutCourse,
                    heureEnvoiOrdre: immediate ? new Date().toTimeString().slice(0, 5) : c.heureEnvoiOrdre,
                    dispatch: {
                      ...c.dispatch,
                      statut: immediate ? "Envoyé" : "Programmé",
                      historique: [
                        ...c.dispatch.historique,
                        {
                          id: oid("dsh"),
                          date: horodatage(),
                          action: immediate ? "Envoyé automatiquement" : "Programmé automatiquement",
                          details: `Affectation à ${nomCoursier(coursier)}`,
                          format: c.dispatch.mode === "Audio" ? "Audio" : c.dispatch.mode === "Message texte" ? "Texte" : "Les deux",
                        },
                      ],
                    },
                    historique: [...c.historique, evt(`Course affectée à ${nomCoursier(coursier)}`)],
                  }
                : c,
            ),
            coursiers: prev.coursiers.map((c) => (c.id === coursierId ? { ...c, statut: "Occupé" as const } : c)),
            audit: [evt(`Affectation coursier : ${nomCoursier(coursier)}`), ...prev.audit],
          };
        }),
      reaffecterCoursier: (courseId, coursierId, motif, commentaire) =>
        setData((prev) => {
          const course = prev.courses.find((c) => c.id === courseId);
          const ancien = prev.coursiers.find((c) => c.id === course?.coursierId);
          const nouveau = prev.coursiers.find((c) => c.id === coursierId);
          if (!course) return prev;

          return {
            ...prev,
            courses: prev.courses.map((c) =>
              c.id === courseId
                ? {
                    ...c,
                    coursierId,
                    statut: "Affectée" as StatutCourse,
                    // Agent Dispatch: reset dispatch status for new courier
                    dispatch: {
                      ...c.dispatch,
                      statut: "Programmé",
                      confirmationRecue: false,
                      confirmationMission: false,
                      historique: [
                        ...c.dispatch.historique,
                        {
                          id: oid("dsh"),
                          date: horodatage(),
                          action: "Réaffectation",
                          details: `Passage de ${nomCoursier(ancien)} à ${nomCoursier(nouveau)}. Motif: ${motif}`,
                          format: "Texte",
                        },
                      ],
                    },
                    reaffectations: [
                      ...c.reaffectations,
                      {
                        id: oid("rea"),
                        ancien: nomCoursier(ancien),
                        nouveau: nomCoursier(nouveau),
                        motif,
                        commentaire,
                        date: horodatage().split(" ")[0] ?? "",
                        heure: new Date().toTimeString().slice(0, 5),
                        utilisateur: "Yassine Bennani",
                      },
                    ],
                    historique: [
                      ...c.historique,
                      evt(`Réaffectation : ${nomCoursier(ancien)} → ${nomCoursier(nouveau)} (${motif})`),
                    ],
                  }
                : c,
            ),
            audit: [evt(`Réaffectation course ${course?.numero ?? ""}`), ...prev.audit],
          };
        }),

      ajouterNote: (key, id, texte, auteur = "Yassine Bennani") =>
        mutate(
          key,
          (arr) =>
            arr.map((it) =>
              it.id === id
                ? {
                    ...it,
                    notesInternes: [
                      ...(((it as { notesInternes?: unknown[] }).notesInternes ?? []) as never[]),
                      { id: oid("nt"), auteur, texte, date: horodatage() } as never,
                    ],
                    historique: [...(((it as { historique?: Evenement[] }).historique ?? []) as Evenement[]), evt("Note interne ajoutée", auteur)],
                  }
                : it,
            ),
          "Note interne ajoutée",
        ),
      ajouterDocument: (key, id, nom, type, auteur = "Yassine Bennani") =>
        mutate(
          key,
          (arr) =>
            arr.map((it) =>
              it.id === id
                ? {
                    ...it,
                    documents: [
                      ...(((it as { documents?: unknown[] }).documents ?? []) as never[]),
                      { id: oid("doc"), nom, type, date: new Date().toISOString().slice(0, 10), ajoutePar: auteur } as never,
                    ],
                    historique: [...(((it as { historique?: Evenement[] }).historique ?? []) as Evenement[]), evt(`Document ajouté : ${nom}`, auteur)],
                  }
                : it,
            ),
          `Document ajouté : ${nom}`,
        ),
      marquerAudioLu: (id, lu) =>
        setData((prev) => ({ ...prev, audios: prev.audios.map((a) => (a.id === id ? { ...a, lu } : a)) })),
      marquerNotifLue: (id) =>
        setData((prev) => ({
          ...prev,
          notifications: prev.notifications.map((n) => (n.id === id ? { ...n, lue: true } : n)),
        })),
      toutMarquerLu: () =>
        setData((prev) => ({ ...prev, notifications: prev.notifications.map((n) => ({ ...n, lue: true })) })),
      reinitialiser: () => setData(seedOps()),
      majSettingsAgent: (patch) => setData((prev) => ({ ...prev, settingsAgent: { ...prev.settingsAgent, ...patch } })),
      programmerCommunication: (courseId, patch) =>
        setData((prev) => ({
          ...prev,
          courses: prev.courses.map((c) =>
            c.id === courseId
              ? {
                  ...c,
                  dispatch: {
                    ...c.dispatch,
                    ...patch,
                    statut: "Programmé",
                    historique: [
                      ...c.dispatch.historique,
                      { id: oid("dsh"), date: horodatage(), action: "Programmation manuelle", details: "Mise à jour des paramètres d'envoi", format: "Texte" },
                    ],
                  },
                }
              : c,
          ),
        })),
      annulerCommunication: (courseId) =>
        setData((prev) => ({
          ...prev,
          courses: prev.courses.map((c) =>
            c.id === courseId
              ? {
                  ...c,
                  dispatch: {
                    ...c.dispatch,
                    statut: "Annulé",
                    historique: [...c.dispatch.historique, { id: oid("dsh"), date: horodatage(), action: "Annulation", details: "Communication annulée par l'opérateur", format: "Texte" }],
                  },
                }
              : c,
          ),
        })),
      envoyerCommunication: (courseId) =>
        setData((prev) => {
          const course = prev.courses.find((c) => c.id === courseId);
          if (!course) return prev;
          return {
            ...prev,
            courses: prev.courses.map((c) =>
              c.id === courseId
                ? {
                    ...c,
                    dispatch: {
                      ...c.dispatch,
                      statut: "Envoyé",
                      historique: [...c.dispatch.historique, { id: oid("dsh"), date: horodatage(), action: "Envoi manuel", details: "Envoyé par l'opérateur", format: "Les deux" }],
                    },
                  }
                : c,
            ),
            dispatchLogs: [
              {
                id: oid("dlg"),
                courseId,
                coursierId: course.coursierId,
                courseNumero: course.numero,
                dateCourse: course.dateCourse,
                heureCourse: course.trancheHoraire,
                dateEnvoiPrevue: horodatage().split(" ")[0] || "",
                heureEnvoiPrevue: new Date().toTimeString().slice(0, 5),
                actualSendingTime: horodatage(),
                canal: "WhatsApp",
                format: course.dispatch.mode,
                messageGenerated: `Nouvelle course ORCONDIS — ${course.numero}. Client: ${nomClient(prev.clients.find(cl => cl.id === course.clientId))}`,
                statut: "Envoyé",
                utilisateur: "Yassine Bennani",
                agentAction: "Envoi manuel",
              },
              ...prev.dispatchLogs,
            ],
          };
        }),
      repondreCommunication: (courseId, reponse, motif) =>
        setData((prev) => {
          const course = prev.courses.find((c) => c.id === courseId);
          if (!course) return prev;
          const statutCourse: StatutCourse = reponse === "Accepté" ? "Acceptée" : reponse === "Refusé" ? "Affectée" : course.statut;
          const statutDispatch = reponse === "Accepté" ? "Accepté" : reponse === "Refusé" ? "Refusé" : "Reçu";

          return {
            ...prev,
            courses: prev.courses.map((c) =>
              c.id === courseId
                ? {
                    ...c,
                    statut: statutCourse,
                    dispatch: {
                      ...c.dispatch,
                      statut: statutDispatch,
                      confirmationRecue: true,
                      confirmationMission: reponse === "Accepté",
                      historique: [
                        ...c.dispatch.historique,
                        { id: oid("dsh"), date: horodatage(), action: `Réponse coursier: ${reponse}`, details: motif || "", format: "Texte" },
                      ],
                    },
                    historique: [...c.historique, evt(`Réponse coursier : ${reponse}${motif ? ` (${motif})` : ""}`)],
                  }
                : c,
            ),
            notifications:
              reponse === "Refusé"
                ? [
                    { id: oid("ntf"), titre: "Mission refusée", detail: `Le coursier a refusé la course ${course.numero}. Motif: ${motif}`, date: horodatage(), gravite: "alerte", lue: false },
                    ...prev.notifications,
                  ]
                : prev.notifications,
          };
        }),
    }),
    [data, mutate, patchItem],
  );


  return <OpsContext.Provider value={value}>{children}</OpsContext.Provider>;
}

export function useOps() {
  const ctx = useContext(OpsContext);
  if (!ctx) throw new Error("useOps doit être utilisé dans OpsProvider");
  return ctx;
}

export function useOpsLookups() {
  const { data } = useOps();
  return useMemo(
    () => ({
      client: (id: string) => data.clients.find((c) => c.id === id),
      clientNom: (id: string) => nomClient(data.clients.find((c) => c.id === id)),
      contact: (id: string) => data.contacts.find((c) => c.id === id),
      contactNom: (id: string) => {
        const c = data.contacts.find((x) => x.id === id);
        return c ? `${c.prenom} ${c.nom}` : "—";
      },
      dossier: (id: string) => data.dossiers.find((d) => d.id === id),
      dossierNom: (id: string) => data.dossiers.find((d) => d.id === id)?.numero ?? "—",
      course: (id: string) => data.courses.find((c) => c.id === id),
      courseNom: (id: string) => data.courses.find((c) => c.id === id)?.numero ?? "—",
      coursier: (id: string) => data.coursiers.find((c) => c.id === id),
      coursierNom: (id: string) => nomCoursier(data.coursiers.find((c) => c.id === id)),
      chargeCoursier: (id: string) =>
        data.courses.filter(
          (c) => c.coursierId === id && ["Affectée", "Acceptée", "En cours"].includes(c.statut),
        ).length,
    }),
    [data],
  );
}

/* Recommandation de coursiers (sans GPS temps réel) */
export function recommanderCoursiers(
  coursiers: CoursierOps[],
  charge: (id: string) => number,
  course: CourseOps,
) {
  return coursiers
    .filter((c) => !c.archive && c.actif)
    .map((c) => {
      let score = 0;
      const zoneRetrait = course.retrait.zone;
      if (c.zoneActuelle === zoneRetrait) score += 40;
      else if (c.zonePrincipale === zoneRetrait) score += 30;
      else if (c.zonesSecondaires.includes(zoneRetrait)) score += 15;
      if (c.statut === "Disponible") score += 30;
      if (c.statut === "Indisponible") score -= 50;
      if (course.transport && c.transport === course.transport) score += 20;
      score -= charge(c.id) * 8;
      if (course.priorite === "Urgente" && c.transport === "Moto") score += 10;
      return { coursier: c, score, charge: charge(c.id) };
    })
    .sort((a, b) => b.score - a.score);
}
