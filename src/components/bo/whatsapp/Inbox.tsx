import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Champ,
  ChampSelect,
  ChampTexte,
  FormDialog,
  Panel,
  SearchInput,
  SelectFilter,
  Statut,
} from "@/components/bo/kit";
import { useBO } from "@/lib/bo-store";
import { fr, today, uid, type Conversation, type Destination } from "@/lib/bo-data";
import {
  RAISONS_HANDOFF,
  STATUTS_CONVERSATION,
  toneConversation,
  type StatutConversation,
} from "@/lib/bo-whatsapp";

function heureActuelle() {
  return new Date().toTimeString().slice(0, 5);
}

const utilisateurCourant = "Salma Idrissi";

export function Inbox({
  statutFixe,
  titreVide = "Sélectionnez une conversation.",
}: {
  statutFixe?: StatutConversation;
  titreVide?: string;
}) {
  const { data, patch, add, log } = useBO();
  const [recherche, setRecherche] = useState("");
  const [statutFiltre, setStatutFiltre] = useState<string>(statutFixe ?? "");
  const [selectionId, setSelectionId] = useState<string | null>(null);
  const [reponse, setReponse] = useState("");

  const [handoffOpen, setHandoffOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  const [infosOpen, setInfosOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const [dossierOpen, setDossierOpen] = useState(false);
  const [courseOpen, setCourseOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [motif, setMotif] = useState<string>(RAISONS_HANDOFF[0]);
  const [operateur, setOperateur] = useState(utilisateurCourant);
  const [resumeIA, setResumeIA] = useState("");
  const [noteTexte, setNoteTexte] = useState("");
  const [docNom, setDocNom] = useState("");
  const [docType, setDocType] = useState("PDF");
  const [infosEdit, setInfosEdit] = useState<Record<string, string>>({});
  const [manquantesEdit, setManquantesEdit] = useState("");
  const [nouveauClientNom, setNouveauClientNom] = useState("");
  const [nouveauClientGsm, setNouveauClientGsm] = useState("");
  const [dossierIntitule, setDossierIntitule] = useState("");
  const [courseService, setCourseService] = useState("Livraison de documents");
  const [notifModele, setNotifModele] = useState(data.modelesNotification[0]?.nom ?? "");

  const conversations = useMemo(() => {
    return data.conversations
      .filter((c) => !c.archive)
      .filter((c) => (statutFixe ? c.statut === statutFixe : true))
      .filter((c) => (statutFiltre ? c.statut === statutFiltre : true))
      .filter(
        (c) =>
          !recherche ||
          c.clientNom.toLowerCase().includes(recherche.toLowerCase()) ||
          c.numero.includes(recherche) ||
          c.demandeNumero.toLowerCase().includes(recherche.toLowerCase()),
      )
      .sort((a, b) => b.derniereActivite.localeCompare(a.derniereActivite));
  }, [data.conversations, statutFixe, statutFiltre, recherche]);

  const conv = conversations.find((c) => c.id === selectionId) ?? conversations[0] ?? null;

  const selectionner = (c: Conversation) => {
    setSelectionId(c.id);
    if (c.nonLus > 0) patch("conversations", c.id, { nonLus: 0 });
  };

  const nowParts = () => ({ date: today(), heure: heureActuelle() });

  const envoyerMessage = (texte: string, auteur: "Opérateur" | "Agent IA" = "Opérateur") => {
    if (!conv || !texte.trim()) return;
    const { date, heure } = nowParts();
    const message = {
      id: uid("msg"),
      auteur,
      nom: auteur === "Opérateur" ? utilisateurCourant : "Agent ARCONDIS",
      texte,
      date,
      heure,
    };
    patch("conversations", conv.id, {
      messages: [...conv.messages, message],
      derniereActivite: heure,
    });
    log({
      entite: "Conversation WhatsApp",
      entiteId: conv.id,
      utilisateur: utilisateurCourant,
      action: auteur === "Opérateur" ? "Réponse envoyée" : "Message agent envoyé",
      ancienneValeur: "",
      nouvelleValeur: texte,
    });
  };

  const repondre = () => {
    envoyerMessage(reponse, "Opérateur");
    setReponse("");
  };

  const reprendreParHumain = () => {
    if (!conv) return;
    const { date, heure } = nowParts();
    const handoff = { id: uid("ho"), raison: motif as (typeof RAISONS_HANDOFF)[number], date, heure, operateur, resumeIA };
    patch("conversations", conv.id, {
      handoffs: [handoff, ...conv.handoffs],
      statut: "Intervention humaine",
      responsable: operateur,
    });
    log({
      entite: "Conversation WhatsApp",
      entiteId: conv.id,
      utilisateur: operateur,
      action: "Reprise par un opérateur humain",
      ancienneValeur: conv.statut,
      nouvelleValeur: `Intervention humaine — ${motif}`,
    });
    add("notifications", {
      id: uid("not"),
      type: "Intervention humaine",
      titre: "Intervention humaine requise",
      detail: `${conv.clientNom} — ${motif}`,
      date: `${fr(date)} ${heure}`,
      lien: "/backoffice/whatsapp",
      lue: false,
      gravite: "alerte",
    });
    setResumeIA("");
  };

  const ajouterNote = () => {
    if (!conv || !noteTexte.trim()) return;
    patch("conversations", conv.id, {
      notes: [{ id: uid("nt"), auteur: utilisateurCourant, texte: noteTexte, date: today() }, ...conv.notes],
    });
    log({
      entite: "Conversation WhatsApp",
      entiteId: conv.id,
      utilisateur: utilisateurCourant,
      action: "Note interne ajoutée",
      ancienneValeur: "",
      nouvelleValeur: noteTexte,
    });
    setNoteTexte("");
  };

  const ajouterDocument = () => {
    if (!conv || !docNom.trim()) return;
    const doc = { id: uid("doc"), nom: docNom, type: docType, date: today() };
    patch("conversations", conv.id, { documents: [...conv.documents, doc] });
    add("documents", {
      id: uid("DOC"),
      nom: docNom,
      type: docType,
      categorie: "Document dossier",
      clientId: conv.clientId,
      dossierId: conv.dossierId,
      courseId: conv.courseId,
      paiementId: "",
      date: today(),
      ajoutePar: utilisateurCourant,
      source: "WhatsApp",
      notes: `Ajouté depuis la conversation ${conv.id}`,
      archive: false,
    });
    log({
      entite: "Conversation WhatsApp",
      entiteId: conv.id,
      utilisateur: utilisateurCourant,
      action: "Document ajouté",
      ancienneValeur: "",
      nouvelleValeur: docNom,
    });
    setDocNom("");
    setDocType("PDF");
  };

  const ouvrirInfos = () => {
    if (!conv) return;
    setInfosEdit({ ...conv.infos });
    setManquantesEdit(conv.manquantes.join(", "));
    setInfosOpen(true);
  };

  const enregistrerInfos = () => {
    if (!conv) return;
    const manquantes = manquantesEdit
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    patch("conversations", conv.id, {
      infos: infosEdit,
      manquantes,
      statut: manquantes.length === 0 && conv.statut !== "Clôturée" ? "Informations complètes" : conv.statut,
    });
    log({
      entite: "Conversation WhatsApp",
      entiteId: conv.id,
      utilisateur: utilisateurCourant,
      action: "Informations modifiées",
      ancienneValeur: conv.manquantes.join(", ") || "—",
      nouvelleValeur: manquantes.join(", ") || "Informations complètes",
    });
    if (manquantes.length === 0) {
      add("notifications", {
        id: uid("not"),
        type: "Informations complètes",
        titre: "Demande prête pour traitement",
        detail: `${conv.clientNom} — ${conv.demandeNumero}`,
        date: `${fr(today())} ${heureActuelle()}`,
        lien: "/backoffice/whatsapp",
        lue: false,
        gravite: "info",
      });
    }
  };

  const creerClient = () => {
    if (!conv || !nouveauClientNom.trim()) return;
    const id = uid("CLI");
    add("clients", {
      id,
      code: id,
      raisonSociale: nouveauClientNom,
      type: "Entreprise",
      ice: "—",
      contactPrincipal: conv.contact,
      gsm: nouveauClientGsm || conv.numero,
      whatsapp: conv.numero,
      email: "",
      adresse: "",
      ville: "Casablanca",
      zone: "Zone A",
      frequenceFacturation: "Par course",
      conditionsPaiement: "Paiement immédiat",
      notes: `Créé depuis la conversation WhatsApp ${conv.id}.`,
      actif: true,
      archive: false,
      creeLe: today(),
      contacts: [
        { id: uid("CT"), nom: conv.contact, fonction: "—", gsm: conv.numero, email: "", type: "Décideur", actif: true },
      ],
    });
    patch("conversations", conv.id, { clientId: id });
    log({
      entite: "Client",
      entiteId: id,
      utilisateur: utilisateurCourant,
      action: "Client créé depuis WhatsApp",
      ancienneValeur: "",
      nouvelleValeur: nouveauClientNom,
    });
    setNouveauClientNom("");
    setNouveauClientGsm("");
  };

  const creerDossier = () => {
    if (!conv || !dossierIntitule.trim()) return;
    const id = uid("DOS");
    add("dossiers", {
      id,
      numero: id,
      intitule: dossierIntitule,
      clientId: conv.clientId,
      service: conv.infos["Type de demande"] ?? "Livraison de documents",
      responsable: utilisateurCourant,
      statut: "Ouvert",
      priorite: conv.infos["Priorité"] === "Urgente" ? "Haute" : "Normale",
      dateOuverture: today(),
      dateCloture: "",
      procedures: [],
      notes: `Créé depuis la conversation WhatsApp ${conv.id}.`,
      archive: false,
    });
    patch("conversations", conv.id, { dossierId: id });
    log({
      entite: "Dossier",
      entiteId: id,
      utilisateur: utilisateurCourant,
      action: "Dossier créé depuis WhatsApp",
      ancienneValeur: "",
      nouvelleValeur: dossierIntitule,
    });
    setDossierIntitule("");
  };

  const creerCourse = () => {
    if (!conv) return;
    const id = uid("CRS");
    const retrait: Destination = {
      id: uid("adr"),
      libelle: conv.infos["Retrait"] || "Adresse de retrait",
      ville: "Casablanca",
      zone: "Zone A",
      contact: conv.contact,
      gsm: conv.numero,
    };
    const destination: Destination = {
      id: uid("adr"),
      libelle: conv.infos["Destination"] || "Destination",
      ville: "Casablanca",
      zone: "Zone A",
      contact: conv.contact,
      gsm: conv.numero,
    };
    add("courses", {
      id,
      numero: id,
      clientId: conv.clientId,
      dossierId: conv.dossierId,
      demandeNumero: conv.demandeNumero,
      service: courseService,
      typeCourse: "Simple",
      priorite: conv.infos["Priorité"] === "Urgente" ? "Urgente" : "Normale",
      transport: "Moto",
      date: conv.infos["Date"] || today(),
      trancheHoraire: conv.infos["Tranche horaire"] || "Matin (08h – 12h)",
      coursierId: "",
      retrait,
      destinations: conv.infos["Destination"] ? [destination] : [],
      statut: "À affecter",
      kmDepart: 0,
      kmArrivee: 0,
      kmMission: 0,
      kmVide: 0,
      heureArrivee: "",
      heureDepart: "",
      attenteMinutes: 0,
      fraisSupplementaires: 0,
      nuit: false,
      weekend: false,
      validationClient: { demandeeLe: "", reponse: "", commentaire: "", heure: "" },
      factureId: "",
      notes: `Créée depuis la conversation WhatsApp ${conv.id}.`,
      archive: false,
    });
    patch("conversations", conv.id, { courseId: id });
    log({
      entite: "Course",
      entiteId: id,
      utilisateur: utilisateurCourant,
      action: "Course créée depuis WhatsApp",
      ancienneValeur: "",
      nouvelleValeur: id,
    });
    add("notifications", {
      id: uid("not"),
      type: "Nouvelle course",
      titre: "Course créée depuis WhatsApp",
      detail: `${id} — ${conv.clientNom}`,
      date: `${fr(today())} ${heureActuelle()}`,
      lien: "/backoffice/courses",
      lue: false,
      gravite: "info",
    });
  };

  const cloturer = () => {
    if (!conv) return;
    patch("conversations", conv.id, { statut: "Clôturée" });
    log({
      entite: "Conversation WhatsApp",
      entiteId: conv.id,
      utilisateur: utilisateurCourant,
      action: "Conversation clôturée",
      ancienneValeur: conv.statut,
      nouvelleValeur: "Clôturée",
    });
  };

  const envoyerNotification = () => {
    if (!conv || !notifModele) return;
    const modele = data.modelesNotification.find((m) => m.nom === notifModele);
    envoyerMessage(modele?.description || notifModele, "Agent IA");
    log({
      entite: "Conversation WhatsApp",
      entiteId: conv.id,
      utilisateur: utilisateurCourant,
      action: `Modèle envoyé : ${notifModele}`,
      ancienneValeur: "",
      nouvelleValeur: modele?.description ?? "",
    });
  };

  const demanderValidation = () => {
    if (!conv) return;
    const { date, heure } = nowParts();
    envoyerMessage(
      "La prestation liée à votre demande a été réalisée. Merci de confirmer sa bonne exécution (Valider / Signaler un problème).",
      "Agent IA",
    );
    add("messages", {
      id: uid("MSG"),
      clientId: conv.clientId,
      courseId: conv.courseId,
      modele: "Validation demandée",
      texte: "La prestation liée à votre demande a été réalisée. Merci de confirmer sa bonne exécution.",
      date: fr(date),
      heure,
      canal: "WhatsApp",
      reponse: "",
      commentaire: "",
    });
    log({
      entite: "Conversation WhatsApp",
      entiteId: conv.id,
      utilisateur: utilisateurCourant,
      action: "Validation client demandée",
      ancienneValeur: "",
      nouvelleValeur: conv.courseId || "—",
    });
  };

  const messagesValidationEnAttente = conv
    ? data.messages.filter((m) => m.courseId === conv.courseId && conv.courseId && m.modele === "Validation demandée" && !m.reponse)
    : [];

  const traiterValidation = (messageId: string, reponseValidation: "Valider" | "Signaler un problème") => {
    if (!conv) return;
    patch("messages", messageId, { reponse: reponseValidation });
    envoyerMessage(
      reponseValidation === "Valider" ? "Client : Valider — prestation confirmée." : "Client : Signaler un problème.",
      "Opérateur",
    );
    if (reponseValidation === "Valider" && conv.courseId) {
      patch("courses", conv.courseId, {
        statut: "Validée client",
        validationClient: { demandeeLe: today(), reponse: "Validée", commentaire: "", heure: heureActuelle() },
      });
    }
    log({
      entite: "Conversation WhatsApp",
      entiteId: conv.id,
      utilisateur: utilisateurCourant,
      action: `Réponse client au message de validation : ${reponseValidation}`,
      ancienneValeur: "",
      nouvelleValeur: reponseValidation,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr_320px]">
      <Panel titre="Conversations" className="lg:sticky lg:top-4">
        <div className="space-y-3">
          <SearchInput value={recherche} onChange={setRecherche} placeholder="Client, n° demande…" />
          {!statutFixe && (
            <SelectFilter value={statutFiltre} onChange={setStatutFiltre} options={STATUTS_CONVERSATION} label="Statut" />
          )}
          <ul className="max-h-[60vh] space-y-1 overflow-y-auto">
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => selectionner(c)}
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                    conv?.id === c.id ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-surface/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium text-navy">{c.clientNom}</span>
                    {c.nonLus > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                        {c.nonLus}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {c.messages[c.messages.length - 1]?.texte ?? "—"}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <Statut ton={toneConversation(c.statut)}>{c.statut}</Statut>
                    <span className="text-[11px] text-muted-foreground">{c.derniereActivite}</span>
                  </div>
                </button>
              </li>
            ))}
            {conversations.length === 0 && (
              <p className="px-2 py-8 text-center text-sm text-muted-foreground">Aucune conversation.</p>
            )}
          </ul>
        </div>
      </Panel>

      {!conv ? (
        <Panel>
          <p className="py-16 text-center text-sm text-muted-foreground">{titreVide}</p>
        </Panel>
      ) : (
        <Panel
          titre={`${conv.clientNom} — ${conv.numero}`}
          actions={<Statut ton={toneConversation(conv.statut)}>{conv.statut}</Statut>}
        >
          <div className="flex max-h-[55vh] flex-col gap-2 overflow-y-auto pr-1">
            {conv.messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  m.auteur === "Client"
                    ? "self-start bg-surface text-foreground"
                    : m.auteur === "Agent IA"
                      ? "self-end bg-primary/10 text-navy"
                      : "self-end bg-primary text-primary-foreground"
                }`}
              >
                <p className="mb-0.5 text-[11px] font-semibold opacity-80">{m.nom}</p>
                <p>{m.texte}</p>
                <p className="mt-1 text-right text-[10px] opacity-70">
                  {m.date} {m.heure}
                </p>
              </div>
            ))}
          </div>

          {conv.statut !== "Clôturée" && (
            <div className="mt-3 flex items-end gap-2 border-t border-border pt-3">
              <div className="flex-1">
                <ChampTexte label="Répondre" value={reponse} onChange={setReponse} rows={2} />
              </div>
              <Button onClick={repondre} disabled={!reponse.trim()}>
                Envoyer
              </Button>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
            <Button size="sm" variant="outline" onClick={() => setHandoffOpen(true)}>
              Reprendre par humain
            </Button>
            <Button size="sm" variant="outline" onClick={() => setNoteOpen(true)}>
              Ajouter note
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDocOpen(true)}>
              Ajouter document
            </Button>
            <Button size="sm" variant="outline" onClick={ouvrirInfos}>
              Modifier informations
            </Button>
            <Button size="sm" variant="outline" onClick={() => setNotifOpen(true)}>
              Envoyer un modèle
            </Button>
            <Button size="sm" variant="outline" onClick={demanderValidation} disabled={!conv.courseId}>
              Demander validation client
            </Button>
            {conv.statut !== "Clôturée" && (
              <Button size="sm" variant="destructive" onClick={cloturer}>
                Clôturer conversation
              </Button>
            )}
          </div>

          {messagesValidationEnAttente.length > 0 && (
            <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
              <p className="mb-2 font-medium text-amber-800">Validation client en attente</p>
              {messagesValidationEnAttente.map((m) => (
                <div key={m.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-amber-800">{m.texte}</span>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => traiterValidation(m.id, "Valider")}>
                      Valider
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => traiterValidation(m.id, "Signaler un problème")}>
                      Signaler un problème
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {conv && (
        <div className="space-y-4">
          <Panel titre="Contexte">
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Client : </span>
                {conv.clientId ? (
                  <Link to="/backoffice/clients" className="text-primary hover:underline">
                    {conv.clientNom}
                  </Link>
                ) : (
                  <span className="text-amber-700">{conv.clientNom} (non créé)</span>
                )}
              </p>
              <p>
                <span className="text-muted-foreground">Contact : </span>
                {conv.contact}
              </p>
              <p>
                <span className="text-muted-foreground">Demande : </span>
                {conv.demandeNumero || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Dossier : </span>
                {conv.dossierId || "Non créé"}
              </p>
              <p>
                <span className="text-muted-foreground">Course : </span>
                {conv.courseId || "Non créée"}
              </p>
              <p>
                <span className="text-muted-foreground">Responsable : </span>
                {conv.responsable}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {!conv.clientId && (
                <Button size="sm" variant="outline" onClick={() => setClientOpen(true)}>
                  Créer client
                </Button>
              )}
              {!conv.dossierId && (
                <Button size="sm" variant="outline" onClick={() => setDossierOpen(true)}>
                  Créer dossier
                </Button>
              )}
              {!conv.courseId && (
                <Button size="sm" variant="outline" onClick={() => setCourseOpen(true)}>
                  Créer course
                </Button>
              )}
            </div>
          </Panel>

          <Panel titre="Informations collectées">
            <ul className="space-y-1 text-sm">
              {Object.entries(conv.infos).map(([k, v]) => (
                <li key={k}>
                  <span className="text-muted-foreground">{k} : </span>
                  {v}
                </li>
              ))}
            </ul>
            <div className="mt-3">
              {conv.manquantes.length === 0 ? (
                <Statut ton="border-emerald-300 bg-emerald-50 text-emerald-700">Informations complètes</Statut>
              ) : (
                <div>
                  <p className="mb-1 text-xs font-medium text-amber-700">Informations manquantes</p>
                  <ul className="list-inside list-disc text-xs text-amber-700">
                    {conv.manquantes.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Panel>

          <Panel titre="Documents">
            <ul className="space-y-1 text-sm">
              {conv.documents.map((d) => (
                <li key={d.id} className="flex justify-between text-xs">
                  <span>{d.nom}</span>
                  <span className="text-muted-foreground">{d.date}</span>
                </li>
              ))}
              {conv.documents.length === 0 && <p className="text-sm text-muted-foreground">Aucun document.</p>}
            </ul>
          </Panel>

          <Panel titre="Résumé IA">
            <p className="text-sm text-muted-foreground">{conv.resumeIA}</p>
          </Panel>

          <Panel titre="Notes internes">
            <ul className="space-y-2 text-sm">
              {conv.notes.map((n) => (
                <li key={n.id} className="rounded-md border border-border bg-surface/60 px-2 py-1.5 text-xs">
                  <p className="font-medium text-navy">{n.auteur}</p>
                  <p>{n.texte}</p>
                  <p className="text-muted-foreground">{n.date}</p>
                </li>
              ))}
              {conv.notes.length === 0 && <p className="text-sm text-muted-foreground">Aucune note.</p>}
            </ul>
          </Panel>

          {conv.handoffs.length > 0 && (
            <Panel titre="Historique des reprises">
              <ul className="space-y-2 text-xs">
                {conv.handoffs.map((h) => (
                  <li key={h.id} className="rounded-md border border-border bg-surface/60 px-2 py-1.5">
                    <p className="font-medium text-navy">
                      {h.motif ?? h.raison} — {h.operateur}
                    </p>
                    <p className="text-muted-foreground">
                      {h.date} {h.heure}
                    </p>
                    <p>{h.resumeIA}</p>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      )}

      {conv && (
        <>
          <FormDialog
            open={handoffOpen}
            onOpenChange={setHandoffOpen}
            titre="Reprendre par un opérateur humain"
            onSubmit={reprendreParHumain}
            submitLabel="Confirmer la reprise"
          >
            <ChampSelect label="Motif" value={motif} onChange={setMotif} options={RAISONS_HANDOFF} />
            <Champ label="Opérateur" value={operateur} onChange={setOperateur} />
            <ChampTexte label="Résumé IA à transmettre" value={resumeIA} onChange={setResumeIA} />
          </FormDialog>

          <FormDialog open={noteOpen} onOpenChange={setNoteOpen} titre="Ajouter une note interne" onSubmit={ajouterNote}>
            <ChampTexte label="Note" value={noteTexte} onChange={setNoteTexte} />
          </FormDialog>

          <FormDialog open={docOpen} onOpenChange={setDocOpen} titre="Ajouter un document" onSubmit={ajouterDocument}>
            <Champ label="Nom du document" value={docNom} onChange={setDocNom} />
            <ChampSelect label="Type" value={docType} onChange={setDocType} options={["PDF", "Image", "Word", "Autre"]} />
          </FormDialog>

          <FormDialog
            open={infosOpen}
            onOpenChange={setInfosOpen}
            titre="Modifier les informations collectées"
            onSubmit={enregistrerInfos}
            large
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Object.keys(infosEdit).map((k) => (
                <Champ
                  key={k}
                  label={k}
                  value={infosEdit[k] ?? ""}
                  onChange={(v) => setInfosEdit((prev) => ({ ...prev, [k]: v }))}
                />
              ))}
            </div>
            <ChampTexte
              label="Informations manquantes (séparées par des virgules)"
              value={manquantesEdit}
              onChange={setManquantesEdit}
            />
          </FormDialog>

          <FormDialog open={clientOpen} onOpenChange={setClientOpen} titre="Créer le client" onSubmit={creerClient}>
            <Champ label="Raison sociale / Nom" value={nouveauClientNom} onChange={setNouveauClientNom} />
            <Champ label="GSM / WhatsApp" value={nouveauClientGsm || conv.numero} onChange={setNouveauClientGsm} />
          </FormDialog>

          <FormDialog open={dossierOpen} onOpenChange={setDossierOpen} titre="Créer le dossier" onSubmit={creerDossier}>
            <Champ label="Intitulé du dossier" value={dossierIntitule} onChange={setDossierIntitule} />
          </FormDialog>

          <FormDialog open={courseOpen} onOpenChange={setCourseOpen} titre="Créer la course" onSubmit={creerCourse}>
            <Champ label="Service" value={courseService} onChange={setCourseService} />
            <p className="text-xs text-muted-foreground">
              Retrait et destination sont pré-remplis à partir des informations collectées.
            </p>
          </FormDialog>

          <FormDialog
            open={notifOpen}
            onOpenChange={setNotifOpen}
            titre="Envoyer un modèle de notification"
            onSubmit={envoyerNotification}
            submitLabel="Envoyer"
          >
            <ChampSelect
              label="Modèle"
              value={notifModele}
              onChange={setNotifModele}
              options={data.modelesNotification.map((m) => m.nom)}
            />
          </FormDialog>
        </>
      )}
    </div>
  );
}
