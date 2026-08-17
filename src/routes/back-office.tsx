import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { statutTone } from "@/lib/arcondis";
import { ArrowLeft, RefreshCcw } from "lucide-react";

export const Route = createFileRoute("/back-office")({
  head: () => ({
    meta: [
      { title: "Back-Office — ARCONDIS" },
      {
        name: "description",
        content: "Espace collaborateur ARCONDIS : suivi des demandes, qualification et traitement.",
      },
      { property: "og:title", content: "Back-Office — ARCONDIS" },
      { property: "og:description", content: "Suivi des demandes ARCONDIS." },
    ],
  }),
  component: BackOffice,
});

function BackOffice() {
  const { demandes, reinitialiser } = useStore();

  return (
    <PublicLayout>
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Back-Office ARCONDIS</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {demandes.length} demande{demandes.length > 1 ? "s" : ""} enregistrée
              {demandes.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour au site
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={reinitialiser}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Réinitialiser les démos
            </Button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">N°</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Prestation</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {demandes.map((d) => (
                  <tr key={d.id} className="hover:bg-surface/50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-navy">{d.numero}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {d.jour} {d.date} · {d.heure}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy">
                        {d.prenom} {d.nom}
                      </p>
                      {d.societe && <p className="text-xs text-muted-foreground">{d.societe}</p>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{d.service}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <p>{d.telephone}</p>
                      <p className="text-xs">{d.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={statutTone(d.statut)}>
                        {d.statut}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" disabled title="Détail à venir">
                        Voir
                      </Button>
                    </td>
                  </tr>
                ))}
                {demandes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Aucune demande enregistrée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
