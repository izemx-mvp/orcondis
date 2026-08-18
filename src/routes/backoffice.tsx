import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BOProvider } from "@/lib/bo-store";
import { OpsProvider } from "@/lib/bo/ops-store";
import { StoreProvider } from "@/lib/store";
import { BOLayout } from "@/components/bo/BOLayout";
import { AnimatedBackground } from "@/components/ui/design-system/AnimatedBackground";

export const Route = createFileRoute("/backoffice")({
  head: () => ({
    meta: [
      { title: "Back-Office ORCONDIS — Pilotage des opérations" },
      {
        name: "description",
        content:
          "Back-Office ORCONDIS : demandes, clients, dossiers, courses, WhatsApp, paiements, facturation et rapports.",
      },
      { property: "og:title", content: "Back-Office ORCONDIS" },
      { property: "og:description", content: "Pilotage complet des opérations ORCONDIS." },
    ],
  }),
  component: BackOfficeLayout,
});

function BackOfficeLayout() {
  return (
    <div className="flex min-h-screen bg-background relative isolate">
      <AnimatedBackground variant="subtle" className="opacity-40" />
      <BOProvider>
        <StoreProvider>
          <OpsProvider>
            <BOLayout>
              <Outlet />
            </BOLayout>
          </OpsProvider>
        </StoreProvider>
      </BOProvider>
    </div>
  );
}
