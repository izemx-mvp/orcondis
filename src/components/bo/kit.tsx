import { useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";

/* ---------- En-tête de page ---------- */
export function PageHeader({
  titre,
  sous,
  actions,
}: {
  titre: string;
  sous?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-navy">{titre}</h1>
        {sous && <p className="mt-1 text-sm text-muted-foreground">{sous}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------- Cartes statistiques ---------- */
export function StatCard({
  label,
  valeur,
  detail,
  ton = "neutre",
}: {
  label: string;
  valeur: string | number;
  detail?: string;
  ton?: "neutre" | "positif" | "alerte" | "critique";
}) {
  const tons: Record<string, string> = {
    neutre: "text-navy",
    positif: "text-emerald-600",
    alerte: "text-amber-600",
    critique: "text-destructive",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${tons[ton]}`}>{valeur}</p>
      {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
    </div>
  );
}

/* ---------- Bloc / carte ---------- */
export function Panel({
  titre,
  actions,
  children,
  className = "",
}: {
  titre?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-border bg-card shadow-[var(--shadow-card)] ${className}`}>
      {(titre || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          {titre && <h2 className="text-sm font-semibold text-navy">{titre}</h2>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

/* ---------- Barre de filtres ---------- */
export function SearchInput({
  value,
  onChange,
  placeholder = "Rechercher…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full sm:w-64">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}

export function SelectFilter({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  label: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
      aria-label={label}
    >
      <option value="">{label} : tous</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

/* ---------- Tableau ---------- */
export type Colonne<T> = {
  cle: string;
  titre: string;
  rendu: (row: T) => ReactNode;
  align?: "left" | "right";
};

export function DataTable<T extends { id: string }>({
  colonnes,
  lignes,
  vide = "Aucun élément.",
  onRowClick,
}: {
  colonnes: Colonne<T>[];
  lignes: T[];
  vide?: string;
  onRowClick?: (row: T) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
      <table className="w-full text-sm">
        <thead className="bg-surface text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <tr>
            {colonnes.map((c) => (
              <th key={c.cle} className={`px-4 py-3 ${c.align === "right" ? "text-right" : ""}`}>
                {c.titre}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {lignes.map((l) => (
            <tr
              key={l.id}
              className={`hover:bg-surface/60 ${onRowClick ? "cursor-pointer" : ""}`}
              onClick={onRowClick ? () => onRowClick(l) : undefined}
            >
              {colonnes.map((c) => (
                <td
                  key={c.cle}
                  className={`px-4 py-3 align-top ${c.align === "right" ? "text-right" : ""}`}
                >
                  {c.rendu(l)}
                </td>
              ))}
            </tr>
          ))}
          {lignes.length === 0 && (
            <tr>
              <td colSpan={colonnes.length} className="px-4 py-10 text-center text-muted-foreground">
                {vide}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Badges de statut ---------- */
export function Statut({ children, ton }: { children: ReactNode; ton?: string }) {
  return (
    <Badge variant="outline" className={ton ?? "border-border bg-muted text-muted-foreground"}>
      {children}
    </Badge>
  );
}

export function tonStatut(s: string) {
  const v = s.toLowerCase();
  if (["annulée", "annulé", "bloquée", "en retard", "impayée", "problème signalé"].some((k) => v.includes(k)))
    return "border-destructive/30 bg-destructive/10 text-destructive";
  if (["payée", "validée", "validé", "terminée", "effectué", "reçu", "complètes", "émise", "envoyée"].some((k) => v.includes(k)))
    return "border-emerald-300 bg-emerald-50 text-emerald-700";
  if (["attente", "à valider", "brouillon", "à facturer", "à payer", "à recevoir", "à affecter", "urgente"].some((k) => v.includes(k)))
    return "border-amber-300 bg-amber-50 text-amber-700";
  return "border-primary/30 bg-primary/10 text-primary";
}

/* ---------- Formulaires ---------- */
export function Champ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function ChampSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[] | readonly string[];
}) {
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="">—</option>
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ChampTexte({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function ChampCase({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 pt-6 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
      {label}
    </label>
  );
}

export function FormDialog({
  open,
  onOpenChange,
  titre,
  description,
  onSubmit,
  submitLabel = "Enregistrer",
  children,
  large,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  titre: string;
  description?: string;
  onSubmit?: () => void;
  submitLabel?: string;
  children: ReactNode;
  large?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={large ? "max-h-[85vh] max-w-3xl overflow-y-auto" : "max-h-[85vh] overflow-y-auto"}>
        <DialogHeader>
          <DialogTitle>{titre}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4">{children}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          {onSubmit && (
            <Button
              onClick={() => {
                onSubmit();
                onOpenChange(false);
              }}
            >
              {submitLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Grille({ children, cols = 2 }: { children: ReactNode; cols?: 1 | 2 | 3 }) {
  const c = cols === 1 ? "sm:grid-cols-1" : cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return <div className={`grid grid-cols-1 gap-3 ${c}`}>{children}</div>;
}

export function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm text-foreground">{children || "—"}</p>
    </div>
  );
}

export function Historique({ items }: { items: { id: string; date: string; heure?: string; utilisateur?: string; action: string; ancienne?: string; nouvelle?: string }[] }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">Aucun historique.</p>;
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i.id} className="rounded-md border border-border bg-surface/60 px-3 py-2 text-sm">
          <p className="font-medium text-navy">{i.action}</p>
          <p className="text-xs text-muted-foreground">
            {i.date} {i.heure ?? ""} {i.utilisateur ? `· ${i.utilisateur}` : ""}
            {i.ancienne || i.nouvelle ? ` · ${i.ancienne || "—"} → ${i.nouvelle || "—"}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Onglets simples ---------- */
export function Onglets({
  items,
  actif,
  onChange,
}: {
  items: readonly string[];
  actif: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface p-1">
      {items.map((i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            actif === i ? "bg-card text-navy shadow-sm" : "text-muted-foreground hover:text-navy"
          }`}
        >
          {i}
        </button>
      ))}
    </div>
  );
}

export function useDialog<T>() {
  const [item, setItem] = useState<T | null>(null);
  const [open, setOpen] = useState(false);
  return {
    item,
    open,
    setOpen,
    ouvrir: (v: T) => {
      setItem(v);
      setOpen(true);
    },
  };
}
