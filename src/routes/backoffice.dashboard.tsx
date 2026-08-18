import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader, Panel, StatCard, Statut, tonStatut, Detail } from "@/components/bo/kit";
import { Button } from "@/components/ui/button";
import { useBO, useLookups } from "@/lib/bo-store";
import { useOps, useOpsLookups } from "@/lib/bo/ops-store";
import { calculerCourse, dh, fr, tarifApplicable, totalFacture } from "@/lib/bo-data";
import { tonStatutDispatch } from "@/lib/bo/ops-data";



export const Route = createFileRoute("/backoffice/dashboard")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — Back-Office ORCONDIS" },
      { name: "description", content: "Indicateurs opérationnels et financiers ORCONDIS en temps réel." },
      { property: "og:title", content: "Tableau de bord ORCONDIS" },
      { property: "og:description", content: "Indicateurs opérationnels et financiers ORCONDIS." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data } = useBO();
  const { data: opsData } = useOps();
  const l = useLookups();
  const ol = useOpsLookups();


  const stats = useMemo(() => {
    const mois = new Date().toISOString().slice(0, 7);
    const courses = data.courses.filter((c) => !c.archive);
    const aFacturer = courses.filter((c) => ["Validée client", "À facturer", "Terminée"].includes(c.statut));
    const montantAFacturer = aFacturer.reduce(
      (s, c) => s + calculerCourse(c, tarifApplicable(data.tarifs, c)).total,
      0,
    );
    const factures = data.factures.filter((f) => !f.archive);
    const impayees = factures.filter((f) =>
      ["Émise", "Envoyée", "Partiellement payée", "En retard"].includes(f.statut),
    );
    const resteImpaye = impayees.reduce((s, f) => s + totalFacture(f).reste, 0);
    const caMois = factures
      .filter((f) => f.dateEmission.startsWith(mois))
      .reduce((s, f) => s + totalFacture(f).total, 0);
    const paiementsAEffectuer = data.paiements.filter(
      (p) => !p.archive && ["À payer", "Affecté au coursier", "Chèque reçu", "En cours"].includes(p.statut),
    );
    return {
      courses,
      urgentes: courses.filter((c) => c.priorite === "Urgente" && c.statut !== "Terminée").length,
      nonAffectees: courses.filter((c) => c.statut === "À affecter").length,
      bloquees: courses.filter((c) => c.statut === "Bloquée").length,
      aFacturer,
      montantAFacturer,
      impayees,
      resteImpaye,
      caMois,
      paiementsAEffectuer,
      dispatch: {
        totalToday: opsData.courses.filter(c => c.dateCourse === new Date().toISOString().slice(0, 10)).length,
        envoyes: opsData.courses.filter(c => c.dispatch.statut === "Envoyé").length,
        enAttente: opsData.courses.filter(c => c.dispatch.statut === "Programmé" || c.dispatch.statut === "En attente").length,
        acceptes: opsData.courses.filter(c => c.dispatch.statut === "Accepté").length,
        refuses: opsData.courses.filter(c => c.dispatch.statut === "Refusé").length,
        echecs: opsData.courses.filter(c => c.dispatch.statut === "Échec d'envoi").length,
      }
    };
  }, [data, opsData]);


  const alertesWA = data.conversations.filter(
    (c) => c.statut === "Intervention humaine" || c.statut === "En attente client",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        titre="Tableau de bord"
        sous="Vue consolidée des opérations, de la facturation et des paiements."
        actions={
          <Button asChild size="sm">
            <Link to="/backoffice/whatsapp">Ouvrir la messagerie WhatsApp</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Courses actives" valeur={stats.courses.length} detail={`${stats.nonAffectees} à affecter`} />
        <StatCard label="Courses urgentes" valeur={stats.urgentes} ton="alerte" detail={`${stats.bloquees} bloquée(s)`} />
        <StatCard
          label="Paiements à effectuer"
          valeur={stats.paiementsAEffectuer.length}
          ton="alerte"
          detail={dh(stats.paiementsAEffectuer.reduce((s, p) => s + p.montant, 0))}
        />
        <StatCard label="Courses à facturer" valeur={stats.aFacturer.length} detail={dh(stats.montantAFacturer)} />
        <StatCard label="Factures impayées" valeur={stats.impayees.length} ton="critique" detail={dh(stats.resteImpaye)} />
        <StatCard label="CA du mois" valeur={dh(stats.caMois)} ton="positif" />
        <StatCard label="Conversations WhatsApp" valeur={data.conversations.length} detail={`${alertesWA.length} à traiter`} />
        <StatCard label="Clients actifs" valeur={data.clients.filter((c) => c.actif && !c.archive).length} />
        <StatCard
          label="Dispatch Coursiers"
          valeur={stats.dispatch.totalToday}
          detail={`${stats.dispatch.envoyes} envoyés · ${stats.dispatch.acceptes} acceptés`}
          ton={stats.dispatch.refuses > 0 ? "alerte" : "neutre"}
        />
      </div>


      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          titre="Facturation"
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/backoffice/facturation" search={{ tab: "Courses à facturer" }}>Ouvrir</Link>
            </Button>
          }
        >
          <ul className="space-y-2 text-sm">
            {stats.aFacturer.slice(0, 5).map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 border-b border-border pb-2 last:border-0">
                <span>
                  <span className="font-medium text-navy">{c.numero}</span>{" "}
                  <span className="text-muted-foreground">· {l.clientNom(c.clientId)}</span>
                </span>
                <span className="font-medium">{dh(calculerCourse(c, tarifApplicable(data.tarifs, c)).total)}</span>
              </li>
            ))}
            {stats.aFacturer.length === 0 && <li className="text-muted-foreground">Aucune course à facturer.</li>}
          </ul>
        </Panel>

        <Panel
          titre="Paiements fournisseurs"
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/backoffice/fournisseurs">Ouvrir</Link>
            </Button>
          }
        >
          <ul className="space-y-2 text-sm">
            {stats.paiementsAEffectuer.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 border-b border-border pb-2 last:border-0">
                <span>
                  <span className="font-medium text-navy">{p.numero}</span>{" "}
                  <span className="text-muted-foreground">· {l.fournisseurNom(p.fournisseurId)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Statut ton={tonStatut(p.statut)}>{p.statut}</Statut>
                  <span className="font-medium">{dh(p.montant, p.devise)}</span>
                </span>
              </li>
            ))}
            {stats.paiementsAEffectuer.length === 0 && <li className="text-muted-foreground">Aucun paiement en attente.</li>}
          </ul>
        </Panel>

        <Panel
          titre="Dernières factures"
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/backoffice/facturation" search={{ tab: "Factures" }}>Voir tout</Link>
            </Button>
          }
        >
          <ul className="space-y-2 text-sm">
            {data.factures.slice(0, 5).map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-2 border-b border-border pb-2 last:border-0">
                <span>
                  <span className="font-medium text-navy">{f.numero}</span>{" "}
                  <span className="text-muted-foreground">· {l.clientNom(f.clientId)} · {fr(f.dateEmission)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Statut ton={tonStatut(f.statut)}>{f.statut}</Statut>
                  <span className="font-medium">{dh(totalFacture(f).total)}</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          titre="Alertes WhatsApp"
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/backoffice/whatsapp">Ouvrir</Link>
            </Button>
          }
        >
          <ul className="space-y-2 text-sm">
            {alertesWA.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 border-b border-border pb-2 last:border-0">
                <span>
                  <span className="font-medium text-navy">{c.clientNom}</span>{" "}
                  <span className="text-muted-foreground">· {c.manquantes.length} info(s) manquante(s)</span>
                </span>
                <Statut ton={tonStatut(c.statut)}>{c.statut}</Statut>
              </li>
            ))}
            {alertesWA.length === 0 && <li className="text-muted-foreground">Aucune alerte.</li>}
          </ul>
        </Panel>

        <Panel titre="Derniers paiements enregistrés" className="lg:col-span-1">
          <ul className="space-y-2 text-sm">
            {data.paiements.slice(0, 6).map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2 last:border-0">
                <span>
                  <span className="font-medium text-navy">{p.numero}</span>{" "}
                  <span className="text-muted-foreground">
                    · {l.clientNom(p.clientId)} → {l.fournisseurNom(p.fournisseurId)} · {p.moyen}
                    {p.numeroCheque ? ` n° ${p.numeroCheque}` : ""}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <Statut ton={tonStatut(p.statut)}>{p.statut}</Statut>
                  <span className="font-medium">{dh(p.montant, p.devise)}</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel titre="Prochains envois programmés" className="lg:col-span-1">
          <ul className="space-y-2 text-sm">
            {opsData.courses
              .filter(c => c.dispatch.statut === "Programmé")
              .slice(0, 5)
              .map(c => (
                <li key={c.id} className="flex items-center justify-between gap-2 border-b border-border pb-2 last:border-0">
                  <div className="flex flex-col">
                    <span className="font-medium text-navy">{c.numero} — {ol.coursierNom(c.coursierId)}</span>
                    <span className="text-[10px] text-muted-foreground">
                      Envoi prévu : {c.dispatch.dateEnvoi} {c.dispatch.heureEnvoi} · {c.dispatch.mode}
                    </span>
                  </div>
                  <Statut ton={tonStatutDispatch(c.dispatch.statut)}>{c.dispatch.statut}</Statut>
                </li>

              ))}
            {opsData.courses.filter(c => c.dispatch.statut === "Programmé").length === 0 && (
              <li className="text-muted-foreground">Aucun envoi programmé.</li>
            )}
          </ul>
        </Panel>
      </div>

    </div>
  );
}
