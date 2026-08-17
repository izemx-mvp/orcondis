import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Banknote,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  FileInput,
  FileOutput,
  Landmark,
  MessageCircle,
  ReceiptText,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { SERVICES } from "@/lib/arcondis";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ARCONDIS — Courses professionnelles et démarches administratives" },
      {
        name: "description",
        content:
          "ARCONDIS prend en charge vos courses professionnelles, démarches administratives, collecte de documents, paiements fournisseurs et chèques. Demande en 2 minutes, qualification via WhatsApp.",
      },
      { property: "og:title", content: "ARCONDIS — Vos courses professionnelles prises en charge" },
      {
        property: "og:description",
        content:
          "Bureau de services spécialisé : documents, démarches administratives, paiements fournisseurs, chèques et opérations terrain.",
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
  "Vous envoyez votre demande.",
  "Notre assistant WhatsApp vous contacte.",
  "Les informations nécessaires sont complétées.",
  "ARCONDIS prend en charge votre demande.",
  "Vous êtes informé de l’avancement.",
  "La prestation est clôturée.",
];

function Accueil() {
  return (
    <PublicLayout>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              <Building2 className="h-3.5 w-3.5" /> Bureau de services — Casablanca
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
              Vos courses professionnelles et démarches, prises en charge simplement.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              ARCONDIS intervient pour les entreprises, cabinets et particuliers : récupération et
              livraison de documents, courses administratives, paiement de factures et de
              fournisseurs, traitement des chèques, procédures provisoires et opérations de
              vérification sur le terrain. Vous décrivez votre besoin en quelques lignes, notre
              assistant WhatsApp complète le reste.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/demande">
                  Faire une demande <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="https://wa.me/212661000000">
                  <MessageCircle className="mr-2 h-4 w-4" /> Nous contacter sur WhatsApp
                </a>
              </Button>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6">
              {[
                ["+15 ans", "d’expérience terrain"],
                ["7 j/7", "coordination des missions"],
                ["100 %", "traçabilité documentaire"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xl font-semibold text-navy">{k}</dt>
                  <dd className="text-xs text-muted-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-background p-6 shadow-[var(--shadow-panel)]">
            <p className="text-sm font-semibold text-navy">Déroulé d’une demande</p>
            <ol className="mt-4 space-y-4">
              {ETAPES.map((etape, i) => (
                <li key={etape} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm text-muted-foreground">{etape}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 rounded-lg border border-border bg-surface p-4">
              <p className="text-xs font-medium text-muted-foreground">Exemple de prise en charge</p>
              <p className="mt-2 text-sm text-navy">
                « Je dois récupérer un chèque à Maarif et payer un fournisseur à Aïn Sebaâ avant
                11h. » — demande qualifiée en 12 minutes via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-semibold sm:text-3xl">Nos prestations</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Des interventions cadrées, réalisées par nos coursiers et chargés de démarches.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => {
            const Icon = ICONS[i % ICONS.length]!;
            return (
              <div key={service} className="surface-card p-5 transition-shadow hover:shadow-[var(--shadow-panel)]">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <p className="mt-4 font-medium text-navy">{service}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Prise en charge complète, justificatifs remis et archivés dans votre dossier.
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold sm:text-3xl">Comment ça marche</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {ETAPES.map((etape, i) => (
              <div key={etape} className="surface-card p-5">
                <span className="text-xs font-semibold text-primary">Étape {i + 1}</span>
                <p className="mt-2 text-sm text-navy">{etape}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link to="/demande">Faire une demande</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/comment-ca-marche">En savoir plus</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="rounded-xl border border-border bg-navy px-6 py-12 text-center text-navy-foreground sm:px-12">
          <h2 className="text-2xl font-semibold text-navy-foreground sm:text-3xl">
            Une démarche à confier dès aujourd’hui ?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-navy-foreground/70">
            Envoyez votre demande en moins de deux minutes. Notre assistant WhatsApp complète les
            informations nécessaires et transmet le dossier à l’équipe opérationnelle.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/demande">Faire une demande</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-navy-foreground/30 bg-transparent text-navy-foreground hover:bg-navy-foreground/10">
              <a href="https://wa.me/212661000000">Nous contacter sur WhatsApp</a>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
