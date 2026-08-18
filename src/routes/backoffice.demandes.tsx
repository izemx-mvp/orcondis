import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { useBO } from "@/lib/bo-store";
import { useOps } from "@/lib/bo/ops-store";
import {
  CATEGORIES_CLIENT,
  PRIORITES_COURSE,
  TRANCHES_HORAIRES,
  TYPES_COURSE,
  TYPES_DOSSIER,
  horodatage,
  nomClient,
  oid,
  pointVide,
  prochainCodeClient,
  prochainNumeroCourse,
  prochainNumeroDossier,
  todayIso,
  type ClientOps,
  type CourseOps,
  type DossierOps,
} from "@/lib/bo/ops-data";
import type { Demande, Statut } from "@/lib/orcondis";
import { STATUSES, statutTone } from "@/lib/orcondis";
import { SERVICES } from "@/lib/orcondis";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  StatCard,
  Panel,
  SearchInput,
  SelectFilter,
  FilterBar,
  DataTable,
  Statut as StatutBadge,
  Champ,
  ChampSelect,
  ChampTexte,
  FormDialog,
  Grille,
  Onglets,
  Historique,
  Detail,
  useDialog,
  type Colonne,
} from "@/components/bo/kit";

export const Route = createFileRoute("/backoffice/demandes")({
  head: () => ({
    meta: [
      { title: "Demandes entrantes — Back-Office ORCONDIS" },
      {
        name: "description",
        content: "Suivi des demandes reçues via le site web ORCONDIS et qualification WhatsApp.",
      },
    ],
  }),
  component: DemandesPage,
});

const PERIODES = ["Aujourd'hui", "Cette semaine", "Ce mois"] as const;

function DemandesPage() {
  const { demandes, majDemande, changerStatut, ajouterNote, archiver } = useStore();
  const { data: boData } = useBO();
  const { data: opsData, ajouter } = useOps();

  const [recherche, setRecherche] = useState("");
  const [statutF, setStatutF] = useState("");
  const [serviceF, setServiceF] = useState("");
  const [periodeF, setPeriodeF] = useState("");
  const [voirArchives, setVoirArchives] = useState(false);

  const conversationDe = (numero: string) => boData.conversations.find((c) => c.demandeNumero === numero);

  const dansPeriode = (dateIso: string) => {
    if (!periodeF) return true;
    const d = new Date(dateIso + "T00:00:00");
    const now = new Date();
    if (periodeF === "Aujourd'hui") return dateIso === todayIso();
    if (periodeF === "Cette semaine") {
      const debut = new Date(now);
      debut.setDate(now.getDate() - now.getDay());
      return d >= debut;
    }
    if (periodeF === "Ce mois") return dateIso.slice(0, 7) === todayIso().slice(0, 7);
    return true;
  };

  const liste = useMemo(() => {
    return demandes.filter((d) => {
      if (d.archivee !== voirArchives) return false;
      if (statutF && d.statut !== statutF) return false;
      if (serviceF && d.service !== serviceF) return false;
      if (!dansPeriode(d.date)) return false;
      if (
        recherche &&
        !`${d.numero} ${d.nom} ${d.prenom} ${d.societe} ${d.telephone} ${d.email}`
          .toLowerCase()
          .includes(recherche.toLowerCase())
      )
        return false;
      return true;
    });
  }, [demandes, statutF, serviceF, periodeF, recherche, voirArchives]);

  const stats = useMemo(() => {
    const actives = demandes.filter((d) => !d.archivee);
    return {
      total: actives.length,
      aQualifier: actives.filter((d) => d.statut === "À qualifier" || d.statut === "Qualification WhatsApp").length,
      intervention: actives.filter((d) => d.statut === "Intervention humaine requise").length,
      completes: actives.filter((d) => d.statut === "Informations complètes").length,
      transformees: actives.filter((d) => d.statut === "Transformée").length,
    };
  }, [demandes]);

  const detailDialog = useDialog<Demande>();

  const colonnes: Colonne<Demande>[] = [
    { cle: "numero", titre: "N°", rendu: (d) => <span className="font-mono text-xs">{d.numero}</span> },
    {
      cle: "date",
      titre: "Reçue le",
      rendu: (d) => (
        <span>
          {d.date.split("-").reverse().join("/")} {d.heure}
        </span>
      ),
    },
    {
      cle: "demandeur",
      titre: "Demandeur",
      rendu: (d) => (
        <div>
          <p className="font-medium text-navy">
            {d.prenom} {d.nom}
          </p>
          <p className="text-xs text-muted-foreground">{d.societe || d.typeClient}</p>
        </div>
      ),
    },
    { cle: "service", titre: "Service", rendu: (d) => d.service },
    {
      cle: "infos",
      titre: "Informations",
      rendu: (d) =>
        d.informationsManquantes.length > 0 ? (
          <StatutBadge ton="border-warning/30 bg-warning/15 text-warning">
            {d.informationsManquantes.length} manquante(s)
          </StatutBadge>
        ) : (
          <StatutBadge ton="border-success/30 bg-success/15 text-success">Complètes</StatutBadge>
        ),
    },
    { cle: "statut", titre: "Statut", rendu: (d) => <StatutBadge ton={statutTone(d.statut)}>{d.statut}</StatutBadge> },
    {
      cle: "actions",
      titre: "Actions",
      align: "right",
      rendu: (d) => (
        <div className="flex flex-wrap justify-end gap-1">
          <Button size="sm" variant="outline" onClick={() => detailDialog.ouvrir(d)}>
            Voir
          </Button>
          <Button
            size="sm"
            variant={d.archivee ? "outline" : "destructive"}
            onClick={() => archiver(d.id, !d.archivee)}
          >
            {d.archivee ? "Restaurer" : "Archiver"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        titre="Demandes entrantes"
        sous="Demandes reçues via le site web ORCONDIS, qualifiées ou en cours de qualification via WhatsApp."
        actions={
          <Button asChild size="sm" variant="outline">
            <Link to="/backoffice/whatsapp">Ouvrir la messagerie WhatsApp</Link>
          </Button>
        }
      />

      <Grille cols={3}>
        <StatCard label="Demandes actives" valeur={stats.total} detail={`${stats.transformees} transformée(s)`} />
        <StatCard label="À qualifier" valeur={stats.aQualifier} ton="alerte" />
        <StatCard label="Intervention humaine" valeur={stats.intervention} ton="critique" detail={`${stats.completes} complète(s)`} />
      </Grille>

      <Panel titre="Recherche & filtres">
        <FilterBar>
          <SearchInput value={recherche} onChange={setRecherche} placeholder="N°, nom, société, téléphone…" />
          <SelectFilter value={statutF} onChange={setStatutF} options={STATUSES} label="Statut" />
          <SelectFilter value={serviceF} onChange={setServiceF} options={SERVICES} label="Service" />
          <SelectFilter value={periodeF} onChange={setPeriodeF} options={PERIODES} label="Période" />
          <Button variant={voirArchives ? "default" : "outline"} size="sm" onClick={() => setVoirArchives((v) => !v)}>
            {voirArchives ? "Voir actives" : "Voir archivées"}
          </Button>
        </FilterBar>
      </Panel>

      <DataTable colonnes={colonnes} lignes={liste} vide="Aucune demande trouvée." />

      {detailDialog.item && (
        <DemandeDetail
          demande={detailDialog.item}
          open={detailDialog.open}
          onOpenChange={detailDialog.setOpen}
          {...(() => { const c = conversationDe(detailDialog.item!.numero); return c ? { conversation: c } : {}; })()}
          majDemande={majDemande}
          changerStatut={changerStatut}
          ajouterNote={ajouterNote}
          opsData={opsData}
          creerClient={ajouter}
          creerDossier={ajouter}
          creerCourse={ajouter}
        />
      )}
    </div>
  );
}

const ONGLETS = ["Formulaire", "Qualification WhatsApp", "Notes & historique"] as const;

function DemandeDetail({
  demande,
  open,
  onOpenChange,
  conversation,
  majDemande,
  changerStatut,
  ajouterNote,
  opsData,
  creerClient,
  creerDossier,
  creerCourse,
}: {
  demande: Demande;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  conversation?: { statut: string; manquantes: string[]; messages: { id: string; auteur: string; nom: string; texte: string; heure: string }[] };
  majDemande: (id: string, patch: Partial<Demande>, action?: string) => void;
  changerStatut: (id: string, statut: Statut) => void;
  ajouterNote: (id: string, texte: string, auteur?: string) => void;
  opsData: ReturnType<typeof useOps>["data"];
  creerClient: ReturnType<typeof useOps>["ajouter"];
  creerDossier: ReturnType<typeof useOps>["ajouter"];
  creerCourse: ReturnType<typeof useOps>["ajouter"];
}) {
  const [onglet, setOnglet] = useState<(typeof ONGLETS)[number]>("Formulaire");
  const [note, setNote] = useState("");
  const [clientCreeId, setClientCreeId] = useState("");

  function creerClientDepuisDemande() {
    const categorie = demande.societe ? "Entreprise" : "Personne physique";
    const code = prochainCodeClient(opsData.clients, categorie);
    const client: ClientOps = {
      id: oid("cli"),
      code,
      categorie,
      sousType: "",
      autrePrecision: "",
      nom: demande.nom,
      prenom: demande.prenom,
      denomination: demande.societe,
      raisonSociale: demande.societe,
      ville: "Casablanca",
      quartier: "",
      rue: "",
      numeroRue: "",
      etage: "",
      appartement: "",
      adresseComplete: "",
      pays: "Maroc",
      site: "",
      email: demande.email,
      telephoneFixe: "",
      fax: "",
      gsm: demande.telephone,
      whatsapp: demande.whatsapp,
      facebook: "",
      instagram: "",
      zone: "",
      notes: `Créé depuis la demande ${demande.numero}.`,
      archive: false,
      creeLe: todayIso(),
      documents: [],
      notesInternes: [],
      historique: [{ id: oid("ev"), date: horodatage(), auteur: "Back-Office", action: `Client créé depuis la demande ${demande.numero}` }],
    };
    creerClient("clients", client);
    setClientCreeId(client.id);
    majDemande(demande.id, {}, `Client créé (${client.code})`);
  }

  function creerDossierDepuisDemande() {
    const clientId = clientCreeId || opsData.clients.find((c) => c.email === demande.email || c.gsm === demande.telephone)?.id || "";
    const dossier: DossierOps = {
      id: oid("dos"),
      numero: prochainNumeroDossier(opsData.dossiers),
      clientId,
      contactId: "",
      responsable: "Yassine Bennani",
      type: TYPES_DOSSIER[0],
      objet: demande.service,
      description: demande.messageInitial,
      dateOuverture: todayIso(),
      datePrevue: "",
      dateCloture: "",
      priorite: "Normale",
      statut: "Nouveau",
      montantEstime: 0,
      notes: `Issu de la demande ${demande.numero}.`,
      documents: [],
      notesInternes: [],
      historique: [{ id: oid("ev"), date: horodatage(), auteur: "Back-Office", action: `Dossier créé depuis la demande ${demande.numero}` }],
      archive: false,
    };
    creerDossier("dossiers", dossier);
    majDemande(demande.id, {}, `Dossier créé (${dossier.numero})`);
  }

  function creerCourseDepuisDemande() {
    const clientId = clientCreeId || opsData.clients.find((c) => c.email === demande.email || c.gsm === demande.telephone)?.id || "";
    const q = demande.qualification;
    const course: CourseOps = {
      id: oid("crs"),
      numero: prochainNumeroCourse(opsData.courses),
      jour: "",
      dateAppel: todayIso(),
      heureAppel: demande.heure,
      correspondant: `${demande.prenom} ${demande.nom}`.trim(),
      clientId,
      contactId: "",
      dossierId: "",
      demandeNumero: demande.numero,
      message: demande.messageInitial,
      service: demande.service,
      typeCourse: q.typeCourse || TYPES_COURSE[0],
      genreCourse: (q as any).genreCourse || "Aller simple",
      priorite: q.planning.urgence === "Exclusive" ? "Exclusive" : q.planning.urgence === "Urgente" ? "Urgente" : "Normale",
      dateCourse: q.planning.date || todayIso(),
      trancheHoraire: q.planning.trancheHoraire || TRANCHES_HORAIRES[0],
      heureDebutSouhaitee: (q as any).heureDebut || "08:00",
      heureFinSouhaitee: (q as any).heureFin || "18:30",
      heureFixe: q.planning.heureFixe,
      transport: "",
      coursierId: "",
      statut: "À affecter",
      retrait: {
        ...pointVide(),
        zone: q.retrait?.zone ?? "",
        ville: q.retrait?.ville ?? "Casablanca",
        quartier: q.retrait?.quartier ?? "",
        adresse: q.retrait?.adresse ?? "",
        contact: q.retrait?.contact ?? "",
        gsm: q.retrait?.gsm ?? "",
      },
      destinations: q.destinations.length
        ? q.destinations.map((d, i) => ({ ...pointVide(i + 1), ...d }))
        : [pointVide(1)],
      instructions: q.instructionsSpeciales,
      instructionsAudio: "",
      noteInterne: "",
      heureEnvoiOrdre: "",
      heureDepart: "",
      kmDepart: 0,
      litresDepart: 0,
      heureArrivee: "",
      heureFin: "",
      kmArrivee: 0,
      litresArrivee: 0,
      kmMission: 0,
      kmVide: 0,
      attenteMinutes: 0,
      notesCoursier: "",
      documents: [],
      notesInternes: [],
      reaffectations: [],
      historique: [{ id: oid("ev"), date: horodatage(), auteur: "Back-Office", action: `Course créée depuis la demande ${demande.numero}` }],
      archive: false,
    };
    creerCourse("courses", course);
    majDemande(demande.id, { statut: "Transformée" }, `Course créée (${course.numero})`);
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} titre={`Demande ${demande.numero}`} large>
      <Onglets items={ONGLETS} actif={onglet} onChange={(v) => setOnglet(v as typeof onglet)} />

      {onglet === "Formulaire" && (
        <div className="space-y-4 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatutBadge ton={statutTone(demande.statut)}>{demande.statut}</StatutBadge>
            {demande.informationsManquantes.length > 0 && (
              <StatutBadge ton="border-warning/30 bg-warning/15 text-warning">
                Informations manquantes : {demande.informationsManquantes.join(", ")}
              </StatutBadge>
            )}
          </div>
          <Grille cols={3}>
            <Detail label="Reçue le">{`${demande.date.split("-").reverse().join("/")} ${demande.heure} (${demande.jour})`}</Detail>
            <Detail label="Source">{demande.source}</Detail>
            <Detail label="Type de client">{demande.typeClient}</Detail>
            <Detail label="Nom">{`${demande.prenom} ${demande.nom}`}</Detail>
            <Detail label="Société">{demande.societe}</Detail>
            <Detail label="Service demandé">{demande.service}</Detail>
            <Detail label="Téléphone">{demande.telephone}</Detail>
            <Detail label="WhatsApp">{demande.whatsapp}</Detail>
            <Detail label="Email">{demande.email}</Detail>
            <Detail label="Responsable">{demande.responsableHumain || "Non assigné"}</Detail>
            <Detail label="Agent WhatsApp">{demande.agentWhatsApp}</Detail>
            <Detail label="Dernière interaction">{demande.derniereInteraction}</Detail>
          </Grille>
          <Detail label="Message initial">{demande.messageInitial}</Detail>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Documents joints</p>
            {demande.documents.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">Aucun document.</p>
            ) : (
              <ul className="mt-1 space-y-1 text-sm">
                {demande.documents.map((d) => (
                  <li key={d.id}>
                    {d.nom} ({d.type}, {d.taille})
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border pt-3">
            <ChampSelect
              label=""
              value={demande.statut}
              onChange={(v) => changerStatut(demande.id, v as Statut)}
              options={STATUSES as unknown as string[]}
            />
            <Button size="sm" variant="outline" asChild>
              <Link to="/backoffice/whatsapp">Ouvrir la conversation WhatsApp</Link>
            </Button>
            <Button size="sm" variant="outline" onClick={() => majDemande(demande.id, { informationsManquantes: [] }, "Informations marquées complètes")}>
              Marquer informations complètes
            </Button>
            <Button size="sm" variant="outline" onClick={creerClientDepuisDemande}>
              Créer client
            </Button>
            <Button size="sm" variant="outline" onClick={creerDossierDepuisDemande}>
              Créer dossier
            </Button>
            <Button size="sm" onClick={creerCourseDepuisDemande}>
              Créer course
            </Button>
          </div>
        </div>
      )}

      {onglet === "Qualification WhatsApp" && (
        <div className="space-y-3 pt-3">
          {conversation ? (
            <>
              <StatutBadge>{conversation.statut}</StatutBadge>
              {conversation.manquantes.length > 0 && (
                <p className="text-sm text-warning">Manquant : {conversation.manquantes.join(", ")}</p>
              )}
              <ul className="space-y-2">
                {conversation.messages.map((m) => (
                  <li key={m.id} className="rounded-md border border-border bg-surface/60 px-3 py-2 text-sm">
                    <p className="font-medium text-navy">
                      {m.nom} <span className="text-xs font-normal text-muted-foreground">{m.heure}</span>
                    </p>
                    <p>{m.texte}</p>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {demande.conversation.length === 0
                ? "Aucune conversation WhatsApp liée à cette demande."
                : ""}
            </p>
          )}
          {demande.conversation.length > 0 && (
            <ul className="space-y-2">
              {demande.conversation.map((m) => (
                <li key={m.id} className="rounded-md border border-border bg-surface/60 px-3 py-2 text-sm">
                  <p className="font-medium text-navy">
                    {m.nom} <span className="text-xs font-normal text-muted-foreground">{m.heure}</span>
                  </p>
                  <p>{m.texte}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {onglet === "Notes & historique" && (
        <div className="space-y-4 pt-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <ChampTexte label="Ajouter une note" value={note} onChange={setNote} rows={2} />
            </div>
            <Button
              size="sm"
              className="self-end"
              onClick={() => {
                if (!note.trim()) return;
                ajouterNote(demande.id, note);
                setNote("");
              }}
            >
              Ajouter
            </Button>
          </div>
          <ul className="space-y-2">
            {demande.notes.map((n) => (
              <li key={n.id} className="rounded-md border border-border bg-surface/60 px-3 py-2 text-sm">
                <p>{n.texte}</p>
                <p className="text-xs text-muted-foreground">{n.auteur} · {n.date}</p>
              </li>
            ))}
          </ul>
          <Historique items={demande.historique} />
        </div>
      )}
    </FormDialog>
  );
}
