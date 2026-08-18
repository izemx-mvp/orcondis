import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useOps, useOpsLookups, recommanderCoursiers } from "@/lib/bo/ops-store";
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
  TRANCHES_HORAIRES,
  TRANSPORTS,
  ZONES,
  type CourseOps,
  type PointOps,
} from "@/lib/bo/ops-data";
import { Button } from "@/components/ui/button";
import { EditeurPoint } from "@/components/bo/ops/courses-points";
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
  FormDialog,
  Grille,
  Onglets,
  Historique,
  Detail,
  useDialog,
  type Colonne,
} from "@/components/bo/kit";

export const Route = createFileRoute("/backoffice/courses")({
  head: () => ({
    meta: [
      { title: "Courses — Back-Office ORCONDIS" },
      { name: "description", content: "Gestion des courses ORCONDIS : affectation coursier, suivi, kilométrage et documents." },
    ],
  }),
  component: CoursesPage,
});

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
  const { data, ajouter, modifier, archiver, ajouterNote, ajouterDocument, changerStatutCourse, affecterCoursier, reaffecterCoursier } = useOps();
  const l = useOpsLookups();

  const [recherche, setRecherche] = useState("");
  const [statut, setStatut] = useState("");
  const [priorite, setPriorite] = useState("");
  const [client, setClient] = useState("");
  const [coursierF, setCoursierF] = useState("");
  const [service, setService] = useState("");
  const [zone, setZone] = useState("");
  const [dateF, setDateF] = useState("");
  const [voirArchives, setVoirArchives] = useState(false);

  const nouveauDialog = useDialog<null>();
  const editDialog = useDialog<CourseOps>();
  const detailDialog = useDialog<CourseOps>();
  const affectationDialog = useDialog<CourseOps>();
  const reaffectationDialog = useDialog<CourseOps>();
  const [ongletDetail, setOngletDetail] = useState("Informations");
  const [note, setNote] = useState("");
  const [docNom, setDocNom] = useState("");
  const [coursierChoisi, setCoursierChoisi] = useState("");
  const [motif, setMotif] = useState("");
  const [commentaire, setCommentaire] = useState("");

  const [form, setForm] = useState<CourseOps>(() => courseVide(prochainNumeroCourse(data.courses)));

  const services = useMemo(() => Array.from(new Set(data.courses.map((c) => c.service).filter(Boolean))).sort(), [data.courses]);

  const courses = useMemo(() => {
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

  const colonnes: Colonne<CourseOps>[] = [
    { cle: "numero", titre: "N°", rendu: (c) => <span className="font-medium text-navy">{c.numero}</span> },
    { cle: "client", titre: "Client", rendu: (c) => l.clientNom(c.clientId) },
    { cle: "type", titre: "Type", rendu: (c) => c.typeCourse },
    { cle: "date", titre: "Date", rendu: (c) => `${c.dateCourse} · ${c.trancheHoraire}` },
    { cle: "coursier", titre: "Coursier", rendu: (c) => l.coursierNom(c.coursierId) },
    { cle: "priorite", titre: "Priorité", rendu: (c) => <Statut ton={tonStatut(c.priorite)}>{c.priorite}</Statut> },
    { cle: "statut", titre: "Statut", rendu: (c) => <Statut ton={toneCourse(c.statut)}>{c.statut}</Statut> },
    {
      cle: "actions",
      titre: "Actions",
      align: "right",
      rendu: (c) => (
        <div className="flex flex-wrap justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" onClick={() => ouvrirDetail(c)}>Voir</Button>
          <Button size="sm" variant="ghost" onClick={() => ouvrirEdition(c)}>Modifier</Button>
          {!c.coursierId ? (
            <Button size="sm" variant="ghost" onClick={() => { setCoursierChoisi(""); affectationDialog.ouvrir(c); }}>Affecter</Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => { setCoursierChoisi(""); setMotif(""); setCommentaire(""); reaffectationDialog.ouvrir(c); }}>
              Réaffecter
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => archiver("courses", c.id, !c.archive)}>
            {c.archive ? "Restaurer" : "Archiver"}
          </Button>
        </div>
      ),
    },
  ];

  const champsFormulaire = (
    <>
      <Grille>
        <ChampSelect
          label="Client"
          value={form.clientId}
          onChange={(v) => setForm({ ...form, clientId: v, contactId: "" })}
          options={data.clients.filter((c) => !c.archive).map((c) => ({ value: c.id, label: nomClient(c) }))}
        />
        <ChampSelect
          label="Contact"
          value={form.contactId}
          onChange={(v) => setForm({ ...form, contactId: v })}
          options={data.contacts.filter((c) => c.clientId === form.clientId).map((c) => ({ value: c.id, label: `${c.prenom} ${c.nom}` }))}
        />
      </Grille>
      <Grille>
        <ChampSelect
          label="Dossier (optionnel)"
          value={form.dossierId}
          onChange={(v) => setForm({ ...form, dossierId: v })}
          options={data.dossiers.filter((d) => d.clientId === form.clientId).map((d) => ({ value: d.id, label: d.numero }))}
        />
        <Champ label="Service" value={form.service} onChange={(v) => setForm({ ...form, service: v })} />
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
      <Grille cols={3}>
        <Champ label="Poids (kg)" type="number" value={(form as any).poids || 0} onChange={(v) => setForm({ ...form, [ "poids" as any]: Number(v) })} />
        <Champ label="Volume" value={(form as any).volume || ""} onChange={(v) => setForm({ ...form, [ "volume" as any]: v })} />
        <ChampSelect label="Transport" value={form.transport} onChange={(v) => setForm({ ...form, transport: v as CourseOps["transport"] })} options={TRANSPORTS} />
      </Grille>
      <ChampTexte label="Message / instructions" value={form.message} onChange={(v) => setForm({ ...form, message: v })} rows={2} />
      <EditeurPoint titre="Point de retrait" point={form.retrait} onChange={(p) => setForm({ ...form, retrait: p })} />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-navy">Destinations</p>
          <Button size="sm" variant="outline" onClick={ajouterDestination}>Ajouter une destination</Button>
        </div>
        {form.destinations.map((d, i) => (
          <EditeurPoint
            key={d.id}
            titre={`Destination ${i + 1}`}
            point={d}
            onChange={(p) => majDestination(d.id, p)}
            {...(form.destinations.length > 1 ? { onSupprimer: () => retirerDestination(d.id) } : {})}
          />
        ))}
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
    <div className="space-y-6">
      <PageHeader
        titre="Courses"
        sous="Planification, affectation et suivi des courses coursiers."
        actions={<Button size="sm" onClick={ouvrirCreation}>Nouvelle course</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Courses actives" valeur={stats.total} />
        <StatCard label="À affecter" valeur={stats.aAffecter} ton="alerte" />
        <StatCard label="En cours" valeur={stats.enCours} />
        <StatCard label="Bloquées" valeur={stats.bloquees} ton="critique" />
        <StatCard label="Terminées" valeur={stats.terminees} ton="positif" />
      </div>

      <Panel
        titre="Liste des courses"
        actions={
          <Button size="sm" variant="outline" onClick={() => setVoirArchives((v) => !v)}>
            {voirArchives ? "Voir actives" : "Voir archivées"}
          </Button>
        }
      >
        <div className="mb-3 space-y-2">
          <FilterBar>
            <SearchInput value={recherche} onChange={setRecherche} placeholder="N°, client, type…" />
            <SelectFilter label="Statut" value={statut} onChange={setStatut} options={STATUTS_COURSE} />
            <SelectFilter label="Priorité" value={priorite} onChange={setPriorite} options={PRIORITES_COURSE} />
            <SelectFilter label="Service" value={service} onChange={setService} options={services} />
            <SelectFilter label="Zone" value={zone} onChange={setZone} options={ZONES} />
            <Champ label="" type="date" value={dateF} onChange={setDateF} />
          </FilterBar>
        </div>
        <DataTable colonnes={colonnes} lignes={courses} onRowClick={ouvrirDetail} vide="Aucune course trouvée." />
      </Panel>

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
              items={["Informations", "Nature", "Trajet", "Documents", "Notes", "Réaffectations", "Historique"]}
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
