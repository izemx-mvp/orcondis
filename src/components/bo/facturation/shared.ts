import type { Course, Facture, Tarif } from "@/lib/bo-data";

export const SERVICES_TOUS = "Tous services";

export function ageingJours(dateEcheance: string) {
  if (!dateEcheance) return 0;
  const echeance = new Date(dateEcheance).getTime();
  const now = Date.now();
  return Math.floor((now - echeance) / 86400000);
}

export function fmtPeriode(dateDebut: string, dateFin: string, fr: (d: string) => string) {
  return `${fr(dateDebut)} → ${fr(dateFin)}`;
}

export function coursesEligibles(courses: Course[], factures: Facture[]) {
  const facturees = new Set<string>();
  factures.forEach((f) => f.lignes.forEach((l) => facturees.add(l.courseId)));
  return courses.filter(
    (c) =>
      !c.archive &&
      c.statut !== "Annulée" &&
      c.statut !== "Facturée" &&
      !facturees.has(c.id) &&
      (c.statut === "Terminée" || c.statut === "Validée client" || c.statut === "À facturer"),
  );
}

export function genererNumeroFacture(factures: Facture[]) {
  const annee = new Date().getFullYear();
  const nums = factures
    .map((f) => f.numero.match(/FAC-(\d{4})-(\d+)/))
    .filter((m): m is RegExpMatchArray => !!m && Number(m[1]) === annee)
    .map((m) => Number(m[2]));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `FAC-${annee}-${String(next).padStart(4, "0")}`;
}

export function genererNumeroPaiement(count: number) {
  return `REG-${String(count + 1).padStart(4, "0")}`;
}

export function telechargerTexte(nomFichier: string, contenu: string) {
  const blob = new Blob([contenu], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomFichier;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
