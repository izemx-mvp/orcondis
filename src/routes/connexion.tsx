import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/connexion")({
  head: () => ({
    meta: [
      { title: "Connexion — Back-Office ARCONDIS" },
      {
        name: "description",
        content: "Accès réservé aux collaborateurs ARCONDIS : back-office de gestion des demandes.",
      },
      { property: "og:title", content: "Connexion — Back-Office ARCONDIS" },
      { property: "og:description", content: "Espace collaborateurs ARCONDIS." },
    ],
  }),
  component: Connexion,
});

function Connexion() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("y.bennani@arcondis.ma");

  return (
    <PublicLayout>
      <section className="mx-auto flex w-full max-w-md flex-col px-4 py-16 sm:px-6">
        <div className="surface-card p-6">
          <h1 className="text-xl font-semibold">Connexion collaborateur</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Accès au back-office ARCONDIS (démonstration).
          </p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/back-office" });
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
              <Input id="mdp" type="password" className="mt-1.5" defaultValue="arcondis" required />
            </div>
            <Button type="submit" className="w-full">
              Se connecter
            </Button>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}
