import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/connexion")({
  head: () => ({
    meta: [
      { title: "Connexion — Back-Office ORCONDIS" },
      {
        name: "description",
        content: "Accès réservé aux collaborateurs ORCONDIS : back-office de gestion des demandes.",
      },
      { property: "og:title", content: "Connexion — Back-Office ORCONDIS" },
      { property: "og:description", content: "Espace collaborateurs ORCONDIS." },
    ],
  }),
  component: Connexion,
});

function Connexion() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("y.bennani@orcondis.ma");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <section className="mx-auto flex w-full max-w-md flex-col px-4 sm:px-6">
        <div className="flex flex-col items-center mb-10">
          <img src="/assets/orcondis-logo.png" alt="ORCONDIS" className="h-20 w-auto object-contain mb-4" />
          <h1 className="text-2xl font-black text-navy tracking-tight">Connexion Back-Office</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Accès sécurisé réservé aux collaborateurs.
          </p>
        </div>
        <div className="surface-card p-8 shadow-elevated border-none bg-white/80 backdrop-blur-xl rounded-[2.5rem]">
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/backoffice/dashboard" });
            }}
          >
            <div>
              <Label htmlFor="email">Email professionnel</Label>
              <Input
                id="email"
                type="email"
                className="mt-1.5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="mdp">Mot de passe</Label>
              <Input id="mdp" type="password" className="mt-1.5" defaultValue="orcondis" required />
            </div>
            <Button type="submit" className="w-full">
              Se connecter
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
