import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/bo/kit";
import { ParamExtraProvider } from "@/lib/bo-param-extra";
import { SectionServices, SectionZones } from "@/components/bo/parametres/services-zones";
import {
  SectionTypesCourse,
  SectionTypesClient,
  SectionTypesContact,
  SectionTransports,
  SectionPriorites,
  SectionTranchesHoraires,
  SectionProcedures,
} from "@/components/bo/parametres/referentiels-simples";
import { SectionTarification } from "@/components/bo/parametres/tarification";
import { SectionNumerotation } from "@/components/bo/parametres/numerotation";
import { SectionNotifications } from "@/components/bo/parametres/notifications";
import { SectionWhatsapp } from "@/components/bo/parametres/whatsapp";
import { SectionSociete } from "@/components/bo/parametres/societe";
import { SectionRegles } from "@/components/bo/parametres/regles";
import { SectionAgentCoursier } from "@/components/bo/parametres/agent-coursier";


export const Route = createFileRoute("/backoffice/parametres")({
  head: () => ({
    meta: [
      { title: "Paramètres — Back-Office ORCONDIS" },
      {
        name: "description",
        content:
          "Configuration ORCONDIS : services, zones, transports, tarification, numérotation, notifications et WhatsApp.",
      },
      { property: "og:title", content: "Paramètres — Back-Office ORCONDIS" },
      { property: "og:description", content: "Configuration des référentiels ORCONDIS." },
    ],
  }),
  component: ParametresPage,
});

const SECTIONS = [
  { cle: "societe", label: "Informations société", rendu: () => <SectionSociete /> },
  { cle: "regles", label: "Règles d'exploitation", rendu: () => <SectionRegles /> },
  { cle: "agent-coursier", label: "Agent de communication coursier", rendu: () => <SectionAgentCoursier /> },
  { cle: "services", label: "Services", rendu: () => <SectionServices /> },

  { cle: "zones", label: "Zones", rendu: () => <SectionZones /> },
  { cle: "types-course", label: "Types de course", rendu: () => <SectionTypesCourse /> },
  { cle: "types-client", label: "Types de client", rendu: () => <SectionTypesClient /> },
  { cle: "types-contact", label: "Rôles de contact", rendu: () => <SectionTypesContact /> },
  { cle: "transports", label: "Moyens de transport", rendu: () => <SectionTransports /> },
  { cle: "priorites", label: "Priorités", rendu: () => <SectionPriorites /> },
  { cle: "horaires", label: "Tranches horaires", rendu: () => <SectionTranchesHoraires /> },
  { cle: "procedures", label: "Procédures", rendu: () => <SectionProcedures /> },
  { cle: "tarification", label: "Tarification", rendu: () => <SectionTarification /> },
  { cle: "numerotation", label: "Numérotation", rendu: () => <SectionNumerotation /> },
  { cle: "notifications", label: "Notifications", rendu: () => <SectionNotifications /> },
  { cle: "whatsapp", label: "WhatsApp", rendu: () => <SectionWhatsapp /> },
] as const;

function ParametresPage() {
  const [actif, setActif] = useState<string>("societe");
  const section = SECTIONS.find((s) => s.cle === actif) ?? SECTIONS[0];

  return (
    <ParamExtraProvider>
      <div className="space-y-5">
        <PageHeader
          titre="Paramètres"
          sous="Référentiels, tarification, numérotation et configuration des notifications ORCONDIS."
        />
        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav className="h-fit space-y-0.5 rounded-lg border border-border bg-card p-2">
            {SECTIONS.map((s) => (
              <button
                key={s.cle}
                onClick={() => setActif(s.cle)}
                className={`block w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                  actif === s.cle ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface"
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
          <div className="min-w-0">{section.rendu()}</div>
        </div>
      </div>
    </ParamExtraProvider>
  );
}
