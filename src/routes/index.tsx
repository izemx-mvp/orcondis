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
    <div className="relative flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 overflow-hidden">
      <AnimatedBackground variant="expressive" />
      
      <div className="mb-12 text-center relative z-10 flex flex-col items-center">
        <div className="mb-8 transition-all hover:scale-105 duration-700 ease-in-out">
          <img 
            src="/assets/orcondis-logo.png" 
            alt="ORCONDIS" 
            className="h-28 sm:h-36 w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)]" 
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-black tracking-tighter text-navy sm:text-6xl max-w-2xl mx-auto leading-[1.1]">
            Bienvenue sur <span className="text-primary">ORCONDIS</span>
          </h1>
          <div className="h-1 w-20 bg-primary/20 rounded-full mt-2" />
        </div>
        <p className="mt-8 text-lg text-muted-foreground font-semibold max-w-lg mx-auto opacity-80">
          Choisissez votre portail d'accès sécurisé
        </p>
      </div>

      <div className="grid w-full max-w-5xl gap-10 sm:grid-cols-2 relative z-10">
        {/* Card 1 — SITE WEB */}
        <Card className="group flex flex-col border-none shadow-panel transition-all hover:shadow-elevated hover:-translate-y-2 rounded-[2.5rem] bg-white/80 backdrop-blur-2xl overflow-hidden border border-white/20">
          <CardHeader className="text-center pt-16 px-10">
            <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary/5 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-[10deg] shadow-sm">
              <Globe className="h-12 w-12" />
            </div>
            <CardTitle className="text-3xl font-black text-navy">Site Web</CardTitle>
            <CardDescription className="pt-6 text-base font-bold leading-relaxed text-muted-foreground/80">
              Découvrez nos prestations premium et effectuez vos demandes en ligne.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto flex justify-center pb-16 px-10">
            <Button asChild size="lg" className="w-full rounded-2xl font-black py-8 text-lg transition-all hover:scale-[1.02] shadow-primary/20 shadow-lg">
              <Link to="/site">Entrer sur le site</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Card 2 — BACK-OFFICE */}
        <Card className="group flex flex-col border-none shadow-panel transition-all hover:shadow-elevated hover:-translate-y-2 rounded-[2.5rem] bg-white/80 backdrop-blur-2xl overflow-hidden border border-white/20">
          <CardHeader className="text-center pt-16 px-10">
            <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-navy/5 text-navy transition-all duration-500 group-hover:bg-navy group-hover:text-white group-hover:-rotate-[10deg] shadow-sm">
              <LayoutDashboard className="h-12 w-12" />
            </div>
            <CardTitle className="text-3xl font-black text-navy">Back-Office</CardTitle>
            <CardDescription className="pt-6 text-base font-bold leading-relaxed text-muted-foreground/80">
              Gestion opérationnelle interne des clients, dossiers et courses.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto flex justify-center pb-16 px-10">
            <Button asChild size="lg" variant="secondary" className="w-full rounded-2xl font-black py-8 text-lg transition-all hover:scale-[1.02] shadow-sm bg-navy text-white hover:bg-navy/90">
              <Link to="/connexion">Connexion Interne</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-20 text-center relative z-10">
        <span className="inline-block px-4 py-2 rounded-full bg-white/30 backdrop-blur-md text-[10px] font-black text-navy/40 uppercase tracking-[0.3em] border border-white/20">
          Created by IZEMX
        </span>
      </div>
    </div>
  );
}
