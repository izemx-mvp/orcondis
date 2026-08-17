import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useBO } from "@/lib/bo-store";
import type { Fournisseur, Paiement } from "@/lib/bo-data";
import { dh, fr, today, uid } from "@/lib/bo-data";
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
  ChampCase,
  FormDialog,
  Grille,
  Onglets,
  Historique,
  Detail,
  useDialog,
  type Colonne,
} from "@/components/bo/kit";

export const Route = createFileRoute("/backoffice/fournisseurs")({
  head: () => ({
    meta: [
      { title: "Fournisseurs & Paiements — Back-Office ARCONDIS" },
      {
        name: "description",
        content: "Gestion des fournisseurs ARCONDIS : coordonnées, contacts, documents et paiements liés.",
      },
    ],
  }),
  component: FournisseursPage,
});

const FOURNISSEUR_VIDE: Omit<Fournisseur, "id"> = {
  code: "",
  raisonSociale: "",
  contact: "",
  gsm: "",
  email: "",
  adresse: "",
  ville: "",
  zone: "",
  conditions: "",
  notes: "",
  actif: true,
  archive: false,
};

function FournisseursPage() {
  const { data, add, patch, toggleArchive, log } = useBO();

  const [recherche, setRecherche] = useState("");
  const [ville, setVille] = useState("");
  const [zone, setZone] = useState("");
  const [actifF, setActifF] = useState("");
  const [voirArchives, setVoirArchives] = useState(false);

  const villes = useMemo(
    () => Array.from(new Set(data.fournisseurs.map((f) => f.ville).filter(Boolean))).sort(),
    [data.fournisseurs],
  );
  const zones = useMemo(
    () => Array.from(new Set(data.fournisseurs.map((f) => f.zone).filter(Boolean))).sort(),
    [data.fournisseurs],
  );

  const fournisseurs = useMemo(() => {
    return data.fournisseurs.filter((f) => {
      if (f.archive !== voirArchives) return false;
      if (ville && f.ville !== ville) return false;
      if (zone && f.zone !== zone) return false;
      if (actifF && (actifF === "Actif" ? !f.actif : f.actif)) return false;
      if (
        recherche &&
        !`${f.code} ${f.raisonSociale} ${f.contact} ${f.email}`.toLowerCase().includes(recherche.toLowerCase())
      )
        return false;
      return true;
    });
  }, [data.fournisseurs, recherche, ville, zone, actifF, voirArchives]);

  const stats = useMemo(() => {
    const actifs = data.fournisseurs.filter((f) => !f.archive && f.actif).length;
    const inactifs = data.fournisseurs.filter((f) => !f.archive && !f.actif).length;
    const archives = data.fournisseurs.filter((f) => f.archive).length;
    const enCours = data.paiements
      .filter((p) => !p.archive && !["Validé", "Annulé"].includes(p.statut))
      .reduce((s, p) => s + p.montant, 0);
    return { total: data.fournisseurs.length, actifs, inactifs, archives, enCours };
  }, [data.fournisseurs, data.paiements]);

  const creerDialog = useDialog<Fournisseur | null>();
  const detailDialog = useDialog<Fournisseur>();
  const [form, setForm] = useState<Omit<Fournisseur, "id">>(FOURNISSEUR_VIDE);

  function ouvrirCreation() {
    setForm(FOURNISSEUR_VIDE);
    creerDialog.ouvrir(null);
  }

  function ouvrirEdition(f: Fournisseur) {
    setForm({ ...f });
    creerDialog.ouvrir(f);
  }

  function enregistrer() {
    if (creerDialog.item) {
      patch("fournisseurs", creerDialog.item.id, form);
      log({
        entite: "Fournisseur",
        entiteId: creerDialog.item.id,
        utilisateur: "Back-Office",
        action: "Modification de la fiche fournisseur",
        ancienneValeur: creerDialog.item.raisonSociale,
        nouvelleValeur: form.raisonSociale,
      });
    } else {
      const id = uid("FRS");
      add("fournisseurs", { id, ...form, code: form.code || id });
      log({
        entite: "Fournisseur",
        entiteId: id,
        utilisateur: "Back-Office",
        action: "Création du fournisseur",
        ancienneValeur: "",
        nouvelleValeur: form.raisonSociale,
      });
    }
  }

  const colonnes: Colonne<Fournisseur>[] = [
    { cle: "code", titre: "Code", rendu: (f) => <span className="font-mono text-xs">{f.code}</span> },
    { cle: "raison", titre: "Raison sociale", rendu: (f) => <span className="font-medium text-navy">{f.raisonSociale}</span> },
    { cle: "contact", titre: "Contact", rendu: (f) => f.contact || "—" },
    { cle: "gsm", titre: "GSM", rendu: (f) => f.gsm || "—" },
    { cle: "ville", titre: "Ville / Zone", rendu: (f) => `${f.ville || "—"} · ${f.zone || "—"}` },
    {
      cle: "statut",
      titre: "Statut",
      rendu: (f) => (
        <div className="flex flex-wrap gap-1">
          <Statut ton={tonStatut(f.actif ? "Actif" : "Inactif")}>{f.actif ? "Actif" : "Inactif"}</Statut>
          {f.archive && <Statut>Archivé</Statut>}
        </div>
      ),
    },
    {
      cle: "actions",
      titre: "Actions",
      align: "right",
      rendu: (f) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="outline" onClick={() => detailDialog.ouvrir(f)}>
            Voir
          </Button>
          <Button size="sm" variant="outline" onClick={() => ouvrirEdition(f)}>
            Modifier
          </Button>
          <Button
            size="sm"
            variant={f.archive ? "outline" : "destructive"}
            onClick={() => {
              toggleArchive("fournisseurs", f.id);
              log({
                entite: "Fournisseur",
                entiteId: f.id,
                utilisateur: "Back-Office",
                action: f.archive ? "Restauration du fournisseur" : "Archivage du fournisseur",
                ancienneValeur: "",
                nouvelleValeur: "",
              });
            }}
          >
            {f.archive ? "Restaurer" : "Archiver"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        titre="Fournisseurs & Paiements"
        sous="Gestion des fournisseurs, de leurs contacts, documents et paiements associés."
        actions={<Button onClick={ouvrirCreation}>Nouveau fournisseur</Button>}
      />

      <Grille cols={3}>
        <StatCard label="Fournisseurs" valeur={stats.total} detail={`${stats.archives} archivé(s)`} />
        <StatCard label="Actifs" valeur={stats.actifs} ton="positif" detail={`${stats.inactifs} inactif(s)`} />
        <StatCard label="Paiements en cours" valeur={dh(stats.enCours)} ton="alerte" detail="Tous fournisseurs" />
      </Grille>

      <Panel titre="Recherche & filtres">
        <FilterBar>
          <SearchInput value={recherche} onChange={setRecherche} placeholder="Code, raison sociale, contact, email…" />
          <SelectFilter value={ville} onChange={setVille} options={villes} label="Ville" />
          <SelectFilter value={zone} onChange={setZone} options={zones} label="Zone" />
          <SelectFilter value={actifF} onChange={setActifF} options={["Actif", "Inactif"]} label="Statut" />
          <Button variant={voirArchives ? "default" : "outline"} size="sm" onClick={() => setVoirArchives((v) => !v)}>
            {voirArchives ? "Voir actifs" : "Voir archivés"}
          </Button>
        </FilterBar>
      </Panel>

      <DataTable colonnes={colonnes} lignes={fournisseurs} vide="Aucun fournisseur trouvé." />

      <FormDialog
        open={creerDialog.open}
        onOpenChange={creerDialog.setOpen}
        titre={creerDialog.item ? "Modifier le fournisseur" : "Nouveau fournisseur"}
        onSubmit={enregistrer}
        submitLabel={creerDialog.item ? "Enregistrer" : "Créer"}
        large
      >
        <Grille>
          <Champ label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} />
          <Champ label="Raison sociale" value={form.raisonSociale} onChange={(v) => setForm({ ...form, raisonSociale: v })} />
          <Champ label="Contact" value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} />
          <Champ label="GSM" value={form.gsm} onChange={(v) => setForm({ ...form, gsm: v })} />
          <Champ label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Champ label="Adresse" value={form.adresse} onChange={(v) => setForm({ ...form, adresse: v })} />
          <Champ label="Ville" value={form.ville} onChange={(v) => setForm({ ...form, ville: v })} />
          <Champ label="Zone" value={form.zone} onChange={(v) => setForm({ ...form, zone: v })} />
          <Champ label="Conditions de paiement" value={form.conditions} onChange={(v) => setForm({ ...form, conditions: v })} />
          <ChampCase label="Fournisseur actif" checked={form.actif} onChange={(v) => setForm({ ...form, actif: v })} />
        </Grille>
        <ChampTexte label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
      </FormDialog>

      {detailDialog.item && (
        <FournisseurDetail
          fournisseur={detailDialog.item}
          open={detailDialog.open}
          onOpenChange={detailDialog.setOpen}
        />
      )}
    </div>
  );
}

const ONGLETS = ["Aperçu", "Paiements", "Documents", "Historique"] as const;

function FournisseurDetail({
  fournisseur,
  open,
  onOpenChange,
}: {
  fournisseur: Fournisseur;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data, add, patch, log } = useBO();
  const [onglet, setOnglet] = useState<(typeof ONGLETS)[number]>("Aperçu");
  const [contactDialog, setContactDialog] = useState(false);
  const [contact, setContact] = useState({ nom: "", fonction: "", gsm: "", email: "" });
  const [docDialog, setDocDialog] = useState(false);
  const [docForm, setDocForm] = useState({ nom: "", categorie: "Document administratif", notes: "" });
  const [paiementDialog, setPaiementDialog] = useState(false);
  const [paiementForm, setPaiementForm] = useState({
    clientId: "",
    dossierId: "",
    montant: "",
    devise: "MAD",
    moyen: "Chèque" as Paiement["moyen"],
    notes: "",
  });

  const f = data.fournisseurs.find((x) => x.id === fournisseur.id) ?? fournisseur;

  const paiements = data.paiements.filter((p) => p.fournisseurId === f.id);
  const documents = data.documents.filter((d) => d.notes.includes(`Fournisseur:${f.id}`));
  const historique = data.audit.filter((a) => a.entiteId === f.id);

  const totalPaye = paiements
    .filter((p) => ["Validé", "Paiement effectué"].includes(p.statut))
    .reduce((s, p) => s + p.montant, 0);
  const totalAttente = paiements
    .filter((p) => !["Validé", "Annulé", "Paiement effectué"].includes(p.statut))
    .reduce((s, p) => s + p.montant, 0);

  function ajouterContact() {
    if (!contact.nom) return;
    const ligne = `Contact ajouté : ${contact.nom} (${contact.fonction || "—"}) — ${contact.gsm || "—"} / ${contact.email || "—"} [${today()}]`;
    patch("fournisseurs", f.id, { notes: `${f.notes ? f.notes + "\n" : ""}${ligne}` });
    log({
      entite: "Fournisseur",
      entiteId: f.id,
      utilisateur: "Back-Office",
      action: "Ajout d'un contact fournisseur",
      ancienneValeur: "",
      nouvelleValeur: contact.nom,
    });
    setContact({ nom: "", fonction: "", gsm: "", email: "" });
    setContactDialog(false);
  }

  function ajouterDocument() {
    if (!docForm.nom) return;
    const id = uid("DOC");
    add("documents", {
      id,
      nom: docForm.nom,
      type: docForm.nom.split(".").pop()?.toUpperCase() || "Fichier",
      categorie: docForm.categorie as any,
      clientId: "",
      dossierId: "",
      courseId: "",
      paiementId: "",
      date: today(),
      ajoutePar: "Back-Office",
      source: "Back-Office",
      notes: `Fournisseur:${f.id} — ${docForm.notes}`,
      archive: false,
    });
    log({
      entite: "Fournisseur",
      entiteId: f.id,
      utilisateur: "Back-Office",
      action: "Ajout d'un document fournisseur",
      ancienneValeur: "",
      nouvelleValeur: docForm.nom,
    });
    setDocForm({ nom: "", categorie: "Document administratif", notes: "" });
    setDocDialog(false);
  }

  function ajouterPaiement() {
    if (!paiementForm.montant) return;
    const id = uid("PAY");
    add("paiements", {
      id,
      numero: id,
      clientId: paiementForm.clientId,
      dossierId: paiementForm.dossierId,
      courseId: "",
      fournisseurId: f.id,
      montant: Number(paiementForm.montant) || 0,
      devise: paiementForm.devise,
      moyen: paiementForm.moyen,
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
      notes: paiementForm.notes,
      statut: "À payer",
      archive: false,
    });
    log({
      entite: "Paiement",
      entiteId: id,
      utilisateur: "Back-Office",
      action: "Création du paiement fournisseur",
      ancienneValeur: "",
      nouvelleValeur: `${paiementForm.montant} ${paiementForm.devise}`,
    });
    setPaiementForm({ clientId: "", dossierId: "", montant: "", devise: "MAD", moyen: "Chèque", notes: "" });
    setPaiementDialog(false);
  }

  return (
    <>
      <FormDialog open={open} onOpenChange={onOpenChange} titre={`Fournisseur — ${f.raisonSociale}`} large>
        <Onglets items={ONGLETS} actif={onglet} onChange={(v) => setOnglet(v as any)} />

        {onglet === "Aperçu" && (
          <div className="space-y-4 pt-3">
            <Grille cols={3}>
              <Detail label="Code">{f.code}</Detail>
              <Detail label="Contact">{f.contact}</Detail>
              <Detail label="GSM">{f.gsm}</Detail>
              <Detail label="Email">{f.email}</Detail>
              <Detail label="Adresse">{f.adresse}</Detail>
              <Detail label="Ville / Zone">{`${f.ville} · ${f.zone}`}</Detail>
              <Detail label="Conditions">{f.conditions}</Detail>
              <Detail label="Statut">{f.actif ? "Actif" : "Inactif"}</Detail>
            </Grille>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Notes / Contacts</p>
              <pre className="mt-1 whitespace-pre-wrap rounded-md bg-surface p-3 text-sm text-foreground">{f.notes || "—"}</pre>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setContactDialog(true)}>
                Ajouter un contact
              </Button>
              <Button size="sm" variant="outline" onClick={() => setDocDialog(true)}>
                Ajouter un document
              </Button>
              <Button size="sm" onClick={() => setPaiementDialog(true)}>
                Ajouter un paiement
              </Button>
            </div>
          </div>
        )}

        {onglet === "Paiements" && (
          <div className="space-y-3 pt-3">
            <Grille cols={3}>
              <StatCard label="Nombre de paiements" valeur={paiements.length} />
              <StatCard label="Total réglé" valeur={dh(totalPaye)} ton="positif" />
              <StatCard label="Total en attente" valeur={dh(totalAttente)} ton="alerte" />
            </Grille>
            <div className="rounded-xl border border-border bg-card">
              {paiements.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">Aucun paiement lié.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {paiements.map((p) => (
                    <li key={p.id} className="flex items-center justify-between px-4 py-2 text-sm">
                      <span>
                        <span className="font-mono text-xs">{p.numero}</span> · {dh(p.montant, p.devise)} · {p.moyen}
                      </span>
                      <Statut ton={tonStatut(p.statut)}>{p.statut}</Statut>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Link to="/backoffice/paiements" className="text-sm font-medium text-primary hover:underline">
              Voir tous les paiements →
            </Link>
          </div>
        )}

        {onglet === "Documents" && (
          <div className="space-y-2 pt-3">
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun document lié.</p>
            ) : (
              <ul className="space-y-2">
                {documents.map((d) => (
                  <li key={d.id} className="rounded-md border border-border bg-surface/60 px-3 py-2 text-sm">
                    <p className="font-medium text-navy">{d.nom}</p>
                    <p className="text-xs text-muted-foreground">{d.categorie} · {fr(d.date)}</p>
                  </li>
                ))}
              </ul>
            )}
            <Button size="sm" variant="outline" onClick={() => setDocDialog(true)}>
              Ajouter un document
            </Button>
          </div>
        )}

        {onglet === "Historique" && (
          <div className="pt-3">
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
        )}
      </FormDialog>

      <FormDialog
        open={contactDialog}
        onOpenChange={setContactDialog}
        titre="Ajouter un contact"
        onSubmit={ajouterContact}
        submitLabel="Ajouter"
      >
        <Grille>
          <Champ label="Nom" value={contact.nom} onChange={(v) => setContact({ ...contact, nom: v })} />
          <Champ label="Fonction" value={contact.fonction} onChange={(v) => setContact({ ...contact, fonction: v })} />
          <Champ label="GSM" value={contact.gsm} onChange={(v) => setContact({ ...contact, gsm: v })} />
          <Champ label="Email" value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} />
        </Grille>
      </FormDialog>

      <FormDialog
        open={docDialog}
        onOpenChange={setDocDialog}
        titre="Ajouter un document"
        onSubmit={ajouterDocument}
        submitLabel="Ajouter"
      >
        <Grille>
          <Champ label="Nom du fichier" value={docForm.nom} onChange={(v) => setDocForm({ ...docForm, nom: v })} />
          <ChampSelect
            label="Catégorie"
            value={docForm.categorie}
            onChange={(v) => setDocForm({ ...docForm, categorie: v })}
            options={["Document administratif", "Facture", "Reçu", "Bon", "Autre"]}
          />
        </Grille>
        <ChampTexte label="Notes" value={docForm.notes} onChange={(v) => setDocForm({ ...docForm, notes: v })} />
      </FormDialog>

      <FormDialog
        open={paiementDialog}
        onOpenChange={setPaiementDialog}
        titre="Ajouter un paiement fournisseur"
        onSubmit={ajouterPaiement}
        submitLabel="Créer"
      >
        <Grille>
          <ChampSelect
            label="Client"
            value={paiementForm.clientId}
            onChange={(v) => setPaiementForm({ ...paiementForm, clientId: v })}
            options={data.clients.map((c) => ({ value: c.id, label: c.raisonSociale }))}
          />
          <ChampSelect
            label="Dossier"
            value={paiementForm.dossierId}
            onChange={(v) => setPaiementForm({ ...paiementForm, dossierId: v })}
            options={data.dossiers.map((d) => ({ value: d.id, label: d.numero }))}
          />
          <Champ label="Montant" type="number" value={paiementForm.montant} onChange={(v) => setPaiementForm({ ...paiementForm, montant: v })} />
          <Champ label="Devise" value={paiementForm.devise} onChange={(v) => setPaiementForm({ ...paiementForm, devise: v })} />
          <ChampSelect
            label="Moyen de paiement"
            value={paiementForm.moyen}
            onChange={(v) => setPaiementForm({ ...paiementForm, moyen: v as Paiement["moyen"] })}
            options={["Chèque", "Espèces", "Virement", "Autre"]}
          />
        </Grille>
        <ChampTexte label="Notes" value={paiementForm.notes} onChange={(v) => setPaiementForm({ ...paiementForm, notes: v })} />
      </FormDialog>
    </>
  );
}
