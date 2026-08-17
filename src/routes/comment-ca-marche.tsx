import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/comment-ca-marche")({
  head: () => ({
    meta: [
      { title: "Comment ça marche — ARCONDIS" },
      {
        name: "description",
        content:
          "Demande en ligne, qualification par notre assistant WhatsApp, prise en charge par ARCONDIS et clôture de la prestation.",
      },
      { property: "og:title", content: "Comment ça marche — ARCONDIS" },
      {
        property: "og:description",
        content: "Le parcours d’une demande ARCONDIS, du formulaire à la clôture de la prestation.",
      },
    ],
  }),
  component: CommentCaMarche,
});

const ETAPES = [
  {
    titre: "Vous envoyez votre demande.",
    detail:
      "Un formulaire court : votre identité, votre société, le type de prestation et quelques lignes de description.",
  },
  {
    titre: "Notre assistant WhatsApp vous contacte.",
    detail:
      "Il connaît déjà les informations transmises sur le site et ne vous demande jamais de les répéter.",
  },
  {
    titre: "Les informations nécessaires sont complétées.",
    detail:
      "Adresse de retrait, destinations, contacts sur place, date et tranche horaire, documents utiles.",
  },
  {
    titre: "ARCONDIS prend en charge votre demande.",
    detail: "La demande qualifiée est transmise à l’équipe opérationnelle pour affectation.",
  },
  {
    titre: "Vous êtes informé de l’avancement.",
    detail: "Points d’étape transmis sur WhatsApp par l’assistant ou votre responsable dédié.",
  },
  {
    titre: "La prestation est clôturée.",
    detail: "Justificatifs, reçus et documents signés vous sont remis et archivés dans la demande.",
  },
];

function CommentCaMarche() {
  return (
    <PublicLayout>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
          <h1 className="text-3xl font-semibold sm:text-4xl">Comment ça marche</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Un parcours simple : vous décrivez l’essentiel, nous complétons le reste avec vous.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
        <ol className="space-y-4">
          {ETAPES.map((etape, i) => (
            <li key={etape.titre} className="surface-card flex gap-4 p-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-navy">{etape.titre}</p>
                <p className="mt-1 text-sm text-muted-foreground">{etape.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="surface-card mt-10 p-6">
          <h2 className="text-lg font-semibold">Exemple d’échange WhatsApp</h2>
          <div className="mt-4 space-y-3 text-sm">
            {[
              ["agent", "Bonjour Monsieur Karim. Votre demande a bien été reçue. Pouvez-vous m’indiquer l’adresse où le chèque doit être récupéré ?"],
              ["client", "Maarif, Casablanca."],
              ["agent", "Merci. Quel est le nom du fournisseur et son adresse ?"],
              ["client", "Fournitures Atlas, Aïn Sebaâ."],
              ["agent", "Souhaitez-vous que la mission soit réalisée à une heure précise ou durant la matinée ?"],
              ["client", "Avant 11h."],
            ].map(([auteur, texte], i) => (
              <div key={i} className={auteur === "client" ? "flex justify-end" : "flex"}>
                <p
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    auteur === "client"
                      ? "bg-whatsapp/15 text-navy"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {texte}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <Button asChild>
            <Link to="/demande">Faire une demande</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
