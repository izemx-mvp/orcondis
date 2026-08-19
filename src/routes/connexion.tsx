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
        <div className="flex flex-col items-center mb-10 group">
          <div className="bg-white p-4 rounded-2xl shadow-xl shadow-navy/5 transition-all group-hover:scale-105 duration-500 mb-4">
            <img src="/assets/orcondis-logo.png" alt="ORCONDIS" className="h-16 w-auto object-contain" />
          </div>
          <h1 className="text-xl font-black text-navy tracking-tight">Connexion au Back-Office</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Accès réservé à l'équipe ORCONDIS
          </p>
        </div>
        <div className="surface-card p-6 shadow-elevated border-none bg-white/80 backdrop-blur-xl rounded-2xl">
          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/backoffice/dashboard" });
            }}
          >
            <div>
              <Label htmlFor="email" className="text-[13px] font-semibold">Email professionnel</Label>
              <Input
                id="email"
                type="email"
                className="mt-1 h-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="mdp" className="text-[13px] font-semibold">Mot de passe</Label>
              <Input id="mdp" type="password" className="mt-1 h-10" defaultValue="orcondis" required />
            </div>
            <Button type="submit" className="w-full h-10 font-bold">
              Se connecter
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
