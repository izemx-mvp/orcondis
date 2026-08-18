// ORCONDIS — Réglages complémentaires du module Paramètres (numérotation, notifications internes).
// Stockage local dédié : ne modifie pas bo-data.ts / bo-store.tsx (gérés par un autre agent).
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "orcondis.backoffice.parametres-extra.v1";

export type NumerotationConfig = {
  id: string;
  entite: string;
  prefixe: string;
  prochain: number;
  digits: number;
};

export type NotifTemplate = {
  id: string;
  type: string;
  titre: string;
  message: string;
  actif: boolean;
};

export type ParamExtraData = {
  numerotation: NumerotationConfig[];
  notifTemplates: NotifTemplate[];
};

let seq = 900;
export function uidExtra(prefix = "px") {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq.toString(36)}`;
}

function seed(): ParamExtraData {
  return {
    numerotation: [
      { id: "NUM-1", entite: "Clients", prefixe: "CLI-", prochain: 7, digits: 3 },
      { id: "NUM-2", entite: "Contacts", prefixe: "CT-", prochain: 9, digits: 0 },
      { id: "NUM-3", entite: "Demandes", prefixe: "DEM-", prochain: 1043, digits: 0 },
      { id: "NUM-4", entite: "Dossiers", prefixe: "DOS-", prochain: 2407, digits: 0 },
      { id: "NUM-5", entite: "Courses", prefixe: "CRS-", prochain: 3111, digits: 0 },
      { id: "NUM-6", entite: "Procédures", prefixe: "PC-", prochain: 6, digits: 0 },
      { id: "NUM-7", entite: "Paiements", prefixe: "PAY-", prochain: 4007, digits: 0 },
      { id: "NUM-8", entite: "Factures", prefixe: "FAC-2026-", prochain: 9, digits: 4 },
    ],
    notifTemplates: [
      { id: "NT-1", type: "Nouvelle demande", titre: "Nouvelle demande reçue", message: "Une nouvelle demande a été reçue.", actif: true },
      { id: "NT-2", type: "Intervention humaine", titre: "Intervention humaine requise", message: "Le client attend une réponse humaine sur WhatsApp.", actif: true },
      { id: "NT-3", type: "Course non affectée", titre: "Course urgente non affectée", message: "Une course urgente n’a pas encore été affectée à un coursier.", actif: true },
      { id: "NT-4", type: "Course bloquée", titre: "Course bloquée", message: "Une course est bloquée et nécessite une action.", actif: true },
      { id: "NT-5", type: "Paiement à effectuer", titre: "Paiement fournisseur à effectuer", message: "Un paiement fournisseur est en attente de traitement.", actif: true },
      { id: "NT-6", type: "Facture en retard", titre: "Facture en retard", message: "Une facture est en retard de règlement.", actif: false },
    ],
  };
}

type CollectionKey = keyof ParamExtraData;

type Ctx = {
  data: ParamExtraData;
  add: <K extends CollectionKey>(key: K, item: ParamExtraData[K][number]) => void;
  patch: <K extends CollectionKey>(key: K, id: string, patch: Partial<ParamExtraData[K][number]>) => void;
  remove: <K extends CollectionKey>(key: K, id: string) => void;
};

const ParamExtraContext = createContext<Ctx | null>(null);

export function ParamExtraProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ParamExtraData>(() => seed());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setData((prev) => ({ ...prev, ...(JSON.parse(raw) as ParamExtraData) }));
    } catch {
      /* données par défaut conservées */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* stockage indisponible */
    }
  }, [data]);

  const mutate = useCallback((key: CollectionKey, fn: (arr: any[]) => any[]) => {
    setData((prev) => ({ ...prev, [key]: fn(prev[key] as any[]) }));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      data,
      add: (key, item) => mutate(key, (arr) => [item as any, ...arr]),
      patch: (key, id, p) => mutate(key, (arr) => arr.map((it) => (it.id === id ? { ...it, ...(p as object) } : it))),
      remove: (key, id) => mutate(key, (arr) => arr.filter((it) => it.id !== id)),
    }),
    [data, mutate],
  );

  return <ParamExtraContext.Provider value={value}>{children}</ParamExtraContext.Provider>;
}

export function useParamExtra() {
  const ctx = useContext(ParamExtraContext);
  if (!ctx) throw new Error("useParamExtra doit être utilisé dans ParamExtraProvider");
  return ctx;
}

export function apercuNumero(cfg: NumerotationConfig) {
  const n = String(cfg.prochain);
  const padded = cfg.digits > 0 ? n.padStart(cfg.digits, "0") : n;
  return `${cfg.prefixe}${padded}`;
}
