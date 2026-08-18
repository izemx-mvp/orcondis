import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Onglets, PageHeader, Panel, StatCard } from "@/components/bo/kit";
import { Button } from "@/components/ui/button";
import { useBO } from "@/lib/bo-store";
import { Inbox } from "@/components/bo/whatsapp/Inbox";

export const Route = createFileRoute("/backoffice/whatsapp")({
  head: () => ({
    meta: [
      { title: "WhatsApp — Back-Office ORCONDIS" },
      { name: "description", content: "Conversations WhatsApp, agent IA et interventions humaines ORCONDIS." },
      { property: "og:title", content: "WhatsApp ORCONDIS" },
      { property: "og:description", content: "Suivi des conversations et de l'agent WhatsApp ORCONDIS." },
    ],
  }),
  component: WhatsAppPage,
});

const ONGLETS = ["Conversations", "Agent WhatsApp", "Intervention humaine", "En attente client", "Historique"] as const;

function WhatsAppPage() {
  const { data } = useBO();
  const [onglet, setOnglet] = useState<(typeof ONGLETS)[number]>("Conversations");

  const stats = useMemo(() => {
    const actives = data.conversations.filter((c) => !c.archive);
    return {
      total: actives.length,
      agent: actives.filter((c) => c.statut === "Agent WhatsApp").length,
      humain: actives.filter((c) => c.statut === "Intervention humaine").length,
      attente: actives.filter((c) => c.statut === "En attente client").length,
      completes: actives.filter((c) => c.statut === "Informations complètes").length,
      cloturees: actives.filter((c) => c.statut === "Clôturée").length,
      messagesAgent: actives.reduce(
        (s, c) => s + c.messages.filter((m) => m.auteur === "Agent IA").length,
        0,
      ),
      handoffs: actives.reduce((s, c) => s + c.handoffs.length, 0),
    };
  }, [data.conversations]);

  return (
    <div className="space-y-4">
      <PageHeader
        titre="WhatsApp"
        sous="Conversations clients, agent IA et interventions humaines."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Conversations" valeur={stats.total} />
        <StatCard label="Agent WhatsApp" valeur={stats.agent} />
        <StatCard label="Intervention humaine" valeur={stats.humain} ton={stats.humain > 0 ? "alerte" : "neutre"} />
        <StatCard label="En attente client" valeur={stats.attente} ton={stats.attente > 0 ? "alerte" : "neutre"} />
        <StatCard label="Informations complètes" valeur={stats.completes} ton="positif" />
        <StatCard label="Clôturées" valeur={stats.cloturees} />
      </div>

      <Onglets items={ONGLETS} actif={onglet} onChange={(v) => setOnglet(v as (typeof ONGLETS)[number])} />

      {onglet === "Conversations" && <Inbox />}
      {onglet === "Intervention humaine" && (
        <Inbox statutFixe="Intervention humaine" titreVide="Aucune conversation nécessitant une intervention humaine." />
      )}
      {onglet === "En attente client" && (
        <Inbox statutFixe="En attente client" titreVide="Aucune conversation en attente d'une réponse client." />
      )}
      {onglet === "Historique" && (
        <Inbox statutFixe="Clôturée" titreVide="Aucune conversation clôturée pour le moment." />
      )}

      {onglet === "Agent WhatsApp" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel
            titre="Configuration de l'agent"
            actions={
              <Button asChild size="sm" variant="outline">
                <Link to="/backoffice/parametres">Modifier dans Paramètres</Link>
              </Button>
            }
          >
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Numéro WhatsApp</dt>
                <dd className="mt-0.5">{data.whatsapp.numero}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Statut de l'agent</dt>
                <dd className="mt-0.5">{data.whatsapp.agentActif ? "Actif" : "Désactivé"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Message de bienvenue</dt>
                <dd className="mt-0.5">{data.whatsapp.messageBienvenue}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Tonalité</dt>
                <dd className="mt-0.5">{data.whatsapp.tonalite}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Règle de reprise humaine</dt>
                <dd className="mt-0.5">{data.whatsapp.handoffHumain}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Horaires</dt>
                <dd className="mt-0.5">{data.whatsapp.horaires}</dd>
              </div>
            </dl>
          </Panel>

          <Panel titre="Activité de l'agent">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Messages envoyés par l'agent IA</span>
                <span className="font-semibold text-navy">{stats.messagesAgent}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Reprises par un opérateur humain</span>
                <span className="font-semibold text-navy">{stats.handoffs}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Conversations gérées entièrement par l'agent</span>
                <span className="font-semibold text-navy">{stats.agent}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Conversations en attente d'informations client</span>
                <span className="font-semibold text-navy">{stats.attente}</span>
              </li>
            </ul>
          </Panel>
        </div>
      )}
    </div>
  );
}
