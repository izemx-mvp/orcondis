import { useMemo, useState } from "react";
import { useBO, useLookups } from "@/lib/bo-store";
import {
  calculerCourse,
  tarifApplicable,
  dh,
  fr,
  uid,
  today,
  daysAgo,
  daysAhead,
  FREQUENCES,
  type Facture,
  type LigneFacture,
  type Course,
} from "@/lib/bo-data";
import { Panel, Grille, ChampSelect, Champ, DataTable, Statut, tonStatut, type Colonne } from "@/components/bo/kit";
import { Button } from "@/components/ui/button";
import { coursesEligibles } from "./shared";

export function FacturationPeriodique() {
  const { data, add, patch, log } = useBO();
  const lk = useLookups();
  const [clientId, setClientId] = useState(data.clients[0]?.id ?? "");
  const [dateDebut, setDateDebut] = useState(daysAgo(15));
  const [dateFin, setDateFin] = useState(today());
  const [periode, setPeriode] = useState<string>(FREQUENCES[0]);
  const [exclues, setExclues] = useState<Set<string>>(new Set());
  const [surcharges, setSurcharges] = useState<Record<string, number>>({});

  const eligibles = useMemo(() => coursesEligibles(data.courses, data.factures), [data.courses, data.factures]);

  const lignesPotentielles = useMemo(() => {
    return eligibles.filter((c) => c.clientId === clientId && c.date >= dateDebut && c.date <= dateFin);
  }, [eligibles, clientId, dateDebut, dateFin]);

  const colonnes: Colonne<Course>[] = [
    { cle: "numero", titre: "Course", rendu: (c) => c.numero },
    { cle: "date", titre: "Date", rendu: (c) => fr(c.date) },
    { cle: "type", titre: "Type", rendu: (c) => c.typeCourse },
    { cle: "km", titre: "Km", rendu: (c) => c.kmMission, align: "right" },
    { cle: "kmVide", titre: "Km à vide", rendu: (c) => c.kmVide, align: "right" },
    { cle: "attente", titre: "Attente", rendu: (c) => `${c.attenteMinutes} min`, align: "right" },
    {
      cle: "supplements",
      titre: "Suppléments",
      rendu: (c) => (c.priorite === "Urgente" || c.nuit || c.weekend ? [c.priorite === "Urgente" && "Urgence", c.nuit && "Nuit", c.weekend && "Week-end"].filter(Boolean).join(", ") : "—"),
    },
    {
      cle: "montant",
      titre: "Montant",
      rendu: (c) => {
        const t = tarifApplicable(data.tarifs, c);
        const calc = calculerCourse(c, t);
        const m = surcharges[c.id] ?? calc.total;
        return <span className="font-semibold text-navy">{dh(m)}</span>;
      },
      align: "right",
    },
    {
      cle: "statut",
      titre: "Statut",
      rendu: (c) => (exclues.has(c.id) ? <Statut ton={tonStatut("annulée")}>Exclue</Statut> : <Statut ton={tonStatut("validée")}>Incluse</Statut>),
    },
    {
      cle: "actions",
      titre: "Actions",
      rendu: (c) => (
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setExclues((s) => {
                const next = new Set(s);
                if (next.has(c.id)) next.delete(c.id);
                else next.add(c.id);
                return next;
              })
            }
          >
            {exclues.has(c.id) ? "Inclure" : "Exclure"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const t = tarifApplicable(data.tarifs, c);
              const calc = calculerCourse(c, t);
              const saisie = window.prompt("Montant ajusté pour cette course (MAD)", String(surcharges[c.id] ?? calc.total));
              if (saisie !== null && !Number.isNaN(Number(saisie))) {
                setSurcharges((s) => ({ ...s, [c.id]: Number(saisie) }));
              }
            }}
          >
            Modifier
          </Button>
        </div>
      ),
      align: "right",
    },
  ];

  const incluses = lignesPotentielles.filter((c) => !exclues.has(c.id));
  const totalPrevu = incluses.reduce((s, c) => {
    const t = tarifApplicable(data.tarifs, c);
    const calc = calculerCourse(c, t);
    return s + (surcharges[c.id] ?? calc.total);
  }, 0);

  const genererFacture = () => {
    if (!clientId || incluses.length === 0) return;
    const annee = new Date().getFullYear();
    const nums = data.factures
      .map((f) => f.numero.match(/FAC-(\d{4})-(\d+)/))
      .filter((m): m is RegExpMatchArray => !!m && Number(m[1]) === annee)
      .map((m) => Number(m[2]));
    const numero = `FAC-${annee}-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, "0")}`;
    const dossiers = Array.from(new Set(incluses.map((c) => c.dossierId).filter(Boolean)));
    const lignes: LigneFacture[] = incluses.map((c) => {
      const t = tarifApplicable(data.tarifs, c);
      const calc = calculerCourse(c, t);
      return { id: uid("lig"), courseId: c.id, libelle: `${c.numero} — ${c.service} (${fr(c.date)})`, montant: surcharges[c.id] ?? calc.total };
    });
    const facture: Facture = {
      id: uid("fac"),
      numero,
      clientId,
      periode: `${periode} — ${fr(dateDebut)} → ${fr(dateFin)}`,
      dateDebut,
      dateFin,
      dossiers,
      lignes,
      frais: 0,
      remises: 0,
      tauxTaxe: 20,
      dateEmission: "",
      dateEcheance: daysAhead(30),
      statut: "Brouillon",
      reglements: [],
      notes: "Générée via facturation périodique.",
      archive: false,
    };
    add("factures", facture);
    incluses.forEach((c) => patch("courses", c.id, { statut: "Facturée", factureId: facture.id }));
    log({ entite: "Facture", entiteId: numero, utilisateur: "Back-Office", action: "Génération de facture périodique", ancienneValeur: "", nouvelleValeur: `${incluses.length} course(s)` });
    setExclues(new Set());
    setSurcharges({});
  };

  return (
    <div className="space-y-4">
      <Panel titre="Sélection de la période">
        <Grille cols={3}>
          <ChampSelect label="Client" value={clientId} onChange={setClientId} options={data.clients.map((c) => ({ value: c.id, label: c.raisonSociale }))} />
          <Champ label="Date début" type="date" value={dateDebut} onChange={setDateDebut} />
          <Champ label="Date fin" type="date" value={dateFin} onChange={setDateFin} />
          <ChampSelect label="Période / fréquence" value={periode} onChange={setPeriode} options={FREQUENCES} />
        </Grille>
      </Panel>

      <Panel
        titre={`Courses éligibles non facturées (${lignesPotentielles.length})`}
        actions={
          <Button onClick={genererFacture} disabled={incluses.length === 0}>
            Générer facture ({dh(totalPrevu)})
          </Button>
        }
      >
        <DataTable colonnes={colonnes} lignes={lignesPotentielles} vide="Aucune course éligible pour ce client sur cette période." />
      </Panel>
    </div>
  );
}
