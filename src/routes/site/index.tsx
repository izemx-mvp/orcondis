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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ORCONDIS | Excellence Logistique" },
      {
        name: "description",
        content:
          "ORCONDIS redéfinit la course urbaine avec Tizzla & Serve. Documents, chèques, démarches administratives : nous traitons vos urgences avec une précision chirurgicale.",
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
      <section className="relative overflow-hidden border-b border-border bg-surface py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:grid lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary">
              <Building2 className="h-4 w-4" /> Bureau de services — Casablanca
            </span>
            <h1 className="mt-8 text-4xl font-black tracking-tighter text-navy sm:text-6xl lg:text-7xl">
              ORCONDIS
            </h1>
            <p className="mt-8 max-w-xl text-lg text-muted-foreground sm:text-xl">
              Vos courses et démarches professionnelles, simplement prises en charge. 
              ORCONDIS vous accompagne dans vos opérations de collecte, d’enlèvement, de livraison, de distribution et dans le suivi de vos dossiers professionnels ou particuliers.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full px-8 text-base font-bold shadow-lg shadow-primary/20 transition-transform hover:scale-105">
                <Link to="/demande">
                  Nouvelle Demande <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8 text-base font-bold transition-transform hover:scale-105">
                <a href="tel:0666709941">
                  <Phone className="mr-2 h-4 w-4 text-primary" /> 0666 70 99 41
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
            <div className="rounded-2xl border border-border bg-white p-8 shadow-2xl shadow-navy/5">
              <h3 className="text-lg font-bold text-navy">Déroulé d'une demande</h3>
              <div className="mt-6 space-y-6">
                {ETAPES.map((etape, i) => (
                  <div key={etape} className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-base text-muted-foreground font-medium">{etape}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-xl bg-surface p-5 border border-border">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Exemple de mission</p>
                <p className="mt-3 text-sm font-medium text-navy leading-relaxed italic">
                  « Récupérer un chèque à Maarif, payer un fournisseur à Aïn Sebaâ et déposer le reçu au siège avant 11h. »
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6">
        <div className="text-center">
          <h2 className="text-base font-bold uppercase tracking-widest text-primary">Services</h2>
          <p className="mt-2 text-3xl font-black tracking-tight text-navy sm:text-4xl">Gagnez du temps et optimisez vos opérations avec les services de proximité et de coursiers ORCONDIS.</p>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Un véritable service d’accompagnement selon les directives du client. Toutes nos prestations font l’objet d’une étude et d’un devis au cas par cas.</p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => {
            const Icon = ICONS[i % ICONS.length]!;
            return (
              <div key={service} className="group relative rounded-2xl border border-border bg-white p-6 transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-navy/5">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-6 text-lg font-bold text-navy">{service}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Service professionnel avec remise de justificatifs et traçabilité en temps réel.
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
                  <Link to="/demande">Choisir {f.name}</Link>
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