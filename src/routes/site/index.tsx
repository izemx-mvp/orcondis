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
} from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { SERVICES } from "@/lib/orcondis";
import { AnimatedBackground } from "@/components/ui/design-system/AnimatedBackground";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/site/")({
  head: () => ({
    meta: [
      { title: "ORCONDIS | Excellence Logistique" },
      {
        name: "description",
        content:
          "ORCONDIS redéfinit la course urbaine. Documents, chèques, démarches administratives : nous traitons vos urgences avec une précision chirurgicale.",
      },
      { property: "og:title", content: "ORCONDIS | Excellence Logistique" },
      {
        property: "og:description",
        content:
          "Bureau de services spécialisé : documents, démarches administratives, paiements fournisseurs et chèques.",
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
      <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
        <AnimatedBackground variant="expressive" />
        <div className="mx-auto max-w-7xl px-6 lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <div className="flex flex-col">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-white/50 backdrop-blur-md px-5 py-2 text-sm font-black text-primary uppercase tracking-widest shadow-sm">
              <Building2 className="h-4 w-4" /> Bureau de services — Casablanca
            </div>
            <h1 className="mt-10 text-5xl font-black tracking-tight text-navy sm:text-7xl lg:text-8xl leading-[0.9]">
              ORCONDIS
            </h1>
            <p className="mt-10 max-w-xl text-lg text-muted-foreground sm:text-2xl font-medium leading-relaxed">
              L'excellence logistique au service de vos urgences. 
              <span className="block mt-4 text-navy">Collecte, distribution et suivi rigoureux de vos dossiers stratégiques.</span>
            </p>
            <div className="mt-12 flex flex-wrap gap-5">
              <Button asChild size="lg" className="rounded-2xl px-10 h-16 text-lg font-black shadow-xl shadow-primary/20 transition-all hover:scale-105 hover:shadow-2xl">
                <Link to="/site/demande">
                  Nouvelle Demande <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="rounded-2xl px-10 h-16 text-lg font-black transition-all hover:scale-105 bg-white border border-border shadow-sm">
                <a href="tel:0666709941">
                  <Phone className="mr-3 h-5 w-5 text-primary" /> 0666 70 99 41
                </a>
              </Button>
            </div>
            <dl className="mt-12 grid grid-cols-3 gap-8 border-t border-border pt-8">
              {[
                ["+15 ans", "Expertise"],
                ["7 j/7", "Coordination"],
                ["100 %", "Traçabilité"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-2xl font-black text-navy">{k}</dt>
                  <dd className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-12 lg:mt-0">
            <div className="rounded-[2.5rem] border border-white/20 bg-white/70 backdrop-blur-2xl p-10 shadow-elevated relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-info opacity-50" />
              <h3 className="text-xl font-black text-navy uppercase tracking-tight">Déroulé d'une mission</h3>
              <div className="mt-10 space-y-8">
                {ETAPES.map((etape, i) => (
                  <div key={etape} className="flex gap-6 items-center group/item">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-white text-sm font-black shadow-lg shadow-primary/20 group-hover/item:scale-110 transition-transform">
                      {i + 1}
                    </span>
                    <span className="text-lg text-muted-foreground font-bold group-hover/item:text-navy transition-colors">{etape}</span>
                  </div>
                ))}
              </div>
              <div className="mt-12 rounded-2xl bg-primary/5 p-6 border border-primary/10 shadow-inner">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3">Exemple opérationnel</p>
                <p className="text-base font-bold text-navy leading-relaxed italic opacity-80">
                  « Récupérer un chèque à Maarif, payer un fournisseur à Aïn Sebaâ et déposer le reçu au siège avant 11h. »
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-32 relative">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">Prestations</h2>
          <p className="text-4xl font-black tracking-tight text-navy sm:text-5xl leading-tight">Optimisez vos opérations avec ORCONDIS</p>
          <p className="mt-6 text-xl text-muted-foreground font-medium">Un service d’accompagnement premium selon vos directives. Étude et devis personnalisés pour chaque mission.</p>
        </div>
        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => {
            const Icon = ICONS[i % ICONS.length]!;
            return (
              <div key={service} className="group relative rounded-[2rem] border border-border bg-white/50 backdrop-blur-sm p-8 transition-all hover:shadow-elevated hover:-translate-y-2 hover:bg-white hover:border-primary/20">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-6 shadow-sm">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="mt-8 text-2xl font-black text-navy tracking-tight">{service}</h3>
                <p className="mt-4 text-base text-muted-foreground font-medium leading-relaxed opacity-70">
                  Accompagnement rigoureux avec traçabilité totale et reporting en temps réel.
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-surface py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-base font-bold uppercase tracking-widest text-primary">Tarification</h2>
            <p className="mt-2 text-3xl font-black tracking-tight text-navy sm:text-4xl">Nos Formules</p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {FORMULAS.map((f) => (
              <div
                key={f.name}
                className={`relative flex flex-col rounded-2xl border p-8 shadow-sm transition-all hover:shadow-md ${
                  f.highlight ? "border-primary bg-white ring-1 ring-primary scale-105 z-10" : "border-border bg-white"
                }`}
              >
                {f.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-black text-primary-foreground tracking-widest">
                    POPULAIRE
                  </span>
                )}
                <h3 className="text-xl font-black text-navy">{f.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground font-medium">{f.description}</p>
                <p className="mt-4 text-3xl font-black text-navy">{f.price}</p>
                <ul className="mt-8 flex-1 space-y-4">
                  {f.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-8 w-full font-bold py-6 rounded-xl transition-transform hover:scale-[1.02]" variant={f.highlight ? "default" : "outline"}>
                  <Link to="/site/demande">Choisir {f.name}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-black tracking-tight text-navy sm:text-4xl italic uppercase">Une question urgente ?</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground font-medium">
            Notre équipe est à votre disposition pour toute demande spécifique ou devis sur mesure.
          </p>
          <div className="mt-12 flex flex-col items-center gap-8 sm:flex-row sm:justify-center">
            <a href="tel:0666709941" className="flex items-center gap-4 text-2xl font-black text-navy hover:text-primary transition-all group">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">
                <Phone className="h-6 w-6" />
              </span>
              0666 70 99 41
            </a>
            <a href="mailto:orcondiscourses@gmail.com" className="flex items-center gap-4 text-2xl font-black text-navy hover:text-primary transition-all group">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">
                <Mail className="h-6 w-6" />
              </span>
              orcondiscourses@gmail.com
            </a>
          </div>
          <div className="mt-16">
            <Button asChild size="lg" className="rounded-full px-12 h-14 text-lg font-bold bg-whatsapp hover:bg-whatsapp/90 text-white">
              <a href="https://wa.me/212666709941">
                <MessageCircle className="mr-3 h-6 w-6" /> Contacter sur WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
