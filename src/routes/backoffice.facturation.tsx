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
      { title: "Facturation & Paiements — Back-Office ORCONDIS" },
      { name: "description", content: "Gestion de la facturation et des paiements clients." },
    ],
  }),
  component: FacturationPage,
});

const ONGLETS = ["Factures", "Paiements clients", "Courses à facturer", "Facturation périodique"] as const;

function FacturationPage() {
  const [onglet, setOnglet] = useState<(typeof ONGLETS)[number]>("Factures");

  return (
    <div className="space-y-5">
      <PageHeader titre="Facturation & Paiements" sous="Gestion des factures et règlements clients." />
      <Onglets items={ONGLETS} actif={onglet} onChange={(v) => setOnglet(v as typeof onglet)} />
      {onglet === "Factures" && <Factures />}
      {onglet === "Paiements clients" && <PaiementsClients />}
      {onglet === "Courses à facturer" && <CoursesAFacturer />}
      {onglet === "Facturation périodique" && <FacturationPeriodique />}
    </div>
  );
}
