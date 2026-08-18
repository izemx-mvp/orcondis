import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — ORCONDIS" },
      {
        name: "description",
        content:
          "ORCONDIS, bureau de services basé à Casablanca : courses professionnelles, démarches administratives et opérations terrain pour entreprises, cabinets et particuliers.",
      },
      { property: "og:title", content: "À propos — ORCONDIS" },
      {
        property: "og:description",
        content: "Notre métier, nos engagements et notre organisation opérationnelle.",
      },
    ],
  }),
  component: APropos,
});

function APropos() {
  return (
    <PublicLayout>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
          <h1 className="text-3xl font-semibold sm:text-4xl">À propos d’ORCONDIS</h1>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
            ORCONDIS est un bureau de services spécialisé dans les courses professionnelles et
            particulières, les démarches administratives, la collecte et la remise de documents, le
            paiement de fournisseurs, le traitement des chèques, les procédures provisoires et les
            opérations de terrain réalisées par nos coursiers.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-3">
        {[
          {
            titre: "Notre métier",
            texte:
              "Décharger les entreprises, cabinets et professionnels des déplacements et démarches chronophages, avec une exécution fiable et documentée.",
          },
          {
            titre: "Nos engagements",
            texte:
              "Confidentialité des documents, respect des délais convenus, remise systématique des justificatifs et interlocuteur identifié pour chaque demande.",
          },
          {
            titre: "Notre organisation",
            texte:
              "Une équipe de coordination au bureau, des coursiers affectés par zone et une qualification structurée de chaque demande avant intervention.",
          },
        ].map((bloc) => (
          <article key={bloc.titre} className="surface-card p-6">
            <h2 className="text-base font-semibold text-navy">{bloc.titre}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{bloc.texte}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6">
        <div className="surface-card p-6">
          <h2 className="text-lg font-semibold">Ils nous font confiance</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Atlas Industrie",
              "Société Marocaine de Distribution",
              "Cabinet El Mansouri",
              "Laboratoire Al Amal",
            ].map((client) => (
              <li
                key={client}
                className="rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-navy"
              >
                {client}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PublicLayout>
  );
}
