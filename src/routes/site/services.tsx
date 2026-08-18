import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Globe, Truck, Building2, ClipboardList, ShieldCheck, Clock, ArrowRight } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { SERVICES, SERVICE_DETAILS } from "@/lib/orcondis";
import { AnimatedBackground } from "@/components/ui/design-system/AnimatedBackground";

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
      <section className="relative overflow-hidden py-24 sm:py-32">
        <AnimatedBackground variant="ambient" />
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
            <h1 className="text-5xl font-black tracking-tighter text-navy sm:text-7xl leading-[0.9]">
              Nos Services
            </h1>
            <p className="mt-8 text-xl text-muted-foreground font-medium">
              Une gamme complète de prestations logistiques et administratives conçues pour l'excellence opérationnelle.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, i) => (
              <article 
                key={service} 
                className="group relative rounded-[2.5rem] border border-border bg-white/50 backdrop-blur-sm p-10 transition-all hover:shadow-elevated hover:-translate-y-2 hover:bg-white hover:border-primary/20 animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-6 shadow-sm">
                   {i % 4 === 0 ? <Truck className="h-8 w-8" /> : 
                    i % 4 === 1 ? <Building2 className="h-8 w-8" /> : 
                    i % 4 === 2 ? <ClipboardList className="h-8 w-8" /> : 
                    <ShieldCheck className="h-8 w-8" />}
                </div>
                <h2 className="mt-8 text-2xl font-black text-navy tracking-tight">{service}</h2>
                <p className="mt-4 text-base text-muted-foreground font-medium leading-relaxed opacity-70">
                  {SERVICE_DETAILS[service]}
                </p>
                <div className="mt-8 flex items-center gap-2 text-sm font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                   En savoir plus <ArrowRight className="h-4 w-4" />
                </div>
              </article>
            ))}
          </div>

          <div className="mt-20 rounded-[3rem] bg-navy p-12 lg:p-16 relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05),transparent)] transition-transform duration-1000 group-hover:scale-110" />
            <div className="relative z-10 lg:flex items-center justify-between gap-12">
              <div className="max-w-2xl">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6">Engagement</p>
                <p className="text-2xl font-bold text-white leading-relaxed italic opacity-90">
                  "Toutes nos prestations font l’objet d’une étude et d’un devis au cas par cas, tenant compte de vos besoins spécifiques. Nous répondons à vos besoins dans les plus brefs délais."
                </p>
              </div>
              <div className="mt-12 lg:mt-0">
                <Button asChild size="lg" className="rounded-2xl h-16 px-12 text-lg font-black shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
                  <Link to="/site/demande">Faire une demande</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
