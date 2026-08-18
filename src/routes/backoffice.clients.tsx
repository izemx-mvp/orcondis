import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useOps, useOpsLookups } from "@/lib/bo/ops-store";
import {
  CATEGORIES_CLIENT,
  SOUS_TYPES_AUTRES,
  ZONES,
  horodatage,
  nomClient,
  oid,
  prochainCodeClient,
  todayIso,
  type CategorieClient,
  type ClientOps,
} from "@/lib/bo/ops-data";
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

export const Route = createFileRoute("/backoffice/clients")({
  head: () => ({
    meta: [
      { title: "Clients — Back-Office ORCONDIS" },
      { name: "description", content: "Gestion des fiches clients ORCONDIS : coordonnées, contacts, dossiers et courses." },
    ],
  }),
  component: ClientsPage,
});

const CLIENT_VIDE = (): Omit<ClientOps, "id" | "code" | "creeLe" | "documents" | "notesInternes" | "historique"> => ({
  categorie: "Entreprise",
  sousType: "",
  autrePrecision: "",
  nom: "",
  prenom: "",
  denomination: "",
  raisonSociale: "",
  ville: "Casablanca",
  quartier: "",
  rue: "",
  numeroRue: "",
  etage: "",
  appartement: "",
  adresseComplete: "",
  pays: "Maroc",
  site: "",
  email: "",
  telephoneFixe: "",
  fax: "",
  gsm: "",
  whatsapp: "",
  facebook: "",
  instagram: "",
  zone: "",
  notes: "",
  archive: false,
});

function ClientsPage() {
  const { data, ajouter, modifier, archiver } = useOps();

  const [recherche, setRecherche] = useState("");
  const [categorieF, setCategorieF] = useState("");
  const [zoneF, setZoneF] = useState("");
  const [voirArchives, setVoirArchives] = useState(false);

  const clients = useMemo(() => {
    return data.clients.filter((c) => {
      if (c.archive !== voirArchives) return false;
      if (categorieF && c.categorie !== categorieF) return false;
      if (zoneF && c.zone !== zoneF) return false;
      if (
        recherche &&
        !`${c.code} ${nomClient(c)} ${c.email} ${c.gsm} ${c.ville}`.toLowerCase().includes(recherche.toLowerCase())
      )
        return false;
      return true;
    });
  }, [data.clients, recherche, categorieF, zoneF, voirArchives]);

  const stats = useMemo(() => {
    const actifs = data.clients.filter((c) => !c.archive);
    return {
      total: actifs.length,
      entreprises: actifs.filter((c) => c.categorie === "Entreprise" || c.categorie === "Société").length,
      particuliers: actifs.filter((c) => c.categorie === "Personne physique").length,
      archives: data.clients.filter((c) => c.archive).length,
    };
  }, [data.clients]);

  const creerDialog = useDialog<ClientOps | null>();
  const detailDialog = useDialog<ClientOps>();
  const [form, setForm] = useState(CLIENT_VIDE());

  function ouvrirCreation() {
    setForm(CLIENT_VIDE());
    creerDialog.ouvrir(null);
  }

  function ouvrirEdition(c: ClientOps) {
    setForm({ ...c });
    creerDialog.ouvrir(c);
  }

  function enregistrer() {
    if (creerDialog.item) {
      modifier("clients", creerDialog.item.id, form, "Fiche client modifiée");
    } else {
      const client: ClientOps = {
        id: oid("cli"),
        code: prochainCodeClient(data.clients, form.categorie as CategorieClient),
        creeLe: todayIso(),
        documents: [],
        notesInternes: [],
        historique: [{ id: oid("ev"), date: horodatage(), auteur: "Back-Office", action: "Client créé" }],
        ...form,
      };
      ajouter("clients", client);
    }
  }

  const colonnes: Colonne<ClientOps>[] = [
    { cle: "code", titre: "Code", rendu: (c) => <span className="font-mono text-xs">{c.code}</span> },
    { cle: "nom", titre: "Nom / Raison sociale", rendu: (c) => <span className="font-medium text-navy">{nomClient(c)}</span> },
    { cle: "categorie", titre: "Catégorie", rendu: (c) => c.categorie },
    { cle: "contact", titre: "GSM / Email", rendu: (c) => (
      <div>
        <p>{c.gsm || "—"}</p>
        <p className="text-xs text-muted-foreground">{c.email || "—"}</p>
      </div>
    ) },
    { cle: "zone", titre: "Ville / Zone", rendu: (c) => `${c.ville || "—"} · ${c.zone || "—"}` },
    { cle: "statut", titre: "Statut", rendu: (c) => (c.archive ? <Statut>Archivé</Statut> : <Statut ton={tonStatut("Actif")}>Actif</Statut>) },
    {
      cle: "actions",
      titre: "Actions",
      align: "right",
      rendu: (c) => (
        <div className="flex flex-wrap justify-end gap-1">
          <Button size="sm" variant="outline" onClick={() => detailDialog.ouvrir(c)}>Voir</Button>
          <Button size="sm" variant="outline" onClick={() => ouvrirEdition(c)}>Modifier</Button>
          <Button size="sm" variant={c.archive ? "outline" : "destructive"} onClick={() => archiver("clients", c.id, !c.archive)}>
            {c.archive ? "Restaurer" : "Archiver"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        titre="Clients"
        sous="Fiches clients ORCONDIS : personnes physiques, entreprises, sociétés et autres organisations."
        actions={<Button onClick={ouvrirCreation}>Nouveau client</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Clients actifs" valeur={stats.total} detail={`${stats.archives} archivé(s)`} />
        <StatCard label="Entreprises / Sociétés" valeur={stats.entreprises} />
        <StatCard label="Particuliers" valeur={stats.particuliers} />
        <StatCard label="Dossiers ouverts" valeur={data.dossiers.filter((d) => !d.archive).length} ton="positif" />
      </div>

      <Panel titre="Recherche & filtres">
        <FilterBar>
          <SearchInput value={recherche} onChange={setRecherche} placeholder="Code, nom, email, GSM…" />
          <SelectFilter value={categorieF} onChange={setCategorieF} options={CATEGORIES_CLIENT} label="Catégorie" />
          <SelectFilter value={zoneF} onChange={setZoneF} options={ZONES} label="Zone" />
          <Button variant={voirArchives ? "default" : "outline"} size="sm" onClick={() => setVoirArchives((v) => !v)}>
            {voirArchives ? "Voir actifs" : "Voir archivés"}
          </Button>
        </FilterBar>
      </Panel>

      <DataTable colonnes={colonnes} lignes={clients} vide="Aucun client trouvé." />

      <FormDialog
        open={creerDialog.open}
        onOpenChange={creerDialog.setOpen}
        titre={creerDialog.item ? "Modifier le client" : "Nouveau client"}
        onSubmit={enregistrer}
        submitLabel={creerDialog.item ? "Enregistrer" : "Créer"}
        large
      >
        <Grille cols={3}>
          <ChampSelect 
            label="Type de client" 
            value={form.categorie} 
            onChange={(v) => setForm({ ...form, categorie: v as CategorieClient, sousType: "", autrePrecision: "" })} 
            options={CATEGORIES_CLIENT} 
          />
          {form.categorie === "Personne physique" && (
            <>
              <Champ label="Nom" value={form.nom} onChange={(v) => setForm({ ...form, nom: v })} />
              <Champ label="Prénom" value={form.prenom} onChange={(v) => setForm({ ...form, prenom: v })} />
            </>
          )}
          {form.categorie === "Entreprise" && (
            <Champ label="Dénomination" value={form.denomination} onChange={(v) => setForm({ ...form, denomination: v })} />
          )}
          {form.categorie === "Société" && (
            <Champ label="Raison sociale" value={form.raisonSociale} onChange={(v) => setForm({ ...form, raisonSociale: v })} />
          )}
          {form.categorie === "Autres" && (
            <>
              <ChampSelect 
                label="Type" 
                value={form.sousType} 
                onChange={(v) => setForm({ ...form, sousType: v })} 
                options={SOUS_TYPES_AUTRES} 
              />
              <Champ label="Dénomination" value={form.denomination} onChange={(v) => setForm({ ...form, denomination: v })} />
            </>
          )}
        </Grille>
        
        {form.categorie === "Autres" && form.sousType === "Autres" && (
          <Grille cols={1}>
            <Champ label="Précisez" value={form.autrePrecision} onChange={(v) => setForm({ ...form, autrePrecision: v })} />
          </Grille>
        )}

        <div className="mt-4 border-t pt-4">
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-navy">Coordonnées</p>
          <Grille cols={3}>
            <Champ label="Ville" value={form.ville} onChange={(v) => setForm({ ...form, ville: v })} />
            <Champ label="Quartier" value={form.quartier} onChange={(v) => setForm({ ...form, quartier: v })} />
            <Champ label="Adresse complète" value={form.adresseComplete} onChange={(v) => setForm({ ...form, adresseComplete: v })} />
          </Grille>
          <Grille cols={3}>
            <Champ label="Rue" value={form.rue} onChange={(v) => setForm({ ...form, rue: v })} />
            <Champ label="N°" value={form.numeroRue} onChange={(v) => setForm({ ...form, numeroRue: v })} />
            <Champ label="Étage" value={form.etage} onChange={(v) => setForm({ ...form, etage: v })} />
          </Grille>
          <Grille cols={2}>
            <Champ label="N° Appartement" value={form.appartement} onChange={(v) => setForm({ ...form, appartement: v })} />
            <Champ label="Pays" value={form.pays} onChange={(v) => setForm({ ...form, pays: v })} />
          </Grille>
          <Grille cols={2}>
            <Champ label="Site" value={form.site} onChange={(v) => setForm({ ...form, site: v })} />
            <Champ label="E-mail" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          </Grille>
          <Grille cols={3}>
            <Champ label="Téléphone fixe" value={form.telephoneFixe} onChange={(v) => setForm({ ...form, telephoneFixe: v })} />
            <Champ label="Fax" value={form.fax} onChange={(v) => setForm({ ...form, fax: v })} />
            <Champ label="GSM" value={form.gsm} onChange={(v) => setForm({ ...form, gsm: v })} />
          </Grille>
          <Grille cols={3}>
            <Champ label="WhatsApp" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} />
            <Champ label="Facebook" value={form.facebook} onChange={(v) => setForm({ ...form, facebook: v })} />
            <Champ label="Instagram" value={form.instagram} onChange={(v) => setForm({ ...form, instagram: v })} />
          </Grille>
          <div className="mt-2 max-w-xs">
            <ChampSelect label="Zone" value={form.zone} onChange={(v) => setForm({ ...form, zone: v })} options={ZONES} />
          </div>
        </div>

        <ChampTexte label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
      </FormDialog>

      {detailDialog.item && (
        <ClientDetail client={detailDialog.item} open={detailDialog.open} onOpenChange={detailDialog.setOpen} />
      )}
    </div>
  );
}

const ONGLETS = ["Informations", "Contacts", "Dossiers", "Courses", "Documents", "Historique"] as const;

function ClientDetail({
  client,
  open,
  onOpenChange,
}: {
  client: ClientOps;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data, ajouter, ajouterNote } = useOps();
  const l = useOpsLookups();
  const [onglet, setOnglet] = useState<(typeof ONGLETS)[number]>("Informations");
  const [note, setNote] = useState("");
  const [contactDialog, setContactDialog] = useState(false);
  const [contactForm, setContactForm] = useState({ nom: "", prenom: "", gsm: "", email: "", role: "Responsable" });

  const c = data.clients.find((x) => x.id === client.id) ?? client;
  const contacts = data.contacts.filter((x) => x.clientId === c.id);
  const dossiers = data.dossiers.filter((x) => x.clientId === c.id);
  const courses = data.courses.filter((x) => x.clientId === c.id);

  function ajouterContact() {
    if (!contactForm.nom) return;
    const contact = {
      id: oid("ct"),
      code: `CT-${String(data.contacts.length + 1).padStart(5, "0")}`,
      clientId: c.id,
      nom: contactForm.nom,
      prenom: contactForm.prenom,
      service: "",
      fonction: "",
      role: contactForm.role as never,
      autreRole: "",
      gsm: contactForm.gsm,
      fixe: "",
      fax: "",
      email: contactForm.email,
      whatsapp: contactForm.gsm,
      notes: "",
      actif: true,
      archive: false,
      historique: [{ id: oid("ev"), date: horodatage(), auteur: "Back-Office", action: "Contact créé" }],
    };
    ajouter("contacts", contact);
    setContactForm({ nom: "", prenom: "", gsm: "", email: "", role: "Responsable" });
    setContactDialog(false);
  }

  return (
    <>
      <FormDialog open={open} onOpenChange={onOpenChange} titre={`Client — ${nomClient(c)}`} large>
        <Onglets items={ONGLETS} actif={onglet} onChange={(v) => setOnglet(v as typeof onglet)} />

        {onglet === "Informations" && (
          <div className="space-y-4 pt-3">
            <Grille cols={3}>
              <Detail label="Code client">{c.code}</Detail>
              <Detail label="Type de client">{c.categorie}</Detail>
              {c.sousType && <Detail label="Sous-type">{c.sousType}</Detail>}
            </Grille>
            <Grille cols={3}>
              {c.categorie === "Personne physique" ? (
                <>
                  <Detail label="Nom">{c.nom}</Detail>
                  <Detail label="Prénom">{c.prenom}</Detail>
                </>
              ) : c.categorie === "Entreprise" ? (
                <Detail label="Dénomination">{c.denomination}</Detail>
              ) : c.categorie === "Société" ? (
                <Detail label="Raison sociale">{c.raisonSociale}</Detail>
              ) : (
                <Detail label="Dénomination">{c.denomination}</Detail>
              )}
            </Grille>
            <div className="border-t pt-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Coordonnées</p>
              <Grille cols={3}>
                <Detail label="Ville">{c.ville}</Detail>
                <Detail label="Quartier">{c.quartier}</Detail>
                <Detail label="Zone">{c.zone}</Detail>
              </Grille>
              <Grille cols={3}>
                <Detail label="Rue">{c.rue}</Detail>
                <Detail label="N°">{c.numeroRue}</Detail>
                <Detail label="Étage">{c.etage}</Detail>
              </Grille>
              <Grille cols={2}>
                <Detail label="N° Appartement">{c.appartement}</Detail>
                <Detail label="Adresse">{c.adresseComplete}</Detail>
              </Grille>
              <Grille cols={3}>
                <Detail label="Pays">{c.pays}</Detail>
                <Detail label="GSM">{c.gsm}</Detail>
                <Detail label="WhatsApp">{c.whatsapp}</Detail>
              </Grille>
              <Grille cols={3}>
                <Detail label="E-mail">{c.email}</Detail>
                <Detail label="Fixe">{c.telephoneFixe}</Detail>
                <Detail label="Fax">{c.fax}</Detail>
              </Grille>
              <Grille cols={2}>
                <Detail label="Facebook">{c.facebook}</Detail>
                <Detail label="Instagram">{c.instagram}</Detail>
              </Grille>
            </div>
            <Detail label="Créé le">{c.creeLe}</Detail>
            <Detail label="Statut">{c.archive ? "Archivé" : "Actif"}</Detail>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Notes</p>
              <pre className="mt-1 whitespace-pre-wrap rounded-md bg-surface p-3 text-sm text-foreground">{c.notes || "—"}</pre>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <ChampTexte label="Ajouter une note" value={note} onChange={setNote} rows={2} />
              </div>
              <Button size="sm" className="self-end" onClick={() => { if (note.trim()) { ajouterNote("clients", c.id, note); setNote(""); } }}>
                Ajouter
              </Button>
            </div>
          </div>
        )}

        {onglet === "Contacts" && (
          <div className="space-y-2 pt-3">
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun contact.</p>
            ) : (
              <ul className="space-y-2">
                {contacts.map((ct) => (
                  <li key={ct.id} className="rounded-md border border-border bg-surface/60 px-3 py-2 text-sm">
                    <p className="font-medium text-navy">{ct.prenom} {ct.nom} — {ct.role}</p>
                    <p className="text-xs text-muted-foreground">{ct.gsm} · {ct.email}</p>
                  </li>
                ))}
              </ul>
            )}
            <Button size="sm" variant="outline" onClick={() => setContactDialog(true)}>Ajouter contact</Button>
          </div>
        )}

        {onglet === "Dossiers" && (
          <div className="space-y-2 pt-3">
            {dossiers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun dossier.</p>
            ) : (
              <ul className="space-y-2">
                {dossiers.map((d) => (
                  <li key={d.id} className="flex items-center justify-between rounded-md border border-border bg-surface/60 px-3 py-2 text-sm">
                    <span><span className="font-mono text-xs">{d.numero}</span> · {d.objet}</span>
                    <Statut ton={tonStatut(d.statut)}>{d.statut}</Statut>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/backoffice/dossiers" className="text-sm font-medium text-primary hover:underline">Voir tous les dossiers →</Link>
          </div>
        )}

        {onglet === "Courses" && (
          <div className="space-y-2 pt-3">
            {courses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune course.</p>
            ) : (
              <ul className="space-y-2">
                {courses.map((cr) => (
                  <li key={cr.id} className="flex items-center justify-between rounded-md border border-border bg-surface/60 px-3 py-2 text-sm">
                    <span><span className="font-mono text-xs">{cr.numero}</span> · {cr.typeCourse}</span>
                    <Statut ton={tonStatut(cr.statut)}>{cr.statut}</Statut>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/backoffice/courses" className="text-sm font-medium text-primary hover:underline">Voir toutes les courses →</Link>
          </div>
        )}

        {onglet === "Documents" && (
          <div className="space-y-2 pt-3">
            {c.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun document.</p>
            ) : (
              <ul className="space-y-2">
                {c.documents.map((d) => (
                  <li key={d.id} className="rounded-md border border-border bg-surface/60 px-3 py-2 text-sm">
                    <p className="font-medium text-navy">{d.nom}</p>
                    <p className="text-xs text-muted-foreground">{d.type} · {d.date}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {onglet === "Historique" && (
          <div className="pt-3">
            <Historique items={c.historique} />
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
          <Champ label="Nom" value={contactForm.nom} onChange={(v) => setContactForm({ ...contactForm, nom: v })} />
          <Champ label="Prénom" value={contactForm.prenom} onChange={(v) => setContactForm({ ...contactForm, prenom: v })} />
          <Champ label="GSM" value={contactForm.gsm} onChange={(v) => setContactForm({ ...contactForm, gsm: v })} />
          <Champ label="Email" value={contactForm.email} onChange={(v) => setContactForm({ ...contactForm, email: v })} />
        </Grille>
      </FormDialog>
    </>
  );
}
