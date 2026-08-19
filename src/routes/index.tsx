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
        <Card className="group flex flex-col border-none shadow-panel transition-all hover:shadow-elevated hover:-translate-y-1 rounded-[1.5rem] bg-white/80 backdrop-blur-2xl overflow-hidden border border-white/20">
          <CardHeader className="text-center pt-10 px-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-primary/5 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-[10deg] shadow-sm">
              <Globe className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl font-black text-navy">Site Web</CardTitle>
            <CardDescription className="pt-4 text-[14px] font-bold leading-relaxed text-muted-foreground/80">
              Découvrez nos prestations premium et effectuez vos demandes en ligne.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto flex justify-center pb-10 px-8">
            <Button asChild size="lg" className="w-full rounded-xl font-black py-6 text-base transition-all hover:scale-[1.02] shadow-primary/20 shadow-lg">
              <Link to="/site">Entrer sur le site</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Card 2 — BACK-OFFICE */}
        <Card className="group flex flex-col border-none shadow-panel transition-all hover:shadow-elevated hover:-translate-y-1 rounded-[1.5rem] bg-white/80 backdrop-blur-2xl overflow-hidden border border-white/20">
          <CardHeader className="text-center pt-10 px-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-navy/5 text-navy transition-all duration-500 group-hover:bg-navy group-hover:text-white group-hover:-rotate-[10deg] shadow-sm">
              <LayoutDashboard className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl font-black text-navy">Back-Office</CardTitle>
            <CardDescription className="pt-4 text-[14px] font-bold leading-relaxed text-muted-foreground/80">
              Gestion opérationnelle interne des clients, dossiers et courses.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto flex justify-center pb-10 px-8">
            <Button asChild size="lg" variant="secondary" className="w-full rounded-xl font-black py-6 text-base transition-all hover:scale-[1.02] shadow-sm bg-navy text-white hover:bg-navy/90">
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
