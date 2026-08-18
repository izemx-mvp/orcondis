import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Onglets, PageHeader } from "@/components/bo/kit";
import { CoursesAFacturer } from "@/components/bo/facturation/CoursesAFacturer";
import { FacturationPeriodique } from "@/components/bo/facturation/FacturationPeriodique";
import { Factures } from "@/components/bo/facturation/Factures";
import { PaiementsClients } from "@/components/bo/facturation/PaiementsClients";

export const Route = createFileRoute("/backoffice/facturation")({
  head: () => ({
    meta: [
      { title: "Facturation — Back-Office ORCONDIS" },
      {
        name: "description",
        content:
          "Courses à facturer, facturation périodique, factures et paiements clients ORCONDIS.",
      },
      { property: "og:title", content: "Facturation — Back-Office ORCONDIS" },
      { property: "og:description", content: "Gestion de la facturation ORCONDIS." },
    ],
  }),
  component: FacturationPage,
});

const ONGLETS = ["Courses à facturer", "Facturation périodique", "Factures", "Paiements clients"] as const;

function FacturationPage() {
  const [onglet, setOnglet] = useState<(typeof ONGLETS)[number]>("Courses à facturer");

  return (
    <div className="space-y-5">
      <PageHeader
        titre="Facturation"
        sous="Calcul des montants, génération des factures et suivi des règlements clients."
      />
      <Onglets items={ONGLETS} actif={onglet} onChange={(v) => setOnglet(v as typeof onglet)} />
      {onglet === "Courses à facturer" && <CoursesAFacturer />}
      {onglet === "Facturation périodique" && <FacturationPeriodique />}
      {onglet === "Factures" && <Factures />}
      {onglet === "Paiements clients" && <PaiementsClients />}
    </div>
  );
}
