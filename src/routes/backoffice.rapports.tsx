import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Champ,
  DataTable,
  Colonne,
  FilterBar,
  Onglets,
  PageHeader,
  Panel,
  SelectFilter,
  StatCard,
  Statut,
} from "@/components/bo/kit";
import { Button } from "@/components/ui/button";
import { useBO, useLookups } from "@/lib/bo-store";
import { useOps, useOpsLookups } from "@/lib/bo/ops-store";
import {
  STATUTS_COURSE,
  calculerCourse,
  dh,
  fr,
  tarifApplicable,
  totalFacture,
  type Course,
} from "@/lib/bo-data";
import { tonStatutDispatch } from "@/lib/bo/ops-data";

export const Route = createFileRoute("/backoffice/rapports")({
  head: () => ({
    meta: [
      { title: "Rapports — Back-Office ORCONDIS" },
      { name: "description", content: "Rapports d'activité, clients, coursiers, financiers et opérationnels." },
      { property: "og:title", content: "Rapports ORCONDIS" },
      { property: "og:description", content: "Indicateurs consolidés ORCONDIS." },
    ],
  }),
  component: Rapports,
});

const ONGLETS = ["Activité", "Clients", "Coursiers", "Dispatch", "Financier", "Opérations"] as const;

function exporterCsv(nom: string, colonnes: string[], lignes: (string | number)[][]) {
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [colonnes.map(escape).join(";"), ...lignes.map((l) => l.map(escape).join(";"))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nom}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function BoutonExport({ nom, colonnes, lignes }: { nom: string; colonnes: string[]; lignes: (string | number)[][] }) {
  return (
    <Button size="sm" variant="outline" onClick={() => exporterCsv(nom, colonnes, lignes)}>
      Exporter CSV
    </Button>
  );
}

function Barre({ label, valeur, max }: { label: string; valeur: number; max: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>{label}</span>
        <span className="text-muted-foreground">{valeur}</span>
      </div>
      <div className="h-2 rounded-full bg-surface">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${max > 0 ? (valeur / max) * 100 : 0}%` }} />
      </div>
    </div>
  );
}

function Rapports() {
  const { data } = useBO();
  const { data: opsData } = useOps();
  const l = useLookups();
  const ol = useOpsLookups();
  const [onglet, setOnglet] = useState<(typeof ONGLETS)[number]>("Activité");

  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [clientId, setClientId] = useState("");
  const [coursierId, setCoursierId] = useState("");
  const [service, setService] = useState("");
  const [zone, setZone] = useState("");
  const [statut, setStatut] = useState("");
  const [transport, setTransport] = useState("");
  const [facturation, setFacturation] = useState("");

  const coursesFiltrees = useMemo(() => {
    return data.courses.filter((c) => {
      if (dateDebut && c.date < dateDebut) return false;
      if (dateFin && c.date > dateFin) return false;
      if (clientId && c.clientId !== clientId) return false;
      if (coursierId && c.coursierId !== coursierId) return false;
      if (service && c.service !== service) return false;
      if (zone && c.retrait.zone !== zone) return false;
      if (statut && c.statut !== statut) return false;
      if (transport && c.transport !== transport) return false;
      if (facturation === "Facturées" && !c.factureId) return false;
      if (facturation === "Non facturées" && c.factureId) return false;
      return true;
    });
  }, [data.courses, dateDebut, dateFin, clientId, coursierId, service, zone, statut, transport, facturation]);

  const dossiersFiltres = useMemo(() => {
    return data.dossiers.filter((d) => {
      if (clientId && d.clientId !== clientId) return false;
      if (service && d.service !== service) return false;
      if (dateDebut && d.dateOuverture < dateDebut) return false;
      if (dateFin && d.dateOuverture > dateFin) return false;
      return true;
    });
  }, [data.dossiers, clientId, service, dateDebut, dateFin]);

  const facturesFiltrees = useMemo(() => {
    return data.factures.filter((f) => {
      if (clientId && f.clientId !== clientId) return false;
      if (dateDebut && f.dateEmission && f.dateEmission < dateDebut) return false;
      if (dateFin && f.dateEmission && f.dateEmission > dateFin) return false;
      return true;
    });
  }, [data.factures, clientId, dateDebut, dateFin]);

  const services = useMemo(() => [...new Set(data.services.map((s) => s.nom))], [data.services]);
  const zones = useMemo(() => [...new Set(data.zones.map((z) => z.nom))], [data.zones]);
  const transports = useMemo(() => [...new Set(data.transports.map((t) => t.nom))], [data.transports]);

  return (
    <div className="space-y-6">
      <PageHeader titre="Rapports" sous="Analyses d'activité, financières et opérationnelles à partir des données du back-office." />

      <Panel titre="Filtres globaux">
        <FilterBar>
          <Champ label="Date début" type="date" value={dateDebut} onChange={setDateDebut} />
          <Champ label="Date fin" type="date" value={dateFin} onChange={setDateFin} />
          <SelectFilter value={clientId} onChange={setClientId} options={data.clients.map((c) => c.id)} label="Client" />
          <SelectFilter value={coursierId} onChange={setCoursierId} options={data.coursiers.map((c) => c.id)} label="Coursier" />
          <SelectFilter value={service} onChange={setService} options={services} label="Service" />
          <SelectFilter value={zone} onChange={setZone} options={zones} label="Zone" />
          <SelectFilter value={statut} onChange={setStatut} options={STATUTS_COURSE} label="Statut" />
          <SelectFilter value={transport} onChange={setTransport} options={transports} label="Transport" />
          <SelectFilter value={facturation} onChange={setFacturation} options={["Facturées", "Non facturées"]} label="Facturation" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDateDebut(""); setDateFin(""); setClientId(""); setCoursierId(""); setService("");
              setZone(""); setStatut(""); setTransport(""); setFacturation("");
            }}
          >
            Réinitialiser
          </Button>
        </FilterBar>
      </Panel>

      <Onglets items={ONGLETS} actif={onglet} onChange={(v) => setOnglet(v as (typeof ONGLETS)[number])} />

      {onglet === "Activité" && <RapportActivite courses={coursesFiltrees} dossiers={dossiersFiltres} />}
      {onglet === "Clients" && <RapportClients courses={coursesFiltrees} dossiers={dossiersFiltres} factures={facturesFiltrees} />}
      {onglet === "Coursiers" && <RapportCoursiers courses={coursesFiltrees} />}
      {onglet === "Financier" && <RapportFinancier courses={coursesFiltrees} factures={facturesFiltrees} />}
      {onglet === "Opérations" && <RapportOperations courses={coursesFiltrees} />}
    </div>
  );

  function RapportActivite({ courses, dossiers }: { courses: Course[]; dossiers: typeof data.dossiers }) {
    const demandes = new Set(courses.map((c) => c.demandeNumero).filter(Boolean)).size;
    const terminees = courses.filter((c) => ["Terminée", "Validée client", "À facturer", "Facturée"].includes(c.statut)).length;
    const annulees = courses.filter((c) => c.statut === "Annulée").length;
    const urgentes = courses.filter((c) => c.priorite === "Urgente").length;
    const dossiersTermines = dossiers.filter((d) => d.statut === "Clôturé").length;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Demandes" valeur={demandes} />
          <StatCard label="Courses" valeur={courses.length} />
          <StatCard label="Courses terminées" valeur={terminees} ton="positif" />
          <StatCard label="Courses annulées" valeur={annulees} ton="critique" />
          <StatCard label="Courses urgentes" valeur={urgentes} ton="alerte" />
          <StatCard label="Dossiers créés" valeur={dossiers.length} />
          <StatCard label="Dossiers terminés" valeur={dossiersTermines} ton="positif" />
        </div>
        <Panel
          titre="Détail des courses"
          actions={
            <BoutonExport
              nom="rapport-activite"
              colonnes={["Numéro", "Client", "Service", "Statut", "Priorité", "Date"]}
              lignes={courses.map((c) => [c.numero, l.clientNom(c.clientId), c.service, c.statut, c.priorite, fr(c.date)])}
            />
          }
        >
          <DataTable
            colonnes={[
              { cle: "numero", titre: "Numéro", rendu: (c: Course) => c.numero },
              { cle: "client", titre: "Client", rendu: (c: Course) => l.clientNom(c.clientId) },
              { cle: "service", titre: "Service", rendu: (c: Course) => c.service },
              { cle: "statut", titre: "Statut", rendu: (c: Course) => c.statut },
              { cle: "priorite", titre: "Priorité", rendu: (c: Course) => c.priorite },
              { cle: "date", titre: "Date", rendu: (c: Course) => fr(c.date) },
            ]}
            lignes={courses}
          />
        </Panel>
      </div>
    );
  }

  function RapportClients({ courses, dossiers, factures }: { courses: Course[]; dossiers: typeof data.dossiers; factures: typeof data.factures }) {
    const lignes = data.clients
      .filter((c) => !clientId || c.id === clientId)
      .map((cli) => {
        const cCourses = courses.filter((c) => c.clientId === cli.id);
        const cDossiers = dossiers.filter((d) => d.clientId === cli.id);
        const cFactures = factures.filter((f) => f.clientId === cli.id);
        const ca = cFactures.reduce((s, f) => s + totalFacture(f).total, 0);
        const impaye = cFactures.reduce((s, f) => s + totalFacture(f).reste, 0);
        return { id: cli.id, client: cli, courses: cCourses.length, dossiers: cDossiers.length, factures: cFactures.length, ca, impaye };
      })
      .filter((r) => r.courses + r.dossiers + r.factures > 0 || clientId);

    const maxCourses = Math.max(1, ...lignes.map((r) => r.courses));

    return (
      <div className="space-y-4">
        <Panel titre="Volume de courses par client">
          <div className="space-y-2">
            {lignes.map((r) => (
              <Barre key={r.client.id} label={r.client.raisonSociale} valeur={r.courses} max={maxCourses} />
            ))}
          </div>
        </Panel>
        <Panel
          titre="Détail par client"
          actions={
            <BoutonExport
              nom="rapport-clients"
              colonnes={["Client", "Courses", "Dossiers", "Factures", "CA", "Impayé"]}
              lignes={lignes.map((r) => [r.client.raisonSociale, r.courses, r.dossiers, r.factures, r.ca.toFixed(2), r.impaye.toFixed(2)])}
            />
          }
        >
          <DataTable
            colonnes={[
              { cle: "client", titre: "Client", rendu: (r: (typeof lignes)[number]) => r.client.raisonSociale },
              { cle: "courses", titre: "Courses", rendu: (r: (typeof lignes)[number]) => r.courses, align: "right" },
              { cle: "dossiers", titre: "Dossiers", rendu: (r: (typeof lignes)[number]) => r.dossiers, align: "right" },
              { cle: "factures", titre: "Factures", rendu: (r: (typeof lignes)[number]) => r.factures, align: "right" },
              { cle: "ca", titre: "CA", rendu: (r: (typeof lignes)[number]) => dh(r.ca), align: "right" },
              { cle: "impaye", titre: "Impayé", rendu: (r: (typeof lignes)[number]) => dh(r.impaye), align: "right" },
            ]}
            lignes={lignes}
          />
        </Panel>
      </div>
    );
  }

  function RapportCoursiers({ courses }: { courses: Course[] }) {
    const lignes = data.coursiers
      .filter((c) => !coursierId || c.id === coursierId)
      .map((cou) => {
        const cCourses = courses.filter((c) => c.coursierId === cou.id);
        const terminees = cCourses.filter((c) => ["Terminée", "Validée client", "À facturer", "Facturée"].includes(c.statut)).length;
        const refusees = cCourses.filter((c) => c.statut === "Annulée").length;
        const km = cCourses.reduce((s, c) => s + c.kmMission, 0);
        const kmVide = cCourses.reduce((s, c) => s + c.kmVide, 0);
        const attente = cCourses.reduce((s, c) => s + c.attenteMinutes, 0);
        return { id: cou.id, coursier: cou, courses: cCourses.length, terminees, refusees, km, kmVide, attente };
      });

    const maxKm = Math.max(1, ...lignes.map((r) => r.km));

    return (
      <div className="space-y-4">
        <Panel titre="Kilomètres parcourus par coursier">
          <div className="space-y-2">
            {lignes.map((r) => (
              <Barre key={r.coursier.id} label={r.coursier.nom} valeur={r.km} max={maxKm} />
            ))}
          </div>
        </Panel>
        <Panel
          titre="Détail par coursier"
          actions={
            <BoutonExport
              nom="rapport-coursiers"
              colonnes={["Coursier", "Courses", "Terminées", "Km parcourus", "Km à vide", "Attente (min)", "Refusées"]}
              lignes={lignes.map((r) => [r.coursier.nom, r.courses, r.terminees, r.km, r.kmVide, r.attente, r.refusees])}
            />
          }
        >
          <DataTable
            colonnes={[
              { cle: "coursier", titre: "Coursier", rendu: (r: (typeof lignes)[number]) => r.coursier.nom },
              { cle: "courses", titre: "Courses", rendu: (r: (typeof lignes)[number]) => r.courses, align: "right" },
              { cle: "terminees", titre: "Terminées", rendu: (r: (typeof lignes)[number]) => r.terminees, align: "right" },
              { cle: "km", titre: "Km parcourus", rendu: (r: (typeof lignes)[number]) => r.km, align: "right" },
              { cle: "kmVide", titre: "Km à vide", rendu: (r: (typeof lignes)[number]) => r.kmVide, align: "right" },
              { cle: "attente", titre: "Attente (min)", rendu: (r: (typeof lignes)[number]) => r.attente, align: "right" },
              { cle: "refusees", titre: "Refusées/annulées", rendu: (r: (typeof lignes)[number]) => r.refusees, align: "right" },
            ]}
            lignes={lignes}
          />
        </Panel>
      </div>
    );
  }

  function RapportFinancier({ courses, factures }: { courses: Course[]; factures: typeof data.factures }) {
    const totFacture = factures.reduce((s, f) => s + totalFacture(f).total, 0);
    const totEncaisse = factures.reduce((s, f) => s + totalFacture(f).paye, 0);
    const totImpaye = factures.reduce((s, f) => s + totalFacture(f).reste, 0);
    const paiementsFournisseurs = data.paiements
      .filter((p) => !clientId || p.clientId === clientId)
      .reduce((s, p) => s + p.montant, 0);

    const caParClient = new Map<string, number>();
    for (const f of factures) caParClient.set(f.clientId, (caParClient.get(f.clientId) ?? 0) + totalFacture(f).total);

    const caParService = new Map<string, number>();
    for (const c of courses) {
      const total = calculerCourse(c, tarifApplicable(data.tarifs, c)).total;
      caParService.set(c.service, (caParService.get(c.service) ?? 0) + total);
    }

    const caParPeriode = new Map<string, number>();
    for (const f of factures) {
      const mois = (f.dateEmission || f.dateDebut || "").slice(0, 7) || "—";
      caParPeriode.set(mois, (caParPeriode.get(mois) ?? 0) + totalFacture(f).total);
    }

    const lignesClient = [...caParClient.entries()].map(([id, ca]) => ({ id, nom: l.clientNom(id), ca }));
    const lignesService = [...caParService.entries()].map(([service, ca]) => ({ service, ca }));
    const lignesPeriode = [...caParPeriode.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([periode, ca]) => ({ periode, ca }));
    const maxService = Math.max(1, ...lignesService.map((r) => r.ca));

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total facturé" valeur={dh(totFacture)} />
          <StatCard label="Total encaissé" valeur={dh(totEncaisse)} ton="positif" />
          <StatCard label="Total impayé" valeur={dh(totImpaye)} ton="critique" />
          <StatCard label="Paiements fournisseurs" valeur={dh(paiementsFournisseurs)} />
        </div>

        <Panel titre="CA par service">
          <div className="space-y-2">
            {lignesService.map((r) => (
              <Barre key={r.service} label={r.service} valeur={Math.round(r.ca)} max={Math.round(maxService)} />
            ))}
          </div>
        </Panel>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel
            titre="CA par client"
            actions={<BoutonExport nom="ca-par-client" colonnes={["Client", "CA"]} lignes={lignesClient.map((r) => [r.nom, r.ca.toFixed(2)])} />}
          >
            <DataTable
              colonnes={[
                { cle: "nom", titre: "Client", rendu: (r: (typeof lignesClient)[number]) => r.nom },
                { cle: "ca", titre: "CA", rendu: (r: (typeof lignesClient)[number]) => dh(r.ca), align: "right" },
              ]}
              lignes={lignesClient}
            />
          </Panel>
          <Panel
            titre="CA par période"
            actions={<BoutonExport nom="ca-par-periode" colonnes={["Période", "CA"]} lignes={lignesPeriode.map((r) => [r.periode, r.ca.toFixed(2)])} />}
          >
            <DataTable
              colonnes={[
                { cle: "periode", titre: "Période", rendu: (r: (typeof lignesPeriode)[number]) => r.periode },
                { cle: "ca", titre: "CA", rendu: (r: (typeof lignesPeriode)[number]) => dh(r.ca), align: "right" },
              ]}
              lignes={lignesPeriode.map((r, i) => ({ id: String(i), ...r }))}
            />
          </Panel>
        </div>
      </div>
    );
  }

  function RapportOperations({ courses }: { courses: Course[] }) {
    const bloquees = courses.filter((c) => c.statut === "Bloquée").length;
    const urgentes = courses.filter((c) => c.priorite === "Urgente" && c.statut !== "Terminée").length;
    const conversations = data.conversations.filter((c) => !clientId || c.clientId === clientId);
    const interventions = conversations.filter((c) => c.statut === "Intervention humaine").length;
    const tempsMoyenAttente = courses.length
      ? Math.round(courses.reduce((s, c) => s + c.attenteMinutes, 0) / courses.length)
      : 0;
    const documentsManquants = conversations.reduce((s, c) => s + c.manquantes.length, 0);
    const paiementsEnAttente = data.paiements.filter(
      (p) => (!clientId || p.clientId === clientId) && ["À recevoir", "À payer", "Affecté au coursier", "En cours"].includes(p.statut),
    ).length;
    const reaffectations = courses.filter((c) => c.notes.toLowerCase().includes("réaffect") || c.notes.toLowerCase().includes("relance")).length;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Courses bloquées" valeur={bloquees} ton="critique" />
          <StatCard label="Courses urgentes" valeur={urgentes} ton="alerte" />
          <StatCard label="Réaffectations" valeur={reaffectations} />
          <StatCard label="Interventions humaines WhatsApp" valeur={interventions} ton="alerte" />
          <StatCard label="Temps moyen d'attente" valeur={`${tempsMoyenAttente} min`} />
          <StatCard label="Documents manquants" valeur={documentsManquants} />
          <StatCard label="Paiements en attente" valeur={paiementsEnAttente} />
        </div>
        <Panel
          titre="Courses nécessitant une attention"
          actions={
            <BoutonExport
              nom="rapport-operations"
              colonnes={["Numéro", "Client", "Statut", "Priorité", "Notes"]}
              lignes={courses
                .filter((c) => c.statut === "Bloquée" || c.priorite === "Urgente")
                .map((c) => [c.numero, l.clientNom(c.clientId), c.statut, c.priorite, c.notes])}
            />
          }
        >
          <DataTable
            colonnes={[
              { cle: "numero", titre: "Numéro", rendu: (c: Course) => c.numero },
              { cle: "client", titre: "Client", rendu: (c: Course) => l.clientNom(c.clientId) },
              { cle: "statut", titre: "Statut", rendu: (c: Course) => c.statut },
              { cle: "priorite", titre: "Priorité", rendu: (c: Course) => c.priorite },
              { cle: "notes", titre: "Notes", rendu: (c: Course) => c.notes || "—" },
            ]}
            lignes={courses.filter((c) => c.statut === "Bloquée" || c.priorite === "Urgente")}
          />
        </Panel>
      </div>
    );
  }
}
