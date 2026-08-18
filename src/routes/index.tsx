import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/PublicLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] p-4 sm:p-8">
      <div className="mb-12 text-center">
        <Logo />
        <h1 className="mt-8 text-3xl font-black tracking-tighter text-[#0F172A] sm:text-4xl">
          Bienvenue sur ORCONDIS
        </h1>
        <p className="mt-4 text-muted-foreground font-medium">
          Sélectionnez l’espace auquel vous souhaitez accéder.
        </p>
      </div>

      <div className="grid w-full max-w-4xl gap-8 sm:grid-cols-2">
        {/* Card 1 — SITE WEB */}
        <Card className="group flex flex-col border-none shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 rounded-2xl bg-white overflow-hidden">
          <CardHeader className="text-center pt-12 px-8">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              <Globe className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl font-black text-[#0F172A]">Site Web</CardTitle>
            <CardDescription className="pt-4 text-base font-medium leading-relaxed text-muted-foreground">
              Accédez au site ORCONDIS pour découvrir nos prestations et effectuer une demande.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto flex justify-center pb-12 px-8">
            <Button asChild size="lg" className="w-full rounded-xl font-bold py-7 text-base transition-all hover:scale-[1.02]">
              <Link to="/site">Accéder au site web</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Card 2 — BACK-OFFICE */}
        <Card className="group flex flex-col border-none shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 rounded-2xl bg-white overflow-hidden">
          <CardHeader className="text-center pt-12 px-8">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              <LayoutDashboard className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl font-black text-[#0F172A]">Back-Office</CardTitle>
            <CardDescription className="pt-4 text-base font-medium leading-relaxed text-muted-foreground">
              Accédez à l’espace interne de gestion des demandes, clients, dossiers, courses et opérations ORCONDIS.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto flex justify-center pb-12 px-8">
            <Button asChild size="lg" className="w-full rounded-xl font-bold py-7 text-base transition-all hover:scale-[1.02]">
              <Link to="/connexion">Accéder au Back-Office</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-16 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
        Created by IZEMX
      </div>
    </div>
  );
}
