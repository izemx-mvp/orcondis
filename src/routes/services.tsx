import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { SERVICES } from "@/lib/arcondis";

export const Route = createFileRoute("/services")({
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

const DETAILS: Record<string, string> = {
  "Récupération de documents":
    "Retrait de dossiers, contrats, originaux ou pièces administratives auprès de vos partenaires.",
  "Livraison de documents":
    "Remise en main propre avec justificatif de réception signé et horodaté.",
  "Courses administratives":
    "Communes, préfectures, tribunaux, caisses sociales, organismes publics et privés.",
  "Paiement de factures": "Règlement de factures d’eau, d’électricité, de téléphonie ou de services.",
  "Paiement de fournisseurs":
    "Remise de paiements à vos fournisseurs avec récupération du reçu ou de la décharge.",
  "Récupération de chèques": "Collecte de chèques chez vos clients et partenaires.",
  "Dépôt de chèques": "Dépôt en agence bancaire et transmission du bordereau.",
  "Procédures administratives":
    "Constitution, dépôt et suivi de dossiers auprès des administrations.",
  "Procédure provisoire": "Démarches temporaires : attestations, autorisations, duplicatas.",
  "Vérification / contrôle": "Constat sur site, vérification d’affichage, contrôle de conformité.",
  "Autres prestations": "Toute mission ponctuelle décrite lors de la qualification WhatsApp.",
};

function Services() {
  return (
    <PublicLayout>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
          <h1 className="text-3xl font-semibold sm:text-4xl">Nos services</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            ORCONDIS réalise vos opérations terrain avec un cadre professionnel : mission qualifiée,
            coursier affecté, justificatifs remis et traçabilité complète.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <article key={service} className="surface-card p-5">
              <h2 className="text-base font-medium text-navy">{service}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{DETAILS[service]}</p>
            </article>
          ))}
        </div>
        <div className="mt-10">
          <Button asChild>
            <Link to="/demande">Faire une demande</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
