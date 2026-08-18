import { statutTone, type Completion, type Statut } from "@/lib/orcondis";
import { cn } from "@/lib/utils";

export function StatusBadge({ statut, className }: { statut: Statut; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statutTone(statut),
        className,
      )}
    >
      {statut}
    </span>
  );
}

export function CompletionBadge({ etat }: { etat: Completion }) {
  const tone =
    etat === "Complété"
      ? "bg-success/15 text-navy border-success/40"
      : etat === "Manquant"
        ? "bg-destructive/12 text-destructive border-destructive/35"
        : "bg-warning/15 text-warning-foreground border-warning/40";
  return (
    <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium", tone)}>
      {etat}
    </span>
  );
}
