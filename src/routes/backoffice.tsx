import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BOProvider } from "@/lib/bo-store";
import { OpsProvider } from "@/lib/bo/ops-store";
import { BOLayout } from "@/components/bo/BOLayout";

export const Route = createFileRoute("/backoffice")({
  head: () => ({
    meta: [
      { title: "Back-Office ARCONDIS — Pilotage des opérations" },
      {
        name: "description",
        content:
          "Back-Office ARCONDIS : demandes, clients, dossiers, courses, WhatsApp, paiements, facturation et rapports.",
      },
      { property: "og:title", content: "Back-Office ARCONDIS" },
      { property: "og:description", content: "Pilotage complet des opérations ARCONDIS." },
    ],
  }),
  component: BackOfficeLayout,
});

function BackOfficeLayout() {
  return (
    <BOProvider>
      <BOLayout>
        <Outlet />
      </BOLayout>
    </BOProvider>
  );
}
