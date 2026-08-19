import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedBackground } from "@/components/ui/design-system/AnimatedBackground";

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
    <div className="flex min-h-screen items-center justify-center bg-navy relative overflow-hidden">
      <AnimatedBackground variant="expressive" className="opacity-30" />
      <section className="mx-auto flex w-full max-w-md flex-col px-4 sm:px-6 relative z-10">
        <div className="flex flex-col items-center mb-10 group">
          <div className="bg-white p-6 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all group-hover:scale-105 duration-700 mb-8">
            <img src="/assets/orcondis-logo.png" alt="ORCONDIS" className="h-20 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">Connexion au Back-Office</h1>
          <p className="text-base text-white/50 font-bold uppercase tracking-[0.2em]">
            Accès réservé ORCONDIS
          </p>
        </div>
        <div className="elevated-card p-10 border-none bg-white/80 dark:bg-surface/80 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl">
          <form
            className="mt-6 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/backoffice/dashboard" });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-[0.2em] text-navy/40 dark:text-white/40 ml-1">Email professionnel</Label>
              <Input
                id="email"
                type="email"
                className="h-14 rounded-2xl bg-white/50 border-border/40 focus:ring-primary/20 px-6 font-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mdp" className="text-[11px] font-black uppercase tracking-[0.2em] text-navy/40 dark:text-white/40 ml-1">Mot de passe</Label>
              <Input id="mdp" type="password" className="h-14 rounded-2xl bg-white/50 border-border/40 focus:ring-primary/20 px-6 font-black" defaultValue="orcondis" required />
            </div>
            <Button type="submit" className="w-full h-16 font-black uppercase tracking-widest text-lg rounded-2xl shadow-2xl shadow-primary/30 transition-all hover:scale-[1.05] active:scale-95 border-none">
              Se connecter
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
