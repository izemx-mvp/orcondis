import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/PublicLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/ui/design-system/AnimatedBackground";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bienvenue sur ORCONDIS — Choix de l'espace" },
      { name: "description", content: "Sélectionnez l'espace auquel vous souhaitez accéder : Site Web ou Back-Office ORCONDIS." },
    ],
  }),
  component: AccessSelectionPage,
});

function AccessSelectionPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 overflow-hidden bg-navy">
      <AnimatedBackground variant="expressive" className="opacity-20" />
      
      <div className="mb-12 text-center relative z-10 flex flex-col items-center">
        <div className="mb-10 transition-all hover:scale-105 duration-700 ease-in-out">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <img 
              src="/assets/orcondis-logo.png" 
              alt="ORCONDIS" 
              className="h-24 sm:h-32 w-auto object-contain" 
            />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-black tracking-tighter text-white sm:text-5xl max-w-2xl mx-auto leading-[1.1]">
            Bienvenue sur <span className="text-primary">ORCONDIS</span>
          </h1>
          <div className="h-1 w-16 bg-primary/20 rounded-full mt-2" />
        </div>
        <p className="mt-6 text-base text-white/60 font-semibold max-w-lg mx-auto">
          Choisissez votre portail d'accès sécurisé
        </p>
      </div>

      <div className="grid w-full max-w-4xl gap-8 sm:grid-cols-2 relative z-10">
        {/* Card 1 — SITE WEB */}
        <Card className="elevated-card group flex flex-col border-none transition-all rounded-[3rem] bg-white/80 dark:bg-surface/80 backdrop-blur-3xl overflow-hidden">
          <CardHeader className="text-center pt-12 px-10">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary/5 text-primary transition-all duration-700 group-hover:bg-primary group-hover:text-white group-hover:rotate-[15deg] shadow-lg shadow-primary/5">
              <Globe className="h-12 w-12" />
            </div>
            <CardTitle className="text-3xl font-black text-navy uppercase tracking-tighter">Site Web</CardTitle>
            <CardDescription className="pt-4 text-base font-bold leading-relaxed text-muted-foreground/60">
              Découvrez nos prestations premium et effectuez vos demandes en ligne.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto flex justify-center pb-12 px-10">
            <Button asChild size="lg" className="w-full rounded-[1.5rem] font-black py-8 text-lg transition-all hover:scale-[1.05] shadow-primary/30 shadow-2xl uppercase tracking-widest active:scale-95 border-none">
              <Link to="/site">Entrer sur le site</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Card 2 — BACK-OFFICE */}
        <Card className="elevated-card group flex flex-col border-none transition-all rounded-[3rem] bg-white/80 dark:bg-surface/80 backdrop-blur-3xl overflow-hidden">
          <CardHeader className="text-center pt-12 px-10">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-navy/5 dark:bg-white/10 text-navy dark:text-white transition-all duration-700 group-hover:bg-navy group-hover:text-white group-hover:-rotate-[15deg] shadow-lg shadow-navy/5">
              <LayoutDashboard className="h-12 w-12" />
            </div>
            <CardTitle className="text-3xl font-black text-navy uppercase tracking-tighter">Back-Office</CardTitle>
            <CardDescription className="pt-4 text-base font-bold leading-relaxed text-muted-foreground/60">
              Gestion opérationnelle interne des clients, dossiers et courses.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto flex justify-center pb-12 px-10">
            <Button asChild size="lg" variant="secondary" className="w-full rounded-[1.5rem] font-black py-8 text-lg transition-all hover:scale-[1.05] shadow-xl bg-navy text-white hover:bg-navy/90 uppercase tracking-widest active:scale-95 border-none">
              <Link to="/connexion">Connexion Interne</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-20 text-center relative z-10">
        <span className="inline-block px-4 py-2 rounded-full bg-white/5 backdrop-blur-md text-[10px] font-black text-white/20 uppercase tracking-[0.3em] border border-white/5">
          Created by IZEMX
        </span>
      </div>
    </div>
  );
}
