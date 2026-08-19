import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Banknote,
  Building2,
  Check,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  FileInput,
  FileOutput,
  Landmark,
  Mail,
  MessageCircle,
  Phone,
  ReceiptText,
  ShieldCheck,
  Truck,
  Wallet,
  Zap,
} from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { SERVICES } from "@/lib/orcondis";
import { AnimatedBackground } from "@/components/ui/design-system/AnimatedBackground";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/site/")({
  head: () => ({
    meta: [
      { title: "ORCONDIS | Excellence Logistique & Services Casablanca" },
      {
        name: "description",
        content:
          "ORCONDIS redéfinit la course urbaine à Casablanca. Documents, chèques, démarches administratives : nous traitons vos urgences avec une précision chirurgicale.",
      },
      { property: "og:title", content: "ORCONDIS | Excellence Logistique & Services" },
      {
        property: "og:description",
        content:
          "Bureau de services spécialisé à Casablanca : documents, démarches administratives, paiements fournisseurs et chèques.",
      },
    ],
  }),
  component: Accueil,
});

const ICONS = [
  FileInput,
  FileOutput,
  ClipboardList,
  ReceiptText,
  Wallet,
  Banknote,
  Landmark,
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  Truck,
];

const ETAPES = [
  "Vous envoyez votre demande en ligne.",
  "Notre assistant WhatsApp qualifie le besoin.",
  "Les informations manquantes sont collectées.",
  "ORCONDIS déploie ses agents sur le terrain.",
  "Suivi en temps réel de l'exécution.",
  "Clôture de mission et archivage documentaire.",
];

const FORMULAS = [
  {
    name: "Formule 1",
    description: "2 courses normales en Aller simple par jour",
    price: "Sur devis",
    features: ["Centre-ville", "Rayon de 7 km", "5 jours / semaine", "Suivi WhatsApp"],
  },
  {
    name: "Formule 2",
    description: "1 course normale en Aller simple par jour",
    price: "Sur devis",
    features: ["Centre-ville", "Rayon de 7 km", "5 jours / semaine", "Priorité standard"],
    highlight: true,
  },
  {
    name: "Formule 3",
    description: "1 course normale en Aller simple",
    price: "Sur devis",
    features: ["Centre-ville", "Rayon de 7 km", "3 jours / semaine", "Service flexible"],
  },
];

function Accueil() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <AnimatedBackground variant="ambient" />
        <div className="mx-auto w-full max-w-7xl px-6 lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <div className="flex flex-col animate-in fade-in slide-in-from-left-12 duration-1000 z-10">
            <div className="inline-flex w-fit items-center gap-3 rounded-full border border-primary/20 bg-white/50 dark:bg-primary/10 backdrop-blur-md px-5 py-2 text-[10px] font-black text-primary uppercase tracking-[0.3em] shadow-sm">
              <Zap className="h-3.5 w-3.5 fill-primary" /> Bureau de services premium — Casablanca
            </div>
            
            <h1 className="mt-8 text-5xl font-black tracking-tight text-navy sm:text-6xl lg:text-7xl leading-tight">
              ORCONDIS
            </h1>
            
            <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl font-medium leading-relaxed">
              L'excellence logistique au service de vos urgences. 
              <span className="block mt-4 text-navy/80 font-black border-l-4 border-primary pl-6">Collecte, distribution et suivi rigoureux de vos dossiers stratégiques.</span>
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-2xl px-8 h-14 text-base font-black shadow-xl shadow-primary/20 transition-all hover:scale-105 group">
                <Link to="/site/demande">
                  Nouvelle Demande <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="rounded-2xl px-8 h-14 text-base font-black transition-all hover:scale-105 bg-white dark:bg-secondary/50 border border-border shadow-sm">
                <a href="tel:0666709941">
                  <Phone className="mr-2 h-5 w-5 text-primary" /> 0666 70 99 41
                </a>
              </Button>
            </div>

            <dl className="mt-16 grid grid-cols-3 gap-8 border-t border-border/50 pt-10">
              {[
                ["+15 ans", "Expertise"],
                ["7 j/7", "Coordination"],
                ["100 %", "Traçabilité"],
              ].map(([k, v]) => (
                <div key={k} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <dt className="text-2xl font-black text-navy">{k}</dt>
                  <dd className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mt-0.5">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-16 lg:mt-0 animate-in fade-in slide-in-from-right-12 duration-1000 relative">
            <div className="relative rounded-[2.5rem] border border-white/20 dark:border-white/5 bg-white/70 dark:bg-surface/80 backdrop-blur-2xl p-8 lg:p-10 shadow-elevated overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-info opacity-50" />
              <h3 className="text-lg font-black text-navy uppercase tracking-[0.1em] mb-8">Déroulé d'une mission</h3>
              <div className="space-y-6">
                {ETAPES.map((etape, i) => (
                  <div key={etape} className="flex gap-6 items-center group/item">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-navy/30 border border-primary/20 shadow-sm text-primary text-base font-black group-hover/item:scale-110 group-hover/item:bg-primary group-hover/item:text-white transition-all duration-300">
                      {i + 1}
                    </span>
                    <span className="text-base text-muted-foreground font-bold group-hover/item:text-navy transition-colors">{etape}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 rounded-2xl bg-navy p-6 border border-white/10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ClipboardList className="h-12 w-12 text-white" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-3">Exemple opérationnel</p>
                <p className="text-base font-bold text-white/90 leading-relaxed italic">
                  « Récupérer un chèque à Maarif, payer un fournisseur à Aïn Sebaâ et déposer le reçu au siège avant 11h. »
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="mx-auto w-full max-w-7xl px-6 py-32 relative">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-6">Nos Prestations</h2>
          <p className="text-5xl font-black tracking-tighter text-navy sm:text-6xl leading-[1.1]">Optimisez vos opérations avec ORCONDIS</p>
          <p className="mt-8 text-xl text-muted-foreground font-medium">Un service d’accompagnement premium selon vos directives. Étude et devis personnalisés pour chaque mission.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => {
            const Icon = ICONS[i % ICONS.length]!;
            return (
              <div key={service} className="group relative rounded-[2.5rem] border border-border bg-white/50 backdrop-blur-sm p-10 transition-all hover:shadow-elevated hover:-translate-y-2 hover:bg-white hover:border-primary/20 animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-6 shadow-sm">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="mt-8 text-2xl font-black text-navy tracking-tight">{service}</h3>
                <p className="mt-4 text-base text-muted-foreground font-medium leading-relaxed opacity-70">
                  Accompagnement rigoureux avec traçabilité totale et reporting en temps réel sur Casablanca.
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-navy py-32 sm:py-48 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.03),transparent)]" />
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="text-center mb-24">
             <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-6">Tarification</h2>
            <p className="text-5xl font-black tracking-tighter text-white sm:text-6xl">Nos Formules</p>
          </div>
          <div className="grid gap-10 md:grid-cols-3">
            {FORMULAS.map((f, i) => (
              <div
                key={f.name}
                className={cn(
                  "relative flex flex-col rounded-[2.5rem] border p-12 transition-all hover:-translate-y-2 duration-500",
                  f.highlight 
                    ? "border-primary bg-white/10 backdrop-blur-xl shadow-2xl shadow-primary/20 scale-105 z-10" 
                    : "border-white/10 bg-white/5"
                )}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {f.highlight && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-6 py-2 text-[10px] font-black text-white tracking-[0.3em]">
                    RECOMMANDÉ
                  </span>
                )}
                <h3 className="text-2xl font-black text-white">{f.name}</h3>
                <p className="mt-3 text-base text-white/50 font-medium">{f.description}</p>
                <div className="mt-10 mb-10">
                   <span className="text-5xl font-black text-white">{f.price}</span>
                </div>
                <ul className="flex-1 space-y-5 border-t border-white/10 pt-10">
                  {f.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-4 text-sm font-bold text-white/80">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-12 w-full h-16 rounded-2xl font-black transition-all hover:scale-[1.05]" variant={f.highlight ? "default" : "secondary"}>
                  <Link to="/site/demande">Choisir {f.name}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-32 sm:py-48 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 text-center relative z-10">
          <h2 className="text-4xl font-black tracking-tight text-navy sm:text-6xl italic uppercase leading-[0.85]">Une question urgente ?</h2>
          <p className="mx-auto mt-10 max-w-2xl text-xl text-muted-foreground font-medium">
            Notre équipe est à votre disposition pour toute demande spécifique ou devis sur mesure.
          </p>
          <div className="mt-20 flex flex-col items-center gap-12 lg:flex-row lg:justify-center">
            <a href="tel:0666709941" className="flex items-center gap-6 group">
              <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-primary/20 group-hover:scale-110">
                <Phone className="h-8 w-8" />
              </span>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Appelez-nous</p>
                <p className="text-3xl font-black text-navy group-hover:text-primary transition-colors">0666 70 99 41</p>
              </div>
            </a>
            <a href="mailto:orcondiscourses@gmail.com" className="flex items-center gap-6 group">
              <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-primary/20 group-hover:scale-110">
                <Mail className="h-8 w-8" />
              </span>
              <div className="text-left">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Email</p>
                <p className="text-2xl font-black text-navy group-hover:text-primary transition-colors">orcondiscourses@gmail.com</p>
              </div>
            </a>
          </div>
          <div className="mt-24">
            <Button asChild size="lg" className="rounded-[1.5rem] px-14 h-20 text-xl font-black bg-whatsapp hover:bg-whatsapp/90 text-white shadow-2xl shadow-whatsapp/20 hover:scale-105 transition-all">
              <a href="https://wa.me/212666709941">
                <MessageCircle className="mr-3 h-7 w-7" /> WhatsApp Direct
              </a>
            </Button>
          </div>
        </div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
      </section>
    </PublicLayout>
  );
}
