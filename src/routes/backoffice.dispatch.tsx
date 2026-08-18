import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useOps, useOpsLookups } from "@/lib/bo/ops-store";
import {
  PageHeader,
  StatCard,
  Panel,
  DataTable,
  Statut,
  FilterBar,
  SearchInput,
  SelectFilter,
  tonStatut,
  useDialog,
  FormDialog,
  Detail,
  Grille,
  type Colonne,
} from "@/components/bo/kit";
import { Button } from "@/components/ui/button";
import {
  STATUTS_DISPATCH,
  tonStatutDispatch,
  MODES_COMMUNICATION,
  type CourseOps,
  type StatutDispatch,
} from "@/lib/bo/ops-data";

export const Route = createFileRoute("/backoffice/dispatch")({
  head: () => ({
    meta: [
      { title: "Dispatch Coursiers — Back-Office ORCONDIS" },
      { name: "description", content: "Automatisation de la communication des missions aux coursiers." },
    ],
  }),
  component: DispatchPage,
});

function DispatchPage() {
  const { data, envoyerCommunication, repondreCommunication } = useOps();
  const ol = useOpsLookups();

  const [recherche, setRecherche] = useState("");
  const [statut, setStatut] = useState("");
  const [mode, setMode] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const detailDialog = useDialog<CourseOps>();

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const coursesToday = data.courses.filter((c) => c.dateCourse === today);
    return {
      aEnvoyer: data.courses.filter((c) => c.dispatch.statut === "À programmer" || c.dispatch.statut === "Programmée").length,
      programmés: data.courses.filter((c) => c.dispatch.statut === "Programmée").length,
      envoyées: data.courses.filter((c) => c.dispatch.statut === "Envoyée").length,
      enAttente: data.courses.filter((c) => c.dispatch.statut === "Envoyée" && !c.dispatch.confirmationRecue).length,
      acceptées: data.courses.filter((c) => c.dispatch.statut === "Confirmée").length,
      refusées: data.courses.filter((c) => c.dispatch.statut === "Refusée").length,
      echecs: data.courses.filter((c) => c.dispatch.statut === "Échec d'envoi").length,
      intervention: data.courses.filter((c) => c.dispatch.statut === "Intervention opérateur requise").length,
    };
  }, [data.courses]);

  const planning = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    return data.courses
      .filter((c) => {
        if (statut && c.dispatch.statut !== statut) return false;
        if (mode && c.dispatch.mode !== mode) return false;
        if (confirmation === "Oui" && !c.dispatch.confirmationRecue) return false;
        if (confirmation === "Non" && c.dispatch.confirmationRecue) return false;
        if (terme) {
          const cli = ol.clientNom(c.clientId).toLowerCase();
          const crr = ol.coursierNom(c.coursierId).toLowerCase();
          return c.numero.toLowerCase().includes(terme) || cli.includes(terme) || crr.includes(terme);
        }
        return true;
      })
      .sort((a, b) => b.dispatch.dateEnvoi.localeCompare(a.dispatch.dateEnvoi) || b.dispatch.heureEnvoi.localeCompare(a.dispatch.heureEnvoi));
  }, [data.courses, recherche, statut, mode, confirmation, ol]);

  const colonnes: Colonne<CourseOps>[] = [
    { cle: "heure", titre: "Heure d'envoi", rendu: (c) => <span className="text-xs">{c.dispatch.dateEnvoi} {c.dispatch.heureEnvoi}</span> },
    { cle: "numero", titre: "N° Course", rendu: (c) => <span className="font-bold text-navy">{c.numero}</span> },
    { cle: "client", titre: "Client", rendu: (c) => ol.clientNom(c.clientId) },
    { cle: "coursier", titre: "Coursier", rendu: (c) => ol.coursierNom(c.coursierId) },
    { cle: "mode", titre: "Mode", rendu: (c) => <span className="text-xs">{c.dispatch.mode}</span> },
    { cle: "statut", titre: "Statut", rendu: (c) => <Statut ton={tonStatutDispatch(c.dispatch.statut)}>{c.dispatch.statut}</Statut> },
    {
      cle: "conf",
      titre: "Confirmation",
      rendu: (c) => (
        <Statut ton={c.dispatch.confirmationMission ? "positif" : c.dispatch.confirmationRecue ? "alerte" : "neutre"}>
          {c.dispatch.confirmationMission ? "Acceptée" : c.dispatch.confirmationRecue ? "Réponse reçue" : "En attente"}
        </Statut>
      ),
    },
    {
      cle: "actions",
      titre: "Actions",
      align: "right",
      rendu: (c) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" onClick={() => detailDialog.ouvrir(c)}>Détails</Button>
          <Button size="sm" variant="outline" onClick={() => envoyerCommunication(c.id)}>Relancer</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        titre="Agent Dispatch Coursiers"
        sous="Automatisation et suivi des missions communiquées aux coursiers."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Missions à envoyer" valeur={stats.aEnvoyer} />
        <StatCard label="En attente confirmation" valeur={stats.enAttente} ton="alerte" />
        <StatCard label="Acceptées" valeur={stats.acceptées} ton="positif" />
        <StatCard label="Refusées / Interventions" valeur={stats.refusées + stats.intervention} ton="critique" />
      </div>

      <Panel titre="Planning des communications coursiers">
        <FilterBar>
          <SearchInput value={recherche} onChange={setRecherche} placeholder="Course, client, coursier..." />
          <SelectFilter label="Statut" value={statut} onChange={setStatut} options={STATUTS_DISPATCH} />
          <SelectFilter label="Mode" value={mode} onChange={setMode} options={MODES_COMMUNICATION} />
          <SelectFilter label="Confirmé" value={confirmation} onChange={setConfirmation} options={["Oui", "Non"]} />
        </FilterBar>

        <div className="mt-4">
          <DataTable colonnes={colonnes} lignes={planning} onRowClick={detailDialog.ouvrir} vide="Aucune communication programmée." />
        </div>
      </Panel>

      <FormDialog
        open={detailDialog.open}
        onOpenChange={detailDialog.setOpen}
        titre={`Dispatch — ${detailDialog.item?.numero ?? ""}`}
        large
      >
        {detailDialog.item && (
          <div className="space-y-4">
             <Grille cols={3}>
                <Detail label="Coursier">{ol.coursierNom(detailDialog.item.coursierId)}</Detail>
                <Detail label="Mode">{detailDialog.item.dispatch.mode}</Detail>
                <Detail label="Statut Dispatch"><Statut ton={tonStatutDispatch(detailDialog.item.dispatch.statut)}>{detailDialog.item.dispatch.statut}</Statut></Detail>
                <Detail label="Course prévue le">{detailDialog.item.dateCourse} à {detailDialog.item.trancheHoraire}</Detail>
                <Detail label="Envoi réel le">{detailDialog.item.dispatch.dateEnvoi} {detailDialog.item.dispatch.heureEnvoi}</Detail>
                <Detail label="Relances">{detailDialog.item.dispatch.nbRelances}</Detail>
             </Grille>

             <Panel titre="Message généré">
                <div className="rounded-md bg-surface p-3 font-mono text-xs whitespace-pre-wrap">
                  {`ORCONDIS — Nouvelle mission\n\nCourse : ${detailDialog.item.numero}\nClient : ${ol.clientNom(detailDialog.item.clientId)}\nDate : ${detailDialog.item.dateCourse}\nRetrait : ${detailDialog.item.retrait.zone}\nDestination : ${detailDialog.item.destinations[0]?.zone || "—"}\nType : ${detailDialog.item.priorite}\nTransport : ${detailDialog.item.transport}\n\nInstruction :\nRécupérer les documents auprès du correspondant et effectuer la mission selon les instructions de la fiche Course.`}
                </div>
             </Panel>

             <Panel titre="Historique des échanges">
                <ul className="space-y-2">
                  {detailDialog.item.dispatch.historique.map((h) => (
                    <li key={h.id} className="rounded-md border border-border px-3 py-2 text-sm">
                      <p className="font-medium text-navy">{h.action} <span className="text-[10px] text-muted-foreground">{h.format}</span></p>
                      <p className="text-xs text-muted-foreground">{h.date} · {h.details}</p>
                    </li>
                  ))}
                </ul>
             </Panel>

             <div className="flex gap-2">
                <Button onClick={() => detailDialog.item && envoyerCommunication(detailDialog.item.id)}>Renvoyer / Relancer</Button>
                <Button variant="outline" onClick={() => detailDialog.item && repondreCommunication(detailDialog.item.id, "Accepté")}>Simuler Acceptation</Button>
                <Button variant="outline" onClick={() => detailDialog.item && repondreCommunication(detailDialog.item.id, "Refusé", "Indisponible")}>Simuler Refus</Button>
             </div>
          </div>
        )}
      </FormDialog>
    </div>
  );
}
