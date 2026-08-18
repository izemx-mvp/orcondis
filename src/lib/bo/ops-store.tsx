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
          return {
            ...prev,
            courses: prev.courses.map((c) =>
              c.id === courseId
                ? {
                    ...c,
                    coursierId,
                    statut: "Affectée" as StatutCourse,
                    heureEnvoiOrdre: new Date().toTimeString().slice(0, 5),
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
          return {
            ...prev,
            courses: prev.courses.map((c) =>
              c.id === courseId
                ? {
                    ...c,
                    coursierId,
                    statut: "Affectée" as StatutCourse,
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
