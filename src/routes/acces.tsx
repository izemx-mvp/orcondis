import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/PublicLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/acces")({
  head: () => ({
    meta: [
      { title: "Bienvenue sur ORCONDIS — Choix de l'espace" },
      { name: "description", content: "Choisissez l'espace auquel vous souhaitez accéder : Site Web ou Back-Office ORCONDIS." },
    ],
  }),
  component: AccessSelectionPage,
});

function AccessSelectionPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="mb-12 text-center">
        <Logo />
        <h1 className="mt-8 text-3xl font-black tracking-tighter text-navy sm:text-4xl">
          Bienvenue sur ORCONDIS
        </h1>
        <p className="mt-4 text-muted-foreground">
          Choisissez l’espace auquel vous souhaitez accéder.
        </p>
      </div>

      <div className="grid w-full max-w-4xl gap-6 sm:grid-cols-2">
        {/* Card 1 — SITE WEB */}
        <Card className="group flex flex-col transition-all hover:border-primary/50 hover:shadow-xl">
          <CardHeader className="text-center pt-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              <Globe className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-black text-navy">Site Web ORCONDIS</CardTitle>
            <CardDescription className="pt-4 text-base font-medium leading-relaxed">
              Accéder au site public ORCONDIS, découvrir les prestations et effectuer une demande.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto flex justify-center pb-10">
            <Button asChild size="lg" className="w-full max-w-[200px] rounded-full font-bold transition-transform hover:scale-105">
              <Link to="/">Accéder au site</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Card 2 — BACK-OFFICE */}
        <Card className="group flex flex-col transition-all hover:border-primary/50 hover:shadow-xl">
          <CardHeader className="text-center pt-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              <LayoutDashboard className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-black text-navy">Back-Office ORCONDIS</CardTitle>
            <CardDescription className="pt-4 text-base font-medium leading-relaxed">
              Accéder à l’espace de gestion interne des demandes, clients, dossiers, courses et opérations ORCONDIS.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto flex justify-center pb-10">
            <Button asChild size="lg" className="w-full max-w-[200px] rounded-full font-bold transition-transform hover:scale-105">
              <Link to="/backoffice/dashboard">Accéder au Back-Office</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-16 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ORCONDIS — Created by IZEMX
      </div>
    </div>
  );
}