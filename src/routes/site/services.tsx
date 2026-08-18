import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { SERVICES, SERVICE_DETAILS } from "@/lib/orcondis";

export const Route = createFileRoute("/site/services")({
  head: () => ({
    meta: [
      { title: "Nos services — ORCONDIS" },
      {
        name: "description",
        content:
          "Récupération et livraison de documents, courses administratives, paiement de factures et fournisseurs, chèques, procédures et vérifications terrain.",
      },
      { property: "og:title", content: "Nos services — ORCONDIS" },
      {
        property: "og:description",
        content: "Le catalogue complet des prestations ORCONDIS pour entreprises et particuliers.",
      },
    ],
  }),
  component: Services,
});

function Services() {
  return (
    <PublicLayout>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
          <h1 className="text-3xl font-semibold sm:text-4xl">Nos services</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Gagnez du temps et optimisez vos opérations avec les services de proximité et de coursiers ORCONDIS. 
            Un véritable service d’accompagnement selon les directives du client.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <article key={service} className="surface-card p-5">
              <h2 className="text-base font-medium text-navy">{service}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{SERVICE_DETAILS[service]}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 p-6 border border-border rounded-xl bg-muted/30">
          <p className="text-sm font-medium text-navy italic">
            "Toutes nos prestations font l’objet d’une étude et d’un devis au cas par cas, tenant compte de vos besoins spécifiques. 
            Nous répondons à vos besoins dans les plus brefs délais."
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link to="/site/demande">Faire une demande</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
