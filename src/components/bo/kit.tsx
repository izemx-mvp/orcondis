import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
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
    <div className="flex flex-wrap items-end justify-between gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-black tracking-tighter text-navy sm:text-5xl leading-[0.9]">{titre}</h1>
        {sous && <p className="mt-3 text-lg text-muted-foreground font-medium leading-relaxed opacity-70">{sous}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-4">{actions}</div>}
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
    positif: "text-success",
    alerte: "text-warning",
    critique: "text-destructive",
  };
  return (
    <div className="rounded-[2rem] border border-border/10 dark:border-white/5 bg-white/70 dark:bg-surface/80 backdrop-blur-2xl p-8 shadow-elevated hover:shadow-hover hover:-translate-y-1.5 transition-all group overflow-hidden relative duration-500">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
      <p className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/50 mb-4">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className={cn("text-4xl font-black tracking-tighter", tons[ton])}>{valeur}</p>
      </div>
      {detail && <p className="mt-3 text-[13px] font-bold text-muted-foreground/50 tracking-tight">{detail}</p>}
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
    <section className={cn("rounded-[2rem] border border-border/10 dark:border-white/5 bg-white/60 dark:bg-surface/60 backdrop-blur-2xl shadow-elevated overflow-hidden hover:shadow-hover transition-all duration-500", className)}>
      {(titre || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-4 bg-muted/20 px-8 py-6 border-b border-border/40">
          {titre && <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-navy/60">{titre}</h2>}
          {actions && <div className="flex items-center gap-6">{actions}</div>}
        </header>
      )}
      <div className="p-8">{children}</div>
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
    <div className="overflow-x-auto rounded-[2rem] border border-border/10 dark:border-white/5 bg-white/50 dark:bg-surface/50 backdrop-blur-2xl shadow-elevated transition-all duration-500">
      <table className="w-full text-[15px] border-collapse">
        <thead className="bg-muted/30 text-left text-[11px] font-black uppercase tracking-[0.3em] text-navy/40 border-b border-border/40">
          <tr>
            {colonnes.map((c) => (
              <th key={c.cle} className={`px-8 py-5 ${c.align === "right" ? "text-right" : ""}`}>
                {c.titre}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20">
          {lignes.map((l, idx) => (
            <tr
              key={l.id}
              className={cn(
                "group transition-all hover:bg-white/90 dark:hover:bg-white/5 hover:scale-[1.002] duration-300",
                onRowClick ? "cursor-pointer" : ""
              )}
              onClick={onRowClick ? () => onRowClick(l) : undefined}
            >
              {colonnes.map((c) => (
                <td
                  key={c.cle}
                  className={`px-8 py-5 align-middle font-bold text-navy/80 tracking-tight ${c.align === "right" ? "text-right" : ""}`}
                >
                  {c.rendu(l)}
                </td>
              ))}
            </tr>
          ))}
          {lignes.length === 0 && (
            <tr>
              <td colSpan={colonnes.length} className="px-10 py-24 text-center text-muted-foreground/60 font-medium italic">
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
export function Statut({ children, ton, className }: { children: ReactNode; ton?: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn(
      "px-3 py-1 rounded-md text-[12px] font-bold uppercase tracking-tight transition-all shadow-sm",
      ton ?? "border-border bg-muted/30 text-muted-foreground",
      className
    )}>
      {children}
    </Badge>
  );
}

export function tonStatut(s: string) {
  const v = s.toLowerCase();
  if (["annulée", "annulé", "bloquée", "en retard", "impayée", "problème signalé"].some((k) => v.includes(k)))
    return "border-destructive/30 bg-destructive/15 text-destructive";
  if (["payée", "validée", "validé", "terminée", "effectué", "reçu", "complètes", "émise", "envoyée"].some((k) => v.includes(k)))
    return "border-success/30 bg-success/15 text-success";
  if (["attente", "à valider", "brouillon", "à facturer", "à payer", "à recevoir", "à affecter", "urgente", "exclusive"].some((k) => v.includes(k)))
    return "border-warning/30 bg-warning/15 text-warning";
  return "border-primary/30 bg-primary/15 text-primary";
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
    <div className="space-y-2">
      <Label className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">{label}</Label>
      <Input 
        type={type} 
        value={value} 
        placeholder={placeholder} 
        onChange={(e) => onChange(e.target.value)} 
        className="rounded-2xl border-border/60 focus-visible:ring-primary/20 bg-muted/20 h-12 px-6 shadow-sm transition-all duration-300 focus-visible:border-primary/50"
      />
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
    <div className="space-y-2">
      <Label className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-12 w-full rounded-2xl border border-border/60 bg-muted/20 px-6 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm focus:border-primary/50"
      >
        <option value="">— Sélectionner —</option>
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
    <div className="space-y-2">
      <Label className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">{label}</Label>
      <Textarea 
        rows={rows} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="rounded-2xl border-border/60 focus-visible:ring-primary/20 bg-muted/20 p-4 min-h-[90px] shadow-sm transition-all duration-300 focus-visible:border-primary/50"
      />
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
      <DialogContent className={cn(
        "max-h-[90vh] overflow-y-auto rounded-[3rem] border border-white/20 dark:border-white/10 bg-white/90 dark:bg-surface/90 shadow-elevated p-0 gap-0 backdrop-blur-3xl",
        large ? "max-w-4xl" : "max-w-md"
      )}>
        <DialogHeader className="p-10 border-b border-border bg-muted/20">
          <DialogTitle className="text-2xl font-black tracking-tight text-navy">{titre}</DialogTitle>
          {description && <DialogDescription className="text-[15px] font-medium text-muted-foreground mt-2">{description}</DialogDescription>}
        </DialogHeader>
        <div className="p-10 space-y-6">{children}</div>
        <DialogFooter className="p-10 border-t border-border bg-muted/10 gap-4">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="rounded-2xl font-black uppercase tracking-widest px-8 h-12 hover:bg-muted/50 transition-all active:scale-95"
          >
            Fermer
          </Button>
          {onSubmit && (
            <Button
              className="rounded-2xl font-black uppercase tracking-widest px-10 h-12 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.05] active:scale-95"
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
