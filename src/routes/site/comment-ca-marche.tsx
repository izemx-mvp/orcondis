import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MessageCircle, ArrowRight, Smartphone } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/ui/design-system/AnimatedBackground";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/site/comment-ca-marche")({
  head: () => ({
    meta: [
      { title: "Comment ça marche — ORCONDIS" },
      {
        name: "description",
        content:
          "Demande en ligne, qualification par notre assistant WhatsApp, prise en charge par ORCONDIS et clôture de la prestation.",
      },
      { property: "og:title", content: "Comment ça marche — ORCONDIS" },
      {
        property: "og:description",
        content: "Le parcours d’une demande ORCONDIS, du formulaire à la clôture de la prestation.",
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
    titre: "ORCONDIS prend en charge votre demande.",
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
      <section className="relative overflow-hidden py-24 sm:py-32">
        <AnimatedBackground variant="ambient" />
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
            <h1 className="text-5xl font-black tracking-tighter text-navy sm:text-7xl leading-[0.9]">
              Comment ça marche
            </h1>
            <p className="mt-8 text-xl text-muted-foreground font-medium">
              Un parcours digital fluide couplé à une efficacité opérationnelle terrain.
            </p>
          </div>

          <div className="grid gap-16 lg:grid-cols-2 items-start">
            <div className="space-y-10">
              <ol className="relative space-y-12">
                <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent rounded-full" />
                {ETAPES.map((etape, i) => (
                  <li key={etape.titre} className="relative pl-16 group animate-in fade-in slide-in-from-left-8 duration-700" style={{ animationDelay: `${i * 100}ms` }}>
                    <span className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-primary shadow-lg shadow-primary/10 text-lg font-black text-primary transition-transform group-hover:scale-110">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-2xl font-black text-navy tracking-tight">{etape.titre}</h3>
                      <p className="mt-3 text-base text-muted-foreground font-medium leading-relaxed opacity-80">{etape.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="sticky top-32">
              <div className="rounded-[3rem] bg-navy p-10 lg:p-14 shadow-elevated relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05),transparent)]" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white">Interface WhatsApp</h2>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Temps réel</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {[
                      ["agent", "Bonjour Monsieur Karim. Votre demande a bien été reçue. Pouvez-vous m’indiquer l’adresse où le chèque doit être récupéré ?"],
                      ["client", "Maarif, Casablanca."],
                      ["agent", "Merci. Quel est le nom du fournisseur et son adresse ?"],
                      ["client", "Fournitures Atlas, Aïn Sebaâ."],
                      ["agent", "Souhaitez-vous que la mission soit réalisée à une heure précise ou durant la matinée ?"],
                      ["client", "Avant 11h."],
                    ].map(([auteur, texte], i) => (
                      <div key={i} className={cn("flex", auteur === "client" ? "justify-end" : "justify-start")}>
                        <div
                          className={cn(
                            "max-w-[85%] rounded-2xl px-5 py-4 text-sm font-medium animate-in fade-in slide-in-from-bottom-2",
                            auteur === "client"
                              ? "bg-primary text-white shadow-lg shadow-primary/20"
                              : "bg-white/10 text-white/90 border border-white/10 backdrop-blur-sm"
                          )}
                          style={{ animationDelay: `${i * 200}ms` }}
                        >
                          {texte}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 flex justify-center">
                    <Button asChild size="lg" className="rounded-2xl h-16 px-12 text-lg font-black shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
                      <Link to="/site/demande">Lancer une mission</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
