import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seedBO, uid, type AuditEntry, type BOData } from "./bo-data";

const STORAGE_KEY = "orcondis.backoffice.v1";

type CollectionKey = {
  [K in keyof BOData]: BOData[K] extends Array<{ id: string }> ? K : never;
}[keyof BOData];

type Ctx = {
  data: BOData;
  set: <K extends keyof BOData>(key: K, value: BOData[K]) => void;
  add: <K extends CollectionKey>(key: K, item: BOData[K][number]) => void;
  patch: <K extends CollectionKey>(key: K, id: string, patch: Partial<BOData[K][number]>) => void;
  remove: <K extends CollectionKey>(key: K, id: string) => void;
  toggleArchive: <K extends CollectionKey>(key: K, id: string) => void;
  log: (entry: Omit<AuditEntry, "id" | "date" | "heure">) => void;
  marquerLue: (id: string) => void;
  toutMarquerLu: () => void;
  reinitialiser: () => void;
};

const BOContext = createContext<Ctx | null>(null);

function nowParts() {
  const d = new Date();
  const [a, m, j] = d.toISOString().slice(0, 10).split("-");
  return { date: `${j}/${m}/${a}`, heure: d.toTimeString().slice(0, 5) };
}

export function BOProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<BOData>(() => seedBO());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setData((prev) => ({ ...prev, ...(JSON.parse(raw) as BOData) }));
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

  const set = useCallback(<K extends keyof BOData>(key: K, value: BOData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const value = useMemo<Ctx>(() => {
    const mutate = (key: CollectionKey, fn: (arr: any[]) => any[]) =>
      setData((prev) => ({ ...prev, [key]: fn(prev[key] as any[]) }));

    return {
      data,
      set,
      add: (key, item) => mutate(key, (arr) => [item as any, ...arr]),
      patch: (key, id, p) =>
        mutate(key, (arr) => arr.map((it) => (it.id === id ? { ...it, ...(p as object) } : it))),
      remove: (key, id) => mutate(key, (arr) => arr.filter((it) => it.id !== id)),
      toggleArchive: (key, id) =>
        mutate(key, (arr) => arr.map((it) => (it.id === id ? { ...it, archive: !it.archive } : it))),
      log: (entry) =>
        setData((prev) => ({
          ...prev,
          audit: [{ id: uid("aud"), ...nowParts(), ...entry }, ...prev.audit],
        })),
      marquerLue: (id) =>
        setData((prev) => ({
          ...prev,
          notifications: prev.notifications.map((n) => (n.id === id ? { ...n, lue: true } : n)),
        })),
      toutMarquerLu: () =>
        setData((prev) => ({
          ...prev,
          notifications: prev.notifications.map((n) => ({ ...n, lue: true })),
        })),
      reinitialiser: () => setData(seedBO()),
    };
  }, [data, set]);

  return <BOContext.Provider value={value}>{children}</BOContext.Provider>;
}

export function useBO() {
  const ctx = useContext(BOContext);
  if (!ctx) throw new Error("useBO doit être utilisé dans BOProvider");
  return ctx;
}

/* Helpers de résolution des relations */
export function useLookups() {
  const { data } = useBO();
  return useMemo(
    () => ({
      client: (id: string) => data.clients.find((c) => c.id === id),
      clientNom: (id: string) => data.clients.find((c) => c.id === id)?.raisonSociale ?? "—",
      dossier: (id: string) => data.dossiers.find((d) => d.id === id),
      dossierNom: (id: string) => data.dossiers.find((d) => d.id === id)?.numero ?? "—",
      coursier: (id: string) => data.coursiers.find((c) => c.id === id),
      coursierNom: (id: string) => data.coursiers.find((c) => c.id === id)?.nom ?? "Non affecté",
      fournisseur: (id: string) => data.fournisseurs.find((f) => f.id === id),
      fournisseurNom: (id: string) => data.fournisseurs.find((f) => f.id === id)?.raisonSociale ?? "—",
      course: (id: string) => data.courses.find((c) => c.id === id),
      facture: (id: string) => data.factures.find((f) => f.id === id),
    }),
    [data],
  );
}