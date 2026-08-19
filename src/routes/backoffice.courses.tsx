import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useOps, useOpsLookups, recommanderCoursiers } from "@/lib/bo/ops-store";
import { AnimatedBackground } from "@/components/ui/design-system/AnimatedBackground";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addDays,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  addMonths,
  parseISO,
} from "date-fns";
import { fr as localeFr } from "date-fns/locale";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  List as ListIcon, 
  Clock, 
  Check, 
  CheckCheck, 
  AlertTriangle, 
  XCircle,
  CheckCircle2,
  MoreVertical,
  MapPin,
  User,
  Truck,
  FileText
} from "lucide-react";
import {
  oid,
  horodatage,
  todayIso,
  jourDe,
  toneCourse,
  prochainNumeroCourse,
  pointVide,
  nomClient,
  nomCoursier,
  PRIORITES_COURSE,
  TYPES_COURSE,
  STATUTS_COURSE,
  STATUTS_DISPATCH,
  tonStatutDispatch,
  TRANCHES_HORAIRES,
  TRANSPORTS,
  ZONES,
  MODES_COMMUNICATION,
  MOMENTS_ENVOI,
  type CourseOps,
  type PointOps,
} from "@/lib/bo/ops-data";

import { Button } from "@/components/ui/button";
import { EditeurPoint } from "@/components/bo/ops/courses-points";
import { cn } from "@/lib/utils";
import {
  PageHeader,
  StatCard,
  Panel,
  SearchInput,
  SelectFilter,
  FilterBar,
  DataTable,
  Statut,
  tonStatut,
  Champ,
  ChampSelect,
  ChampTexte,
  ChampCase,
  FormDialog,
  Grille,
  Onglets,
  Historique,
  Detail,
  useDialog,
  type Colonne,
} from "@/components/bo/kit";
import { CalendarContainer, type CalendarViewType } from "@/components/bo/ops/calendar";



function courseVide(numero: string): CourseOps {
  return {
    id: oid("crs"),
    numero,
    jour: jourDe(todayIso()),
    dateAppel: todayIso(),
    heureAppel: new Date().toTimeString().slice(0, 5),
    correspondant: "",
    clientId: "",
    contactId: "",
    dossierId: "",
    demandeNumero: "",
    message: "",
    service: "",
    typeCourse: TYPES_COURSE[0],
    genreCourse: "Aller simple",
    priorite: "Normale" as CourseOps["priorite"],
    dateCourse: todayIso(),
    trancheHoraire: TRANCHES_HORAIRES[0],
    heureDebutSouhaitee: "08:00",
    heureFinSouhaitee: "18:30",
    heureFixe: "",
    transport: "" as CourseOps["transport"],
    poids: 0,
    volume: "",
    manutention: false,
    precautions: "",
    formalitesAdministratives: "",
    quantite: 1,
    coursierId: "",
    statut: "En attente",
    retrait: pointVide(),
    destinations: [pointVide(1)],
    instructions: "",
    instructionsAudio: "",
    noteInterne: "",
    dispatch: {
      mode: "Message texte",
      moment: "Immédiatement après affectation",
      dateEnvoi: todayIso(),
      heureEnvoi: new Date().toTimeString().slice(0, 5),
      confirmationRecue: false,
      confirmationMission: false,
      statut: "À programmer",
      nbRelances: 0,
      historique: [],
    },
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
    historique: [{ id: oid("ev"), date: horodatage(), auteur: "Back-Office", action: "Course créée" }],
    archive: false,
  };
}


function CoursesPage() {
  const { data, ajouter, modifier, archiver, ajouterNote, ajouterDocument, changerStatutCourse, affecterCoursier, reaffecterCoursier, programmerCommunication, envoyerCommunication, repondreCommunication, annulerCommunication } = useOps();
  const l = useOpsLookups();

  // Navigation et Vue
  const [vue, setVue] = useState<"Liste" | "Planning">(() => {
    if (typeof window !== "undefined") {
      return (window.localStorage.getItem("orcondis.courses.vue") as any) || "Liste";
    }
    return "Liste";
  });
  
  useEffect(() => {
    window.localStorage.setItem("orcondis.courses.vue", vue);
  }, [vue]);

  // Filtres communs
  const [recherche, setRecherche] = useState("");
  const [statut, setStatut] = useState("");
  const [priorite, setPriorite] = useState("");
  const [client, setClient] = useState("");
  const [coursierF, setCoursierF] = useState("");
  const [service, setService] = useState("");
  const [zone, setZone] = useState("");
  const [dateF, setDateF] = useState("");
  const [voirArchives, setVoirArchives] = useState(false);

  // État Calendrier
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<CalendarViewType>("Semaine");

  // Dialogs
  const nouveauDialog = useDialog<null>();
  const editDialog = useDialog<CourseOps>();
  const detailDialog = useDialog<CourseOps>();
  const affectationDialog = useDialog<CourseOps>();
  const reaffectationDialog = useDialog<CourseOps>();
  
  // États de saisie
  const [ongletDetail, setOngletDetail] = useState("Informations");
  const [note, setNote] = useState("");
  const [docNom, setDocNom] = useState("");
  const [coursierChoisi, setCoursierChoisi] = useState("");
  const [motif, setMotif] = useState("");
  const [commentaire, setCommentaire] = useState("");

  const [form, setForm] = useState<CourseOps>(() => courseVide(prochainNumeroCourse(data.courses)));

  const services = useMemo(() => Array.from(new Set(data.courses.map((c) => c.service).filter(Boolean))).sort(), [data.courses]);

  // Filtrage des données
  const coursesFiltrees = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    return data.courses.filter((c) => {
      if (c.archive !== voirArchives) return false;
      if (statut && c.statut !== statut) return false;
      if (priorite && c.priorite !== priorite) return false;
      if (client && c.clientId !== client) return false;
      if (coursierF && c.coursierId !== coursierF) return false;
      if (service && c.service !== service) return false;
      if (zone && c.retrait.zone !== zone && !c.destinations.some((d) => d.zone === zone)) return false;
      if (dateF && c.dateCourse !== dateF) return false;
      if (terme) {
        const hay = `${c.numero} ${l.clientNom(c.clientId)} ${c.typeCourse} ${c.message}`.toLowerCase();
        if (!hay.includes(terme)) return false;
      }
      return true;
    });
  }, [data.courses, recherche, statut, priorite, client, coursierF, service, zone, dateF, voirArchives, l]);

  const stats = useMemo(() => {
    const actives = data.courses.filter((c) => !c.archive);
    return {
      total: actives.length,
      aAffecter: actives.filter((c) => c.statut === "À affecter" || c.statut === "En attente").length,
      enCours: actives.filter((c) => c.statut === "En cours" || c.statut === "Affectée" || c.statut === "Acceptée").length,
      bloquees: actives.filter((c) => c.statut === "Bloquée").length,
      terminees: actives.filter((c) => c.statut === "Terminée" || c.statut === "Validée").length,
    };
  }, [data.courses]);

  // Actions
  const ouvrirCreation = () => {
    setForm(courseVide(prochainNumeroCourse(data.courses)));
    nouveauDialog.ouvrir(null);
  };
  const soumettreCreation = () => {
    if (!form.clientId || !form.typeCourse) return;
    ajouter("courses", form);
  };
  const ouvrirEdition = (c: CourseOps) => {
    setForm(c);
    editDialog.ouvrir(c);
  };
  const soumettreEdition = () => {
    if (!editDialog.item) return;
    modifier("courses", editDialog.item.id, form, "Course modifiée");
  };
  const ouvrirDetail = (c: CourseOps) => {
    setOngletDetail("Informations");
    detailDialog.ouvrir(c);
  };

  const ajouterDestination = () => setForm({ ...form, destinations: [...form.destinations, pointVide(form.destinations.length + 1)] });
  const retirerDestination = (id: string) =>
    setForm({ ...form, destinations: form.destinations.filter((d) => d.id !== id) });
  const majDestination = (id: string, p: PointOps) =>
    setForm({ ...form, destinations: form.destinations.map((d) => (d.id === id ? p : d)) });

  const recommandations = useMemo(() => {
    if (!affectationDialog.item) return [];
    return recommanderCoursiers(data.coursiers, l.chargeCoursier, affectationDialog.item);
  }, [affectationDialog.item, data.coursiers, l]);

  // Colonnes de la table
  const colonnes: Colonne<CourseOps>[] = [
    { cle: "numero", titre: "N°", rendu: (c) => <span className="font-bold text-navy">{c.numero}</span> },
    { cle: "date", titre: "Date", rendu: (c) => <div className="text-[14px]">
        <p className="font-bold">{format(parseISO(c.dateCourse), "dd MMM")}</p>
        <p className="text-muted-foreground font-medium">{c.heureFixe || c.trancheHoraire.split(' ')[0]}</p>
      </div> },
    { cle: "client", titre: "Client / Corresp.", rendu: (c) => <div>
        <p className="font-bold text-[15px]">{l.clientNom(c.clientId)}</p>
        <p className="text-[12px] text-muted-foreground font-black uppercase tracking-wider">{c.correspondant}</p>
      </div> },
    { cle: "commande", titre: "Service / Commande", rendu: (c) => <div className="max-w-[150px]">
        <p className="text-[14px] font-bold truncate">{c.service || c.typeCourse}</p>
        <p className="text-[12px] text-muted-foreground truncate font-medium">{c.message}</p>
      </div> },
    { cle: "type", titre: "Type/Genre", rendu: (c) => <div className="text-[11px]">
        <p>{c.typeCourse}</p>
        <p className="text-muted-foreground">{c.genreCourse}</p>
      </div> },
    { cle: "trajet", titre: "Retrait → Dest.", rendu: (c) => <div className="text-[11px]">
        <p className="font-bold text-navy">Ret: {c.retrait.zone}</p>
        <p className="text-muted-foreground font-medium">Dest: {c.destinations[0]?.zone || "—"}</p>
      </div> },
    { cle: "coursier", titre: "Coursier", rendu: (c) => <div className="text-[13px]">
        {c.coursierId ? (
          <p className="font-medium">{l.coursierNom(c.coursierId)}</p>
        ) : (
          <span className="text-warning text-[12px] font-medium">⚠ À affecter</span>
        )}
      </div> },
    { cle: "dispatch", titre: "Dispatch", rendu: (c) => <div className="flex flex-col items-center">
        {c.dispatch.statut === "Confirmée" ? <CheckCheck className="w-4 h-4 text-success" /> : 
         c.dispatch.statut === "Envoyée" ? <Check className="w-4 h-4 text-primary" /> :
         c.dispatch.statut === "Programmée" ? <Clock className="w-4 h-4 text-warning" /> :
         c.dispatch.statut === "Refusée" ? <XCircle className="w-4 h-4 text-destructive" /> :
         <span className="text-[9px] text-muted-foreground">—</span>}
        <span className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">{c.dispatch.statut}</span>
      </div> },
    { cle: "statut", titre: "Statut", rendu: (c) => <Statut ton={toneCourse(c.statut)}>{c.statut}</Statut> },
    {
      cle: "actions",
      titre: "Actions",
      align: "right",
      rendu: (c) => (
        <div className="flex flex-wrap justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" className="h-10 text-[13px] px-3 font-bold" onClick={() => ouvrirDetail(c)}>Voir</Button>
          <Button size="sm" variant="ghost" className="h-10 text-[13px] px-3 font-bold" onClick={() => ouvrirEdition(c)}>Modifier</Button>
          {!c.coursierId ? (
            <Button size="sm" variant="outline" className="h-10 text-[12px] px-3 font-bold" onClick={() => { setCoursierChoisi(""); affectationDialog.ouvrir(c); }}>Affecter</Button>
          ) : (
            <Button size="sm" variant="ghost" className="h-10 text-[12px] px-3 font-bold" onClick={() => { setCoursierChoisi(""); setMotif(""); setCommentaire(""); reaffectationDialog.ouvrir(c); }}>
              Réaffecter
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-10 text-[12px] px-3 font-bold text-muted-foreground" onClick={() => archiver("courses", c.id, !c.archive)}>
            {c.archive ? "Restaurer" : "Archiver"}
          </Button>
        </div>
      ),
    },
  ];

  const champsFormulaire = (
    <>
      <div className="border-b pb-4">
        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-navy">Informations de la demande</p>
        <Grille cols={3}>
          <Detail label="Jour">{form.jour}</Detail>
          <Detail label="Date d'appel">{form.dateAppel}</Detail>
          <Detail label="Heure d'appel">{form.heureAppel}</Detail>
        </Grille>
      </div>

      <div className="pt-4">
        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-navy">Client & Correspondant</p>
        <Grille>
          <div className="space-y-2">
            <ChampSelect
              label="Donneur d'ordres / Client"
              value={form.clientId}
              onChange={(v) => {
                const cli = data.clients.find(c => c.id === v);
                setForm({ ...form, clientId: v, contactId: "", retrait: { ...form.retrait, zone: cli?.zone || "" } });
              }}
              options={data.clients.filter((c) => !c.archive).map((c) => ({ value: c.id, label: `${c.code} — ${nomClient(c)}` }))}
            />
            {form.clientId && (
              <p className="text-[10px] text-muted-foreground uppercase">
                Zone Client : {data.clients.find(c => c.id === form.clientId)?.zone || "Non définie"}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <ChampSelect
              label="Le correspondant"
              value={form.contactId}
              onChange={(v) => setForm({ ...form, contactId: v, correspondant: data.contacts.find(c => c.id === v)?.nom || "" })}
              options={data.contacts.filter((c) => c.clientId === form.clientId).map((c) => ({ value: c.id, label: `${c.code} — ${c.prenom} ${c.nom}` }))}
            />
            {form.clientId && (
              <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => { /* Logic to open add contact for this client */ }}>
                + Créer un contact
              </Button>
            )}
          </div>
        </Grille>
      </div>

      <Grille>
        <ChampSelect
          label="Dossier (optionnel)"
          value={form.dossierId}
          onChange={(v) => setForm({ ...form, dossierId: v })}
          options={data.dossiers.filter((d) => d.clientId === form.clientId).map((d) => ({ value: d.id, label: d.numero }))}
        />
        <ChampSelect 
          label="Message / Commande (Service)" 
          value={form.service} 
          onChange={(v) => setForm({ ...form, service: v })} 
          options={TYPES_COURSE}
        />
      </Grille>
      <Grille cols={3}>
        <ChampSelect label="Type de course" value={form.typeCourse} onChange={(v) => setForm({ ...form, typeCourse: v })} options={TYPES_COURSE} />
        <ChampSelect label="Genre de course" value={form.genreCourse} onChange={(v) => setForm({ ...form, genreCourse: v as any })} options={["Aller simple", "Aller & Retour", "Multiple"]} />
        <ChampSelect label="Priorité" value={form.priorite} onChange={(v) => setForm({ ...form, priorite: v as CourseOps["priorite"] })} options={PRIORITES_COURSE} />
      </Grille>
      <Grille cols={3}>
        <Champ label="Date de la course" type="date" value={form.dateCourse} onChange={(v) => setForm({ ...form, dateCourse: v, jour: jourDe(v) })} />
        <ChampSelect label="Tranche horaire" value={form.trancheHoraire} onChange={(v) => setForm({ ...form, trancheHoraire: v })} options={TRANCHES_HORAIRES} />
        <Champ label="Heure fixe" type="time" value={form.heureFixe} onChange={(v) => setForm({ ...form, heureFixe: v })} />
      </Grille>
      <Grille cols={2}>
        <Champ label="Heure début souhaitée" type="time" value={form.heureDebutSouhaitee} onChange={(v) => setForm({ ...form, heureDebutSouhaitee: v })} />
        <Champ label="Heure fin souhaitée" type="time" value={form.heureFinSouhaitee} onChange={(v) => setForm({ ...form, heureFinSouhaitee: v })} />
      </Grille>
      <div className="border-t pt-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nature de l'envoi</p>
        <Grille cols={3}>
          <Champ label="Quantité" type="number" value={form.quantite || 1} onChange={(v) => setForm({ ...form, quantite: Number(v) })} />
          <Champ label="Poids (kg)" type="number" value={form.poids || 0} onChange={(v) => setForm({ ...form, poids: Number(v) })} />
          <Champ label="Volume" value={form.volume || ""} onChange={(v) => setForm({ ...form, volume: v })} />
        </Grille>
        <Grille cols={2}>
          <Champ label="Précautions" value={form.precautions || ""} onChange={(v) => setForm({ ...form, precautions: v })} />
          <Champ label="Formalités" value={form.formalitesAdministratives || ""} onChange={(v) => setForm({ ...form, formalitesAdministratives: v })} />
        </Grille>
        <div className="mt-2 max-w-xs">
          <ChampSelect label="Transport" value={form.transport} onChange={(v) => setForm({ ...form, transport: v as CourseOps["transport"] })} options={TRANSPORTS} />
        </div>
      </div>
      <ChampTexte label="Message / instructions" value={form.message} onChange={(v) => setForm({ ...form, message: v })} rows={2} />
      <Grille cols={2}>
        <ChampSelect label="Zone de retrait" value={form.retrait.zone} onChange={(v) => setForm({ ...form, retrait: { ...form.retrait, zone: v } })} options={ZONES} />
        <ChampSelect label="Zone destination" value={form.destinations[0]?.zone || ""} onChange={(v) => {
          const ds = [...form.destinations];
          if (ds[0]) ds[0] = { ...ds[0], zone: v };
          setForm({ ...form, destinations: ds });
        }} options={ZONES} />
      </Grille>
      <Grille cols={3}>
        <ChampSelect label="Type de course" value={form.typeCourse} onChange={(v) => setForm({ ...form, typeCourse: v })} options={TYPES_COURSE} />
        <ChampSelect label="Genre de course" value={form.genreCourse} onChange={(v) => setForm({ ...form, genreCourse: v as any })} options={["Aller simple", "Aller & Retour", "Multiple"]} />
        <ChampSelect label="Niveau d'importance" value={form.priorite} onChange={(v) => setForm({ ...form, priorite: v as CourseOps["priorite"] })} options={PRIORITES_COURSE} />
      </Grille>
      <div className="border-t pt-4">
        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-navy">Date de la course & Tranche horaire</p>
        <Grille cols={3}>
          <Champ label="Date" type="date" value={form.dateCourse} onChange={(v) => setForm({ ...form, dateCourse: v, jour: jourDe(v) })} />
          <ChampSelect label="Tranche horaire" value={form.trancheHoraire} onChange={(v) => setForm({ ...form, trancheHoraire: v })} options={TRANCHES_HORAIRES} />
          <Champ label="Heure fixe" type="time" value={form.heureFixe} onChange={(v) => setForm({ ...form, heureFixe: v })} />
        </Grille>
      </div>
      <div className="border-t pt-4">
        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-navy">Destinations</p>
        {form.destinations.map((d, i) => (
          <EditeurPoint
            key={d.id}
            titre={`Destination ${i + 1}`}
            point={d}
            onChange={(p) => majDestination(d.id, p)}
            {...(form.destinations.length > 1 ? { onSupprimer: () => retirerDestination(d.id) } : {})}
          />
        ))}
        <Button size="sm" variant="outline" className="mt-2" onClick={ajouterDestination}>+ Ajouter une destination</Button>
      </div>
      <div className="border-t pt-4">
        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-navy">Communication au coursier</p>
        <Grille>
          <ChampSelect
            label="Mode d'envoi"
            value={form.dispatch.mode}
            onChange={(v) => setForm({ ...form, dispatch: { ...form.dispatch, mode: v as any } })}
            options={MODES_COMMUNICATION}
          />
          <ChampSelect
            label="Moment d'envoi"
            value={form.dispatch.moment}
            onChange={(v) => setForm({ ...form, dispatch: { ...form.dispatch, moment: v as any } })}
            options={MOMENTS_ENVOI}
          />
        </Grille>
        {(form.dispatch.moment === "À une date et heure programmées") && (
          <Grille>
            <Champ label="Date d'envoi" type="date" value={form.dispatch.dateEnvoi} onChange={(v) => setForm({ ...form, dispatch: { ...form.dispatch, dateEnvoi: v } })} />
            <Champ label="Heure d'envoi" type="time" value={form.dispatch.heureEnvoi} onChange={(v) => setForm({ ...form, dispatch: { ...form.dispatch, heureEnvoi: v } })} />
          </Grille>
        )}
        <Grille>
          <ChampCase
            label="Demander au coursier de confirmer la réception"
            checked={form.dispatch.confirmationRecue}
            onChange={(v: boolean) => setForm({ ...form, dispatch: { ...form.dispatch, confirmationRecue: v } })}
          />
          <ChampCase
            label="Demander au coursier d'accepter ou refuser la mission"
            checked={form.dispatch.confirmationMission}
            onChange={(v: boolean) => setForm({ ...form, dispatch: { ...form.dispatch, confirmationMission: v } })}
          />

        </Grille>
      </div>
      <Grille cols={3}>

        <Champ label="Km départ" type="number" value={form.kmDepart} onChange={(v) => setForm({ ...form, kmDepart: Number(v) || 0 })} />
        <Champ label="Km arrivée" type="number" value={form.kmArrivee} onChange={(v) => setForm({ ...form, kmArrivee: Number(v) || 0 })} />
        <Champ label="Km à vide" type="number" value={form.kmVide} onChange={(v) => setForm({ ...form, kmVide: Number(v) || 0 })} />
      </Grille>
      <Grille cols={3}>
        <Champ label="Heure de départ" type="time" value={form.heureDepart} onChange={(v) => setForm({ ...form, heureDepart: v })} />
        <Champ label="Heure d'arrivée" type="time" value={form.heureArrivee} onChange={(v) => setForm({ ...form, heureArrivee: v })} />
        <Champ label="Temps d'attente (min)" type="number" value={form.attenteMinutes} onChange={(v) => setForm({ ...form, attenteMinutes: Number(v) || 0 })} />
      </Grille>
      <ChampTexte label="Note interne" value={form.noteInterne} onChange={(v) => setForm({ ...form, noteInterne: v })} rows={2} />
    </>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        titre="Courses"
        sous="Planification, affectation et suivi des missions ORCONDIS."
        actions={
          <div className="flex items-center gap-2">
             <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-xl border border-border shadow-sm">
              {(["Liste", "Planning"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVue(v)}
                  className={cn(
                    "px-4 py-1.5 text-[13px] font-black rounded-lg transition-all flex items-center gap-2",
                    vue === v 
                      ? "bg-navy text-white shadow-lg" 
                      : "text-muted-foreground hover:text-navy hover:bg-muted/30"
                  )}
                >
                  {v === "Liste" ? <ListIcon className="w-3.5 h-3.5" /> : <CalendarIcon className="w-3.5 h-3.5" />}
                  {v}
                </button>
              ))}
            </div>
            <Button size="default" className="rounded-xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all px-6 h-10" onClick={ouvrirCreation}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle mission
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
        <StatCard label="Missions actives" valeur={stats.total} />
        <StatCard label="À affecter" valeur={stats.aAffecter} ton="alerte" />
        <StatCard label="En cours" valeur={stats.enCours} />
        <StatCard label="Bloquées" valeur={stats.bloquees} ton="critique" />
        <StatCard label="Terminées" valeur={stats.terminees} ton="positif" />
      </div>

      {vue === "Liste" ? (
        <Panel
          titre="Liste des courses"
          actions={
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setVoirArchives((v) => !v)}>
                {voirArchives ? "Voir actives" : "Voir archivées"}
              </Button>
            </div>
          }
        >
          <div className="mb-2 space-y-1">
            <FilterBar>
              <SearchInput value={recherche} onChange={setRecherche} placeholder="N°, client, coursier…" />
              <div className="flex flex-wrap gap-2 items-center">
                <SelectFilter label="Statut" value={statut} onChange={setStatut} options={STATUTS_COURSE} />
                <SelectFilter label="Priorité" value={priorite} onChange={setPriorite} options={PRIORITES_COURSE} />
                <SelectFilter label="Service" value={service} onChange={setService} options={services} />
                <SelectFilter label="Zone" value={zone} onChange={setZone} options={ZONES} />
                <Champ label="" type="date" value={dateF} onChange={setDateF} />
              </div>
            </FilterBar>
          </div>
          <DataTable colonnes={colonnes} lignes={coursesFiltrees} onRowClick={ouvrirDetail} vide="Aucune course trouvée." />
        </Panel>
      ) : (
        <CoursesPlanning 
          data={data}
          courses={coursesFiltrees}
          calendarDate={calendarDate}
          setCalendarDate={setCalendarDate}
          calendarView={calendarView}
          setCalendarView={setCalendarView}
          onCourseClick={ouvrirDetail}
          onAssignClick={(c) => {
            setCoursierChoisi("");
            affectationDialog.ouvrir(c);
          }}
          l={l}
        />
      )}

      <FormDialog open={nouveauDialog.open} onOpenChange={nouveauDialog.setOpen} titre="Nouvelle course" onSubmit={soumettreCreation} large>
        <p className="text-xs text-muted-foreground">Numéro : <span className="font-medium text-navy">{form.numero}</span></p>
        {champsFormulaire}
      </FormDialog>

      <FormDialog open={editDialog.open} onOpenChange={editDialog.setOpen} titre={`Modifier ${editDialog.item?.numero ?? ""}`} onSubmit={soumettreEdition} large>
        {champsFormulaire}
      </FormDialog>

      <FormDialog
        open={affectationDialog.open}
        onOpenChange={affectationDialog.setOpen}
        titre={`Affecter un coursier — ${affectationDialog.item?.numero ?? ""}`}
        submitLabel="Affecter"
        onSubmit={() => {
          if (affectationDialog.item && coursierChoisi) affecterCoursier(affectationDialog.item.id, coursierChoisi);
        }}
      >
        <div className="space-y-2">
          {recommandations.map(({ coursier, score, charge }) => (
            <label
              key={coursier.id}
              className={`flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm ${
                coursierChoisi === coursier.id ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <span className="flex items-center gap-2">
                <input type="radio" checked={coursierChoisi === coursier.id} onChange={() => setCoursierChoisi(coursier.id)} />
                <span>
                  <span className="font-medium text-navy">{nomCoursier(coursier)}</span>{" "}
                  <span className="text-muted-foreground">· {coursier.transport} · {coursier.statut} · {charge} en cours</span>
                </span>
              </span>
              <Statut ton={tonStatut(String(score))}>{score} pts</Statut>
            </label>
          ))}
        </div>
      </FormDialog>

      <FormDialog
        open={reaffectationDialog.open}
        onOpenChange={reaffectationDialog.setOpen}
        titre={`Réaffecter — ${reaffectationDialog.item?.numero ?? ""}`}
        submitLabel="Réaffecter"
        onSubmit={() => {
          if (reaffectationDialog.item && coursierChoisi) {
            reaffecterCoursier(reaffectationDialog.item.id, coursierChoisi, motif, commentaire);
          }
        }}
      >
        <ChampSelect
          label="Nouveau coursier"
          value={coursierChoisi}
          onChange={setCoursierChoisi}
          options={data.coursiers.filter((c) => !c.archive).map((c) => ({ value: c.id, label: nomCoursier(c) }))}
        />
        <Champ label="Motif" value={motif} onChange={setMotif} />
        <ChampTexte label="Commentaire" value={commentaire} onChange={setCommentaire} rows={2} />
      </FormDialog>

      <FormDialog
        open={detailDialog.open}
        onOpenChange={detailDialog.setOpen}
        titre={`Course ${detailDialog.item?.numero ?? ""}`}
        description={detailDialog.item ? l.clientNom(detailDialog.item.clientId) : ""}
        large
      >
        {detailDialog.item && (
          <div className="space-y-4">
            <Onglets
              items={["Informations", "Communication coursier", "Nature", "Trajet", "Documents", "Notes", "Réaffectations", "Historique"]}
              actif={ongletDetail}
              onChange={setOngletDetail}
            />

            {ongletDetail === "Informations" && (
              <div className="space-y-4">
                <Grille>
                  <Detail label="Client">{l.clientNom(detailDialog.item.clientId)}</Detail>
                  <Detail label="Contact">{l.contactNom(detailDialog.item.contactId)}</Detail>
                  <Detail label="Dossier">{detailDialog.item.dossierId ? l.dossierNom(detailDialog.item.dossierId) : "—"}</Detail>
                  <Detail label="Type">{detailDialog.item.typeCourse}</Detail>
                  <Detail label="Service">{detailDialog.item.service}</Detail>
                  <Detail label="Coursier">{l.coursierNom(detailDialog.item.coursierId)}</Detail>
                  <Detail label="Priorité"><Statut ton={tonStatut(detailDialog.item.priorite)}>{detailDialog.item.priorite}</Statut></Detail>
                  <Detail label="Statut"><Statut ton={toneCourse(detailDialog.item.statut)}>{detailDialog.item.statut}</Statut></Detail>
                  <Detail label="Date">{detailDialog.item.dateCourse} · {detailDialog.item.trancheHoraire}</Detail>
                </Grille>
                <div className="flex flex-wrap items-center gap-2">
                  <ChampSelect
                    label="Changer le statut"
                    value={detailDialog.item.statut}
                    onChange={(v) => detailDialog.item && changerStatutCourse(detailDialog.item.id, v as CourseOps["statut"])}
                    options={STATUTS_COURSE}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => detailDialog.item && changerStatutCourse(detailDialog.item.id, "Terminée")}
                  >
                    Terminer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => detailDialog.item && changerStatutCourse(detailDialog.item.id, "Annulée")}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
            {ongletDetail === "Communication coursier" && (
              <div className="space-y-4">
                <Panel titre="Statut du Dispatch">
                  <Grille cols={3}>
                    <Detail label="Coursier affecté">{l.coursierNom(detailDialog.item.coursierId)}</Detail>
                    <Detail label="Mode">{detailDialog.item.dispatch.mode}</Detail>
                    <Detail label="Statut Dispatch"><Statut ton={tonStatutDispatch(detailDialog.item.dispatch.statut)}>{detailDialog.item.dispatch.statut}</Statut></Detail>
                    <Detail label="Programmation">{detailDialog.item.dispatch.moment}</Detail>
                    <Detail label="Date/Heure d'envoi">{detailDialog.item.dispatch.dateEnvoi} {detailDialog.item.dispatch.heureEnvoi}</Detail>
                    <Detail label="Confirmations">{detailDialog.item.dispatch.confirmationRecue ? "Réception " : ""}{detailDialog.item.dispatch.confirmationMission ? "Acceptation" : ""}</Detail>
                  </Grille>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => detailDialog.item && envoyerCommunication(detailDialog.item.id)}>Envoyer maintenant</Button>
                    <Button size="sm" variant="outline" onClick={() => detailDialog.item && annulerCommunication(detailDialog.item.id)}>Annuler l'envoi</Button>
                    {detailDialog.item.dispatch.statut === "Envoyée" && (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => detailDialog.item && repondreCommunication(detailDialog.item.id, "Accepté")}>Simuler Acceptation</Button>
                        <Button size="sm" variant="secondary" onClick={() => detailDialog.item && repondreCommunication(detailDialog.item.id, "Refusé", "Indisponible")}>Simuler Refus</Button>
                      </>
                    )}
                  </div>
                </Panel>
                <Panel titre="Historique Dispatch">
                   <ul className="space-y-2">
                    {detailDialog.item.dispatch.historique.map(h => (
                      <li key={h.id} className="rounded-md border border-border px-3 py-2 text-sm">
                        <p className="font-medium text-navy">{h.action} <span className="text-[10px] text-muted-foreground">{h.format}</span></p>
                        <p className="text-xs text-muted-foreground">{h.date} · {h.details}</p>
                      </li>
                    ))}
                    {detailDialog.item.dispatch.historique.length === 0 && <li className="text-sm text-muted-foreground">Aucun historique de dispatch.</li>}
                   </ul>
                </Panel>
              </div>
            )}
            {ongletDetail === "Nature" && (

              <div className="space-y-4">
                <Grille cols={3}>
                  <Detail label="Genre">{detailDialog.item.genreCourse}</Detail>
                  <Detail label="Quantité">{detailDialog.item.quantite || "1"}</Detail>
                  <Detail label="Poids">{detailDialog.item.poids ? `${detailDialog.item.poids} kg` : "—"}</Detail>
                  <Detail label="Volume">{detailDialog.item.volume || "—"}</Detail>
                  <Detail label="Manutention">{detailDialog.item.manutention ? "Oui" : "Non"}</Detail>
                  <Detail label="Transport">{detailDialog.item.transport || "—"}</Detail>
                </Grille>
                <div className="border-t pt-4">
                  <Grille cols={2}>
                    <Detail label="Précautions">{detailDialog.item.precautions || "—"}</Detail>
                    <Detail label="Formalités">{detailDialog.item.formalitesAdministratives || "—"}</Detail>
                  </Grille>
                </div>
              </div>
            )}
            {ongletDetail === "Trajet" && (
              <div className="space-y-3">
                <div className="rounded-md border border-border p-3 text-sm">
                  <p className="font-semibold text-navy">Retrait</p>
                  <p>{detailDialog.item.retrait.adresse}, {detailDialog.item.retrait.zone}</p>
                  <p className="text-muted-foreground">{detailDialog.item.retrait.contact} · {detailDialog.item.retrait.gsm}</p>
                </div>
                {detailDialog.item.destinations.map((d) => (
                  <div key={d.id} className="rounded-md border border-border p-3 text-sm">
                    <p className="font-semibold text-navy">Destination {d.ordre}</p>
                    <p>{d.adresse}, {d.zone}</p>
                    <p className="text-muted-foreground">{d.contact} · {d.gsm}</p>
                  </div>
                ))}
                <Grille cols={3}>
                  <Detail label="Km mission">{detailDialog.item.kmMission || (detailDialog.item.kmArrivee - detailDialog.item.kmDepart)}</Detail>
                  <Detail label="Km à vide">{detailDialog.item.kmVide}</Detail>
                  <Detail label="Attente (min)">{detailDialog.item.attenteMinutes}</Detail>
                </Grille>
              </div>
            )}
            {ongletDetail === "Documents" && (
              <div className="space-y-3">
                <ul className="space-y-2">
                  {detailDialog.item.documents.map((doc) => (
                    <li key={doc.id} className="rounded-md border border-border px-3 py-2 text-sm">{doc.nom} · {doc.type} · {doc.date}</li>
                  ))}
                  {detailDialog.item.documents.length === 0 && <p className="text-sm text-muted-foreground">Aucun document.</p>}
                </ul>
                <div className="flex items-end gap-2">
                  <Champ label="Nom du document" value={docNom} onChange={setDocNom} />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!docNom.trim() || !detailDialog.item) return;
                      ajouterDocument("courses", detailDialog.item.id, docNom, "PDF");
                      setDocNom("");
                    }}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            )}
            {ongletDetail === "Notes" && (
              <div className="space-y-3">
                <ul className="space-y-2">
                  {detailDialog.item.notesInternes.map((n) => (
                    <li key={n.id} className="rounded-md border border-border bg-surface/60 px-3 py-2 text-sm">
                      <p>{n.texte}</p>
                      <p className="text-xs text-muted-foreground">{n.auteur} · {n.date}</p>
                    </li>
                  ))}
                  {detailDialog.item.notesInternes.length === 0 && <p className="text-sm text-muted-foreground">Aucune note.</p>}
                </ul>
                <ChampTexte label="Ajouter une note" value={note} onChange={setNote} rows={2} />
                <Button
                  size="sm"
                  onClick={() => {
                    if (!note.trim() || !detailDialog.item) return;
                    ajouterNote("courses", detailDialog.item.id, note);
                    setNote("");
                  }}
                >
                  Ajouter la note
                </Button>
              </div>
            )}
            {ongletDetail === "Réaffectations" && (
              <ul className="space-y-2">
                {detailDialog.item.reaffectations.map((r) => (
                  <li key={r.id} className="rounded-md border border-border px-3 py-2 text-sm">
                    {r.ancien} → {r.nouveau} · {r.motif} · {r.date} {r.heure}
                    {r.commentaire && <p className="text-muted-foreground">{r.commentaire}</p>}
                  </li>
                ))}
                {detailDialog.item.reaffectations.length === 0 && <p className="text-sm text-muted-foreground">Aucune réaffectation.</p>}
              </ul>
            )}
            {ongletDetail === "Historique" && <Historique items={detailDialog.item.historique} />}
          </div>
        )}
      </FormDialog>
    </div>
  );
}

function CoursesPlanning({ 
  data, 
  courses, 
  calendarDate, 
  setCalendarDate, 
  calendarView, 
  setCalendarView, 
  onCourseClick,
  onAssignClick,
  l 
}: { 
  data: any, 
  courses: CourseOps[], 
  calendarDate: Date, 
  setCalendarDate: (d: Date) => void, 
  calendarView: CalendarViewType, 
  setCalendarView: (v: CalendarViewType) => void,
  onCourseClick: (c: CourseOps) => void,
  onAssignClick: (c: CourseOps) => void,
  l: any
}) {
  const unplannedCourses = useMemo(() => {
    return courses.filter(c => !c.dateCourse || c.statut === "À affecter");
  }, [courses]);

  return (
    <div className="flex flex-col lg:flex-row gap-10 h-[850px] animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex-1 min-w-0 h-full relative">
        <AnimatedBackground variant="subtle" />
        <CalendarContainer
          date={calendarDate}
          onDateChange={setCalendarDate}
          view={calendarView}
          onViewChange={setCalendarView}
        >
          {calendarView === "Jour" && (
            <CalendarDayView 
              date={calendarDate} 
              courses={courses} 
              onCourseClick={onCourseClick} 
              l={l} 
            />
          )}
          {calendarView === "Semaine" && (
            <CalendarWeekView 
              date={calendarDate} 
              courses={courses} 
              onCourseClick={onCourseClick} 
              l={l} 
            />
          )}
          {calendarView === "Mois" && (
            <CalendarMonthView 
              date={calendarDate} 
              courses={courses} 
              onCourseClick={onCourseClick} 
              l={l} 
            />
          )}
        </CalendarContainer>
      </div>
      
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <Panel titre="Courses non planifiées" className="flex-1 overflow-hidden flex flex-col border-none shadow-panel bg-white/60 backdrop-blur-xl rounded-[1.25rem]">
          <div className="flex-1 overflow-auto space-y-4 pr-2 custom-scrollbar">
            {unplannedCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                <CheckCircle2 className="w-12 h-12 mb-4 text-success" />
                <p className="text-xs font-bold uppercase tracking-widest">Tout est planifié</p>
              </div>
            ) : (
              unplannedCourses.map(c => (
                <div 
                  key={c.id} 
                  className="p-3 bg-white border border-border/50 rounded-xl hover:border-primary hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                  onClick={() => onCourseClick(c)}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-warning" />
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-black text-navy tracking-tight">{c.numero}</span>
                    <Statut ton={tonStatut(c.priorite)}>{c.priorite}</Statut>
                  </div>
                  <p className="text-sm font-black text-navy truncate mb-2">{l.clientNom(c.clientId)}</p>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-primary/60" />
                    <span className="truncate">{c.retrait.zone} → {c.destinations[0]?.zone || "?"}</span>
                  </div>
                  <Button 
                    className="w-full h-8 mt-3 text-[11px] font-black rounded-lg hidden group-hover:flex shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssignClick(c);
                    }}
                  >
                    Affecter un coursier
                  </Button>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function CalendarDayView({ date, courses, onCourseClick, l }: { date: Date, courses: CourseOps[], onCourseClick: (c: CourseOps) => void, l: any }) {
  const hours = Array.from({ length: 14 }, (_, i) => i + 7);
  
  const dayCourses = useMemo(() => {
    const dStr = format(date, "yyyy-MM-dd");
    return courses.filter(c => c.dateCourse === dStr);
  }, [date, courses]);

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="grid grid-cols-[80px_1fr] border-b border-border bg-surface/50">
        <div className="p-3 text-[10px] font-bold text-muted-foreground uppercase text-center border-r border-border">Heure</div>
        <div className="p-3 text-[10px] font-bold text-navy uppercase">{format(date, "EEEE d MMMM", { locale: localeFr })}</div>
      </div>
      <div className="flex-1 overflow-y-auto relative">
        {hours.map(hour => (
          <div key={hour} className="grid grid-cols-[80px_1fr] min-h-[80px] border-b border-border/50 group">
            <div className="text-[11px] font-medium text-muted-foreground p-3 text-center border-r border-border/50 bg-surface/30">
              {hour}:00
            </div>
            <div className="p-2 flex flex-wrap gap-2 items-start relative bg-card/50">
              {dayCourses
                .filter(c => {
                  const hf = c.heureFixe;
                  if (hf && hf.includes(':')) {
                    const parts = hf.split(':');
                    const firstPart = parts[0];
                    if (firstPart) return parseInt(firstPart) === hour;
                  }
                  const th = c.trancheHoraire;
                  if (th?.includes('Matin') && hour === 9) return true;
                  if (th?.includes('Midi') && hour === 12) return true;
                  if (th?.includes('Après-midi') && hour === 15) return true;
                  return false;
                })
                .map(c => (
                  <CourseCard key={c.id} c={c} onClick={() => onCourseClick(c)} l={l} />
                ))
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarWeekView({ date, courses, onCourseClick, l }: { date: Date, courses: CourseOps[], onCourseClick: (c: CourseOps) => void, l: any }) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start, end: addDays(start, 5) });

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="grid grid-cols-6 border-b border-border bg-surface/50">
        {weekDays.map(day => (
          <div key={day.toString()} className={cn(
            "p-3 text-center border-r border-border last:border-r-0",
            isSameDay(day, new Date()) ? "bg-primary/5" : ""
          )}>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">{format(day, "EEE", { locale: localeFr })}</p>
            <p className={cn(
              "text-lg font-black mt-0.5",
              isSameDay(day, new Date()) ? "text-primary" : "text-navy"
            )}>{format(day, "d")}</p>
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-6 overflow-y-auto">
        {weekDays.map(day => {
          const dayStr = format(day, "yyyy-MM-dd");
          const dayCourses = courses.filter(c => c.dateCourse === dayStr);
          return (
            <div key={day.toString()} className={cn(
              "min-h-[400px] border-r border-border last:border-r-0 p-2 space-y-2 bg-card/50",
              isSameDay(day, new Date()) ? "bg-primary/[0.02]" : ""
            )}>
              {dayCourses.map(c => (
                <CourseCard key={c.id} c={c} onClick={() => onCourseClick(c)} l={l} compact />
              ))}
              {dayCourses.length === 0 && (
                <div className="h-full border-2 border-dashed border-border/20 rounded-xl flex items-center justify-center">
                   <p className="text-[9px] text-muted-foreground/30 font-medium rotate-90">VIDE</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarMonthView({ date, courses, onCourseClick, l }: { date: Date, courses: CourseOps[], onCourseClick: (c: CourseOps) => void, l: any }) {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const days = eachDayOfInterval({ start, end });

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="grid grid-cols-7 border-b border-border bg-surface/50">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => (
          <div key={d} className="p-2 text-center text-[10px] font-bold text-muted-foreground uppercase border-r border-border last:border-r-0">{d}</div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {days.map((day, i) => {
          const dayStr = format(day, "yyyy-MM-dd");
          const dayCourses = courses.filter(c => c.dateCourse === dayStr);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, date);

          return (
            <div 
              key={day.toString()} 
              className={cn(
                "min-h-[100px] border-r border-b border-border p-1 flex flex-col gap-1",
                !isCurrentMonth ? "bg-muted/10 opacity-50" : "bg-card/50",
                isToday ? "ring-1 ring-inset ring-primary/20" : ""
              )}
            >
              <span className={cn(
                "text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full",
                isToday ? "bg-primary text-white" : "text-muted-foreground"
              )}>
                {format(day, "d")}
              </span>
              <div className="flex flex-col gap-0.5 overflow-y-auto">
                {dayCourses.slice(0, 4).map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => onCourseClick(c)}
                    className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded border border-border truncate cursor-pointer",
                      toneCourse(c.statut).includes("success") ? "bg-success/10 text-success border-success/20" :
                      toneCourse(c.statut).includes("warning") ? "bg-warning/10 text-warning border-warning/20" :
                      toneCourse(c.statut).includes("destructive") ? "bg-destructive/10 text-destructive border-destructive/20" :
                      "bg-surface text-navy"
                    )}
                  >
                    {c.numero} - {l.clientNom(c.clientId)}
                  </div>
                ))}
                {dayCourses.length > 4 && (
                  <div className="text-[8px] text-muted-foreground px-1 font-medium">
                    + {dayCourses.length - 4} autres...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CourseCard({ c, onClick, l, compact = false }: { c: CourseOps, onClick: () => void, l: any, compact?: boolean }) {
  const isExclusive = c.priorite === "Exclusive";
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-card border-l-4 rounded shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col overflow-hidden",
        toneCourse(c.statut).includes("success") ? "border-l-success" :
        toneCourse(c.statut).includes("warning") ? "border-l-warning" :
        toneCourse(c.statut).includes("destructive") ? "border-l-destructive" :
        "border-l-primary",
        compact ? "p-1.5 min-h-[70px]" : "p-2.5 w-[200px]"
      )}
    >
      <div className="flex justify-between items-start mb-1.5">
        <span className="text-[10px] font-black text-navy">{c.numero}</span>
        <div className="flex gap-1">
          {isExclusive && <Statut ton={tonStatut("Exclusive")}>EXCLU</Statut>}
          <Statut ton={toneCourse(c.statut)}>{c.statut}</Statut>
        </div>
      </div>
      
      <p className={cn("font-bold text-navy mb-1 leading-tight", compact ? "text-[10px]" : "text-xs")}>
        {l.clientNom(c.clientId)}
      </p>
      
      {!compact && (
        <p className="text-[10px] text-muted-foreground mb-2 line-clamp-1">{c.typeCourse}</p>
      )}

      <div className="mt-auto pt-2 border-t border-border/50 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
          <MapPin className="w-3 h-3 text-primary/60" />
          <span className="truncate">{c.retrait.zone} → {c.destinations[0]?.zone || "?"}</span>
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1 text-[9px] font-medium text-navy">
            {c.coursierId ? (
              <>
                <User className="w-3 h-3 text-navy/40" />
                <span className="truncate max-w-[80px]">{l.coursierNom(c.coursierId)}</span>
              </>
            ) : (
              <span className="text-destructive font-black uppercase text-[8px]">À affecter</span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
             {c.dispatch.statut === "Confirmée" && <CheckCheck className="w-3 h-3 text-success" />}
             {c.dispatch.statut === "Envoyée" && <Check className="w-3 h-3 text-primary" />}
             {c.heureFixe && <span className="text-[9px] bg-navy text-white px-1 rounded font-bold">{c.heureFixe}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/backoffice/courses")({
  head: () => ({
    meta: [
      { title: "Courses — Back-Office ORCONDIS" },
      { name: "description", content: "Gestion des courses ORCONDIS : affectation coursier, suivi, kilométrage et documents." },
    ],
  }),
  component: CoursesPage,
});
