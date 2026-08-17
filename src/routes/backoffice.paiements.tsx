import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useBO, useLookups } from "@/lib/bo-store";
import type { Paiement, StatutPaiement } from "@/lib/bo-data";
import { MOYENS_PAIEMENT, STATUTS_PAIEMENT, dh, fr, today, uid } from "@/lib/bo-data";
import { Button } from "@/components/ui/button";
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
  Historique,
  Detail,
  useDialog,
  type Colonne,
} from "@/components/bo/kit";

export const Route = createFileRoute("/backoffice/paiements")({
  head: () => ({
    meta: [
      { title: "Paiements & Chèques — Back-Office ARCONDIS" },
      {
        name: "description",
        content: "Suivi des chèques et paiements fournisseurs : réception, affectation, validation.",
      },
    ],
  }),
  component: PaiementsPage,
});

function heureActuelle() {
  return new Date().toTimeString().slice(0, 5);
}

const PAIEMENT_VIDE = (): Omit<Paiement, "id" | "numero"> => ({
  clientId: "",
  dossierId: "",
  courseId: "",
  fournisseurId: "",
  montant: 0,
  devise: "MAD",
  moyen: "Chèque",
  numeroCheque: "",
  banque: "",
  dateCheque: "",
  coursierId: "",
  datePrevue: today(),
  datePaiement: "",
  heure: "",
  justificatif: "",
  photoRecu: "",
  documentId: "",
  notes: "",
  statut: "À recevoir",
  archive: false,
});

function PaiementsPage() {
  const { data, add, patch, toggleArchive, log } = useBO();
  const lk = useLookups();

  const [recherche, setRecherche] = useState("");
  const [statutF, setStatutF] = useState("");
  const [moyenF, setMoyenF] = useState("");
  const [clientF, setClientF] = useState("");
  const [fournisseurF, setFournisseurF] = useState("");
  const [coursierF, setCoursierF] = useState("");
  const [periodeDebut, setPeriodeDebut] = useState("");
  const [periodeFin, setPeriodeFin] = useState("");
  const [voirArchives, setVoirArchives] = useState(false);

  const paiements = useMemo(() => {
    return data.paiements.filter((p) => {
      if (p.archive !== voirArchives) return false;
      if (statutF && p.statut !== statutF) return false;
      if (moyenF && p.moyen !== moyenF) return false;
      if (clientF && p.clientId !== clientF) return false;
      if (fournisseurF && p.fournisseurId !== fournisseurF) return false;
      if (coursierF && p.coursierId !== coursierF) return false;
      if (periodeDebut && p.datePrevue && p.datePrevue < periodeDebut) return false;
      if (periodeFin && p.datePrevue && p.datePrevue > periodeFin) return false;
      if (
        recherche &&
        !`${p.numero} ${p.numeroCheque} ${p.banque}`.toLowerCase().includes(recherche.toLowerCase())
      )
        return false;
      return true;
    });
  }, [data.paiements, recherche, statutF, moyenF, clientF, fournisseurF, coursierF, periodeDebut, periodeFin, voirArchives]);

  const stats = useMemo(() => {
    const actifs = data.paiements.filter((p) => !p.archive);
    const aRecevoir = actifs.filter((p) => p.statut === "À recevoir");
    const aPayer = actifs.filter((p) => p.statut === "À payer");
    const enCours = actifs.filter((p) => ["Affecté au coursier", "En cours"].includes(p.statut));
    const valides = actifs.filter((p) => p.statut === "Validé");
    return {
      aRecevoir: aRecevoir.length,
      aPayer: aPayer.length,
      enCours: enCours.length,
      valides: valides.length,
      montantValide: valides.reduce((s, p) => s + p.montant, 0),
      montantAttente: [...aRecevoir, ...aPayer, ...enCours].reduce((s, p) => s + p.montant, 0),
    };
  }, [data.paiements]);

  const creerDialog = useDialog<Paiement | null>();
  const detailDialog = useDialog<Paiement>();
  const [form, setForm] = useState<Omit<Paiement, "id" | "numero">>(PAIEMENT_VIDE());

  function ouvrirCreation() {
    setForm(PAIEMENT_VIDE());
    creerDialog.ouvrir(null);
  }

  function ouvrirEdition(p: Paiement) {
    setForm({ ...p });
    creerDialog.ouvrir(p);
  }

  function enregistrer() {
    if (creerDialog.item) {
      patch("paiements", creerDialog.item.id, form);
      log({
        entite: "Paiement",
        entiteId: creerDialog.item.id,
        utilisateur: "Back-Office",
        action: "Modification du paiement",
        ancienneValeur: "",
        nouvelleValeur: `${form.montant} ${form.devise}`,
      });
    } else {
      const id = uid("PAY");
      add("paiements", { id, numero: id, ...form });
      log({
        entite: "Paiement",
        entiteId: id,
        utilisateur: "Back-Office",
        action: "Création du paiement",
        ancienneValeur: "",
        nouvelleValeur: `${form.montant} ${form.devise}`,
      });
    }
  }

  const colonnes: Colonne<Paiement>[] = [
    { cle: "numero", titre: "N° paiement", rendu: (p) => <span className="font-mono text-xs">{p.numero}</span> },
    { cle: "client", titre: "Client", rendu: (p) => lk.clientNom(p.clientId) },
    { cle: "fournisseur", titre: "Fournisseur", rendu: (p) => lk.fournisseurNom(p.fournisseurId) },
    { cle: "montant", titre: "Montant", rendu: (p) => dh(p.montant, p.devise), align: "right" },
    { cle: "moyen", titre: "Moyen", rendu: (p) => p.moyen },
    { cle: "coursier", titre: "Coursier", rendu: (p) => lk.coursierNom(p.coursierId) },
    { cle: "prevue", titre: "Date prévue", rendu: (p) => fr(p.datePrevue) },
    { cle: "statut", titre: "Statut", rendu: (p) => <Statut ton={tonStatut(p.statut)}>{p.statut}</Statut> },
    {
      cle: "actions",
      titre: "Actions",
      align: "right",
      rendu: (p) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="outline" onClick={() => detailDialog.ouvrir(p)}>
            Voir
          </Button>
          <Button size="sm" variant="outline" onClick={() => ouvrirEdition(p)}>
            Modifier
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        titre="Paiements & Chèques"
        sous="Suivi des chèques et paiements fournisseurs, de la réception à la validation."
        actions={<Button onClick={ouvrirCreation}>Nouveau paiement</Button>}
      />

      <Grille cols={3}>
        <StatCard label="À recevoir" valeur={stats.aRecevoir} ton="alerte" />
        <StatCard label="À payer" valeur={stats.aPayer} ton="alerte" />
        <StatCard label="En cours" valeur={stats.enCours} />
        <StatCard label="Validés" valeur={stats.valides} ton="positif" />
        <StatCard label="Montant validé" valeur={dh(stats.montantValide)} ton="positif" />
        <StatCard label="Montant en attente" valeur={dh(stats.montantAttente)} ton="alerte" />
      </Grille>

      <Panel titre="Recherche & filtres">
        <div className="space-y-2">
          <FilterBar>
            <SearchInput value={recherche} onChange={setRecherche} placeholder="N° paiement, chèque, banque…" />
            <SelectFilter value={statutF} onChange={setStatutF} options={STATUTS_PAIEMENT} label="Statut" />
            <SelectFilter value={moyenF} onChange={setMoyenF} options={MOYENS_PAIEMENT} label="Moyen" />
            <Button variant={voirArchives ? "default" : "outline"} size="sm" onClick={() => setVoirArchives((v) => !v)}>
              {voirArchives ? "Voir actifs" : "Voir archivés"}
            </Button>
          </FilterBar>
          <FilterBar>
            <SelectFilter
              value={clientF}
              onChange={setClientF}
              options={data.clients.map((c) => c.raisonSociale)}
              label="Client"
            />
            <SelectFilter
              value={fournisseurF}
              onChange={setFournisseurF}
              options={data.fournisseurs.map((f) => f.raisonSociale)}
              label="Fournisseur"
            />
            <SelectFilter
              value={coursierF}
              onChange={setCoursierF}
              options={data.coursiers.map((c) => c.nom)}
              label="Coursier"
            />
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Période</span>
              <input
                type="date"
                value={periodeDebut}
                onChange={(e) => setPeriodeDebut(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              />
              <span>—</span>
              <input
                type="date"
                value={periodeFin}
                onChange={(e) => setPeriodeFin(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              />
            </div>
          </FilterBar>
        </div>
      </Panel>

      <DataTable
        colonnes={colonnes.map((c) =>
          c.cle === "client"
            ? { ...c, rendu: (p: Paiement) => lk.clientNom(p.clientId) }
            : c.cle === "fournisseur"
              ? { ...c, rendu: (p: Paiement) => lk.fournisseurNom(p.fournisseurId) }
              : c.cle === "coursier"
                ? { ...c, rendu: (p: Paiement) => lk.coursierNom(p.coursierId) }
                : c,
        )}
        lignes={paiements.filter((p) => {
          if (!clientF) return true;
          return lk.clientNom(p.clientId) === clientF;
        }).filter((p) => (!fournisseurF ? true : lk.fournisseurNom(p.fournisseurId) === fournisseurF))
          .filter((p) => (!coursierF ? true : lk.coursierNom(p.coursierId) === coursierF))}
        vide="Aucun paiement trouvé."
      />

      <FormDialog
        open={creerDialog.open}
        onOpenChange={creerDialog.setOpen}
        titre={creerDialog.item ? "Modifier le paiement" : "Nouveau paiement"}
        onSubmit={enregistrer}
        submitLabel={creerDialog.item ? "Enregistrer" : "Créer"}
        large
      >
        <Grille>
          <ChampSelect
            label="Client"
            value={form.clientId}
            onChange={(v) => setForm({ ...form, clientId: v })}
            options={data.clients.map((c) => ({ value: c.id, label: c.raisonSociale }))}
          />
          <ChampSelect
            label="Dossier"
            value={form.dossierId}
            onChange={(v) => setForm({ ...form, dossierId: v })}
            options={data.dossiers.map((d) => ({ value: d.id, label: d.numero }))}
          />
          <ChampSelect
            label="Course"
            value={form.courseId}
            onChange={(v) => setForm({ ...form, courseId: v })}
            options={data.courses.map((c) => ({ value: c.id, label: c.numero }))}
          />
          <ChampSelect
            label="Fournisseur"
            value={form.fournisseurId}
            onChange={(v) => setForm({ ...form, fournisseurId: v })}
            options={data.fournisseurs.map((f) => ({ value: f.id, label: f.raisonSociale }))}
          />
          <Champ label="Montant" type="number" value={form.montant} onChange={(v) => setForm({ ...form, montant: Number(v) || 0 })} />
          <Champ label="Devise" value={form.devise} onChange={(v) => setForm({ ...form, devise: v })} />
          <ChampSelect
            label="Moyen de paiement"
            value={form.moyen}
            onChange={(v) => setForm({ ...form, moyen: v as Paiement["moyen"] })}
            options={MOYENS_PAIEMENT}
          />
          <Champ label="N° chèque" value={form.numeroCheque} onChange={(v) => setForm({ ...form, numeroCheque: v })} />
          <Champ label="Banque" value={form.banque} onChange={(v) => setForm({ ...form, banque: v })} />
          <Champ label="Date du chèque" type="date" value={form.dateCheque} onChange={(v) => setForm({ ...form, dateCheque: v })} />
          <ChampSelect
            label="Coursier"
            value={form.coursierId}
            onChange={(v) => setForm({ ...form, coursierId: v })}
            options={data.coursiers.map((c) => ({ value: c.id, label: c.nom }))}
          />
          <Champ label="Date prévue" type="date" value={form.datePrevue} onChange={(v) => setForm({ ...form, datePrevue: v })} />
          <Champ label="Date de paiement" type="date" value={form.datePaiement} onChange={(v) => setForm({ ...form, datePaiement: v })} />
          <Champ label="Heure" type="time" value={form.heure} onChange={(v) => setForm({ ...form, heure: v })} />
          <ChampSelect
            label="Statut"
            value={form.statut}
            onChange={(v) => setForm({ ...form, statut: v as StatutPaiement })}
            options={STATUTS_PAIEMENT}
          />
        </Grille>
        <ChampTexte label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
      </FormDialog>

      {detailDialog.item && (
        <PaiementDetail paiement={detailDialog.item} open={detailDialog.open} onOpenChange={detailDialog.setOpen} />
      )}
    </div>
  );
}

function PaiementDetail({
  paiement,
  open,
  onOpenChange,
}: {
  paiement: Paiement;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data, add, patch, toggleArchive, log } = useBO();
  const lk = useLookups();
  const p = data.paiements.find((x) => x.id === paiement.id) ?? paiement;
  const historique = data.audit.filter((a) => a.entiteId === p.id);

  const [affectDialog, setAffectDialog] = useState(false);
  const [coursierChoisi, setCoursierChoisi] = useState(p.coursierId);
  const [justifDialog, setJustifDialog] = useState(false);
  const [justifTexte, setJustifTexte] = useState("");
  const [photoDialog, setPhotoDialog] = useState(false);
  const [photoNom, setPhotoNom] = useState("");
  const [docDialog, setDocDialog] = useState(false);
  const [docNom, setDocNom] = useState("");

  function enregistrerLog(action: string, ancienne: string, nouvelle: string) {
    log({ entite: "Paiement", entiteId: p.id, utilisateur: "Back-Office", action, ancienneValeur: ancienne, nouvelleValeur: nouvelle });
  }

  function changerStatut(statut: StatutPaiement, extra: Partial<Paiement> = {}, action?: string) {
    patch("paiements", p.id, { statut, ...extra });
    enregistrerLog(action ?? `Passage au statut « ${statut} »`, p.statut, statut);
  }

  function affecterCoursier() {
    if (!coursierChoisi) return;
    const reaffectation = !!p.coursierId;
    patch("paiements", p.id, { coursierId: coursierChoisi, statut: "Affecté au coursier" });
    enregistrerLog(
      reaffectation ? "Réaffectation du coursier" : "Affectation du coursier",
      lk.coursierNom(p.coursierId),
      lk.coursierNom(coursierChoisi),
    );
    setAffectDialog(false);
  }

  function marquerChequeRecu() {
    changerStatut("Chèque reçu", {}, "Chèque marqué comme reçu");
  }

  function marquerPaye() {
    changerStatut("Paiement effectué", { datePaiement: today(), heure: heureActuelle() }, "Paiement marqué comme effectué");
  }

  function ajouterJustificatif() {
    if (!justifTexte) return;
    patch("paiements", p.id, { justificatif: justifTexte, statut: "Justificatif reçu" });
    enregistrerLog("Ajout du justificatif", p.justificatif, justifTexte);
    setJustifTexte("");
    setJustifDialog(false);
  }

  function ajouterPhoto() {
    if (!photoNom) return;
    patch("paiements", p.id, { photoRecu: photoNom });
    add("documents", {
      id: uid("DOC"),
      nom: photoNom,
      type: "Photo",
      categorie: "Photo",
      clientId: p.clientId,
      dossierId: p.dossierId,
      courseId: p.courseId,
      paiementId: p.id,
      date: today(),
      ajoutePar: "Back-Office",
      source: "Back-Office",
      notes: "",
      archive: false,
    });
    enregistrerLog("Ajout d'une photo de reçu", "", photoNom);
    setPhotoNom("");
    setPhotoDialog(false);
  }

  function ajouterDocument() {
    if (!docNom) return;
    const id = uid("DOC");
    add("documents", {
      id,
      nom: docNom,
      type: docNom.split(".").pop()?.toUpperCase() || "Fichier",
      categorie: "Justificatif",
      clientId: p.clientId,
      dossierId: p.dossierId,
      courseId: p.courseId,
      paiementId: p.id,
      date: today(),
      ajoutePar: "Back-Office",
      source: "Back-Office",
      notes: "",
      archive: false,
    });
    patch("paiements", p.id, { documentId: id });
    enregistrerLog("Ajout d'un document", "", docNom);
    setDocNom("");
    setDocDialog(false);
  }

  function valider() {
    changerStatut("Validé", {}, "Validation du paiement");
  }

  function annuler() {
    changerStatut("Annulé", {}, "Annulation du paiement");
  }

  return (
    <>
      <FormDialog open={open} onOpenChange={onOpenChange} titre={`Paiement ${p.numero}`} large>
        <div className="space-y-4">
          <Grille cols={3}>
            <Detail label="Client">{lk.clientNom(p.clientId)}</Detail>
            <Detail label="Dossier">{lk.dossierNom(p.dossierId)}</Detail>
            <Detail label="Fournisseur">{lk.fournisseurNom(p.fournisseurId)}</Detail>
            <Detail label="Montant">{dh(p.montant, p.devise)}</Detail>
            <Detail label="Moyen">{p.moyen}</Detail>
            <Detail label="N° chèque">{p.numeroCheque}</Detail>
            <Detail label="Banque">{p.banque}</Detail>
            <Detail label="Date du chèque">{p.dateCheque ? fr(p.dateCheque) : "—"}</Detail>
            <Detail label="Coursier">{lk.coursierNom(p.coursierId)}</Detail>
            <Detail label="Date prévue">{fr(p.datePrevue)}</Detail>
            <Detail label="Date de paiement">{p.datePaiement ? fr(p.datePaiement) : "—"}</Detail>
            <Detail label="Heure">{p.heure || "—"}</Detail>
            <Detail label="Justificatif">{p.justificatif || "—"}</Detail>
            <Detail label="Photo du reçu">{p.photoRecu || "—"}</Detail>
            <Detail label="Document">{p.documentId || "—"}</Detail>
            <Detail label="Statut">
              <Statut ton={tonStatut(p.statut)}>{p.statut}</Statut>
            </Detail>
          </Grille>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Notes</p>
            <p className="mt-1 text-sm text-foreground">{p.notes || "—"}</p>
          </div>

          <div className="flex flex-wrap gap-2 border-y border-border py-3">
            <Button size="sm" variant="outline" onClick={() => setAffectDialog(true)}>
              {p.coursierId ? "Réaffecter" : "Affecter un coursier"}
            </Button>
            <Button size="sm" variant="outline" onClick={marquerChequeRecu}>
              Marquer chèque reçu
            </Button>
            <Button size="sm" variant="outline" onClick={marquerPaye}>
              Marquer payé
            </Button>
            <Button size="sm" variant="outline" onClick={() => setJustifDialog(true)}>
              Ajouter justificatif
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPhotoDialog(true)}>
              Ajouter photo
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDocDialog(true)}>
              Ajouter document
            </Button>
            <Button size="sm" onClick={valider}>
              Valider
            </Button>
            <Button size="sm" variant="destructive" onClick={annuler}>
              Annuler
            </Button>
            <Button
              size="sm"
              variant={p.archive ? "outline" : "destructive"}
              onClick={() => {
                toggleArchive("paiements", p.id);
                enregistrerLog(p.archive ? "Restauration du paiement" : "Archivage du paiement", "", "");
              }}
            >
              {p.archive ? "Restaurer" : "Archiver"}
            </Button>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-navy">Historique</p>
            <Historique
              items={historique.map((h) => ({
                id: h.id,
                date: h.date,
                heure: h.heure,
                utilisateur: h.utilisateur,
                action: h.action,
                ancienne: h.ancienneValeur,
                nouvelle: h.nouvelleValeur,
              }))}
            />
          </div>
        </div>
      </FormDialog>

      <FormDialog open={affectDialog} onOpenChange={setAffectDialog} titre="Affecter un coursier" onSubmit={affecterCoursier} submitLabel="Affecter">
        <ChampSelect
          label="Coursier"
          value={coursierChoisi}
          onChange={setCoursierChoisi}
          options={data.coursiers.map((c) => ({ value: c.id, label: c.nom }))}
        />
      </FormDialog>

      <FormDialog open={justifDialog} onOpenChange={setJustifDialog} titre="Ajouter un justificatif" onSubmit={ajouterJustificatif} submitLabel="Ajouter">
        <ChampTexte label="Référence du justificatif" value={justifTexte} onChange={setJustifTexte} />
      </FormDialog>

      <FormDialog open={photoDialog} onOpenChange={setPhotoDialog} titre="Ajouter une photo du reçu" onSubmit={ajouterPhoto} submitLabel="Ajouter">
        <Champ label="Nom du fichier photo" value={photoNom} onChange={setPhotoNom} />
      </FormDialog>

      <FormDialog open={docDialog} onOpenChange={setDocDialog} titre="Ajouter un document" onSubmit={ajouterDocument} submitLabel="Ajouter">
        <Champ label="Nom du document" value={docNom} onChange={setDocNom} />
      </FormDialog>
    </>
  );
}
