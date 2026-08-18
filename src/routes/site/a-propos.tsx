import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { AnimatedBackground } from "@/components/ui/design-system/AnimatedBackground";
import { ShieldCheck, Target, Users, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/site/a-propos")({
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
      <section className="relative overflow-hidden py-24 sm:py-32">
        <AnimatedBackground variant="ambient" />
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="text-center max-w-4xl mx-auto mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
            <h1 className="text-5xl font-black tracking-tighter text-navy sm:text-7xl leading-[0.9]">
              À propos d'ORCONDIS
            </h1>
            <p className="mt-8 text-xl text-muted-foreground font-medium leading-relaxed">
              ORCONDIS est un bureau de services premium spécialisé dans la gestion de flux documentaires, 
              les démarches administratives et l'assistance opérationnelle de proximité à Casablanca.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {[
              {
                titre: "Notre métier",
                icon: Target,
                texte:
                  "Décharger les entreprises, cabinets et professionnels des déplacements et démarches chronophages, avec une exécution fiable et documentée.",
              },
              {
                titre: "Nos engagements",
                icon: ShieldCheck,
                texte:
                  "Confidentialité absolue, respect rigoureux des délais, remise systématique des justificatifs et interlocuteur dédié pour chaque mission.",
              },
              {
                titre: "Notre organisation",
                icon: Users,
                texte:
                  "Une équipe de coordination centrale, des coursiers experts affectés par zone et une qualification structurée via WhatsApp pour une efficacité maximale.",
              },
            ].map((bloc, i) => (
              <article 
                key={bloc.titre} 
                className="surface-card group p-10 border border-border/40 hover:border-primary/20 transition-all hover:shadow-elevated rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="h-14 w-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform group-hover:bg-primary group-hover:text-white">
                  <bloc.icon className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-black text-navy tracking-tight">{bloc.titre}</h2>
                <p className="mt-4 text-base text-muted-foreground font-medium leading-relaxed opacity-75">{bloc.texte}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy py-24 relative overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-6 relative z-10">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 lg:p-20">
            <h2 className="text-3xl font-black text-white sm:text-4xl tracking-tighter mb-12 text-center lg:text-left">
              Ils nous font confiance
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "Atlas Industrie",
                "Société Marocaine de Distribution",
                "Cabinet El Mansouri",
                "Laboratoire Al Amal",
                "Proman Maroc",
                "Logistics Solutions",
                "Finance Group",
                "Consulting Partners"
              ].map((client, i) => (
                <div
                  key={client}
                  className="group flex items-center gap-4 rounded-2xl bg-white/5 border border-white/10 px-6 py-5 transition-all hover:bg-white/10 hover:-translate-y-1 animate-in fade-in zoom-in-95 duration-500"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-base font-bold text-white/90 group-hover:text-white transition-colors">
                    {client}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
