import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useOps, useOpsLookups } from "@/lib/bo/ops-store";
import { ROLES_CONTACT, horodatage, nomClient, oid, prochainCodeContact, type ContactOps, type RoleContact } from "@/lib/bo/ops-data";
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
  Historique,
  Detail,
  useDialog,
  type Colonne,
} from "@/components/bo/kit";

export const Route = createFileRoute("/backoffice/contacts")({
  head: () => ({
    meta: [
      { title: "Contacts — Back-Office ARCONDIS" },
      { name: "description", content: "Gestion des contacts rattachés aux clients ARCONDIS." },
    ],
  }),
  component: ContactsPage,
});

const CONTACT_VIDE = (): Omit<ContactOps, "id" | "code" | "historique"> => ({
  clientId: "",
  nom: "",
  prenom: "",
  service: "",
  fonction: "",
  role: "Responsable",
  autreRole: "",
  gsm: "",
  fixe: "",
  fax: "",
  email: "",
  whatsapp: "",
  notes: "",
  actif: true,
  archive: false,
});

function ContactsPage() {
  const { data, ajouter, modifier, archiver, ajouterNote } = useOps();
  const l = useOpsLookups();

  const [recherche, setRecherche] = useState("");
  const [clientF, setClientF] = useState("");
  const [roleF, setRoleF] = useState("");
  const [actifF, setActifF] = useState("");
  const [voirArchives, setVoirArchives] = useState(false);

  const clientsOptions = useMemo(
    () => data.clients.filter((c) => !c.archive).map((c) => ({ value: c.id, label: `${c.code} — ${nomClient(c)}` })),
    [data.clients],
  );

  const contacts = useMemo(() => {
    return data.contacts.filter((c) => {
      if (c.archive !== voirArchives) return false;
      if (clientF && c.clientId !== clientF) return false;
      if (roleF && c.role !== roleF) return false;
      if (actifF && (actifF === "Actif" ? !c.actif : c.actif)) return false;
      if (
        recherche &&
        !`${c.code} ${c.nom} ${c.prenom} ${c.email} ${c.gsm} ${l.clientNom(c.clientId)}`
          .toLowerCase()
          .includes(recherche.toLowerCase())
      )
        return false;
      return true;
    });
  }, [data.contacts, recherche, clientF, roleF, actifF, voirArchives, l]);

  const stats = useMemo(() => {
    const actifs = data.contacts.filter((c) => !c.archive);
    return {
      total: actifs.length,
      actifsSeulement: actifs.filter((c) => c.actif).length,
      archives: data.contacts.filter((c) => c.archive).length,
    };
  }, [data.contacts]);

  const creerDialog = useDialog<ContactOps | null>();
  const detailDialog = useDialog<ContactOps>();
  const [form, setForm] = useState(CONTACT_VIDE());
  const [note, setNote] = useState("");

  function ouvrirCreation() {
    setForm(CONTACT_VIDE());
    creerDialog.ouvrir(null);
  }

  function ouvrirEdition(c: ContactOps) {
    setForm({ ...c });
    creerDialog.ouvrir(c);
  }

  function enregistrer() {
    if (creerDialog.item) {
      modifier("contacts", creerDialog.item.id, form, "Fiche contact modifiée");
    } else {
      const contact: ContactOps = {
        id: oid("ct"),
        code: prochainCodeContact(data.contacts),
        historique: [{ id: oid("ev"), date: horodatage(), auteur: "Back-Office", action: "Contact créé" }],
        ...form,
      };
      ajouter("contacts", contact);
    }
  }

  const colonnes: Colonne<ContactOps>[] = [
    { cle: "code", titre: "Code", rendu: (c) => <span className="font-mono text-xs">{c.code}</span> },
    { cle: "nom", titre: "Nom", rendu: (c) => <span className="font-medium text-navy">{c.prenom} {c.nom}</span> },
    { cle: "client", titre: "Client rattaché", rendu: (c) => l.clientNom(c.clientId) },
    { cle: "role", titre: "Rôle", rendu: (c) => c.role },
    { cle: "contact", titre: "GSM / Email", rendu: (c) => (
      <div>
        <p>{c.gsm || "—"}</p>
        <p className="text-xs text-muted-foreground">{c.email || "—"}</p>
      </div>
    ) },
    {
      cle: "statut",
      titre: "Statut",
      rendu: (c) => (
        <div className="flex flex-wrap gap-1">
          <Statut ton={tonStatut(c.actif ? "Actif" : "Inactif")}>{c.actif ? "Actif" : "Inactif"}</Statut>
          {c.archive && <Statut>Archivé</Statut>}
        </div>
      ),
    },
    {
      cle: "actions",
      titre: "Actions",
      align: "right",
      rendu: (c) => (
        <div className="flex flex-wrap justify-end gap-1">
          <Button size="sm" variant="outline" onClick={() => detailDialog.ouvrir(c)}>Voir</Button>
          <Button size="sm" variant="outline" onClick={() => ouvrirEdition(c)}>Modifier</Button>
          <Button size="sm" variant={c.archive ? "outline" : "destructive"} onClick={() => archiver("contacts", c.id, !c.archive)}>
            {c.archive ? "Restaurer" : "Archiver"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        titre="Contacts"
        sous="Contacts rattachés aux fiches clients ARCONDIS."
        actions={<Button onClick={ouvrirCreation}>Nouveau contact</Button>}
      />

      <Grille cols={3}>
        <StatCard label="Contacts actifs" valeur={stats.total} detail={`${stats.archives} archivé(s)`} />
        <StatCard label="Actifs seulement" valeur={stats.actifsSeulement} ton="positif" />
        <StatCard label="Clients avec contact" valeur={new Set(data.contacts.map((c) => c.clientId)).size} />
      </Grille>

      <Panel titre="Recherche & filtres">
        <FilterBar>
          <SearchInput value={recherche} onChange={setRecherche} placeholder="Code, nom, email, GSM…" />
          <select
            value={clientF}
            onChange={(e) => setClientF(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            aria-label="Client"
          >
            <option value="">Client : tous</option>
            {clientsOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <SelectFilter value={roleF} onChange={setRoleF} options={ROLES_CONTACT} label="Rôle" />
          <SelectFilter value={actifF} onChange={setActifF} options={["Actif", "Inactif"]} label="Statut" />
          <Button variant={voirArchives ? "default" : "outline"} size="sm" onClick={() => setVoirArchives((v) => !v)}>
            {voirArchives ? "Voir actifs" : "Voir archivés"}
          </Button>
        </FilterBar>
      </Panel>

      <DataTable colonnes={colonnes} lignes={contacts} vide="Aucun contact trouvé." />

      <FormDialog
        open={creerDialog.open}
        onOpenChange={creerDialog.setOpen}
        titre={creerDialog.item ? "Modifier le contact" : "Nouveau contact"}
        onSubmit={enregistrer}
        submitLabel={creerDialog.item ? "Enregistrer" : "Créer"}
        large
      >
        <Grille cols={3}>
          <ChampSelect label="Client rattaché" value={form.clientId} onChange={(v) => setForm({ ...form, clientId: v })} options={clientsOptions} />
          <Champ label="Nom" value={form.nom} onChange={(v) => setForm({ ...form, nom: v })} />
          <Champ label="Prénom" value={form.prenom} onChange={(v) => setForm({ ...form, prenom: v })} />
        </Grille>
        <Grille cols={3}>
          <ChampSelect label="Rôle" value={form.role} onChange={(v) => setForm({ ...form, role: v as RoleContact })} options={ROLES_CONTACT} />
          <Champ label="GSM" value={form.gsm} onChange={(v) => setForm({ ...form, gsm: v })} />
          <Champ label="WhatsApp" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} />
        </Grille>
        <Grille cols={3}>
          <Champ label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <ChampCase label="Contact actif" checked={form.actif} onChange={(v) => setForm({ ...form, actif: v })} />
        </Grille>
        <ChampTexte label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
      </FormDialog>

      {detailDialog.item && (
        <FormDialog open={detailDialog.open} onOpenChange={detailDialog.setOpen} titre={`Contact — ${detailDialog.item.prenom} ${detailDialog.item.nom}`} large>
          <ContactDetailContent contact={detailDialog.item} note={note} setNote={setNote} ajouterNote={ajouterNote} clientNom={l.clientNom} />
        </FormDialog>
      )}
    </div>
  );
}

function ContactDetailContent({
  contact,
  note,
  setNote,
  ajouterNote,
  clientNom,
}: {
  contact: ContactOps;
  note: string;
  setNote: (v: string) => void;
  ajouterNote: ReturnType<typeof useOps>["ajouterNote"];
  clientNom: (id: string) => string;
}) {
  const { data } = useOps();
  const c = data.contacts.find((x) => x.id === contact.id) ?? contact;
  return (
    <div className="space-y-4 pt-1">
      <Grille cols={3}>
        <Detail label="Code">{c.code}</Detail>
        <Detail label="Client rattaché">{clientNom(c.clientId)}</Detail>
        <Detail label="Rôle">{c.role}</Detail>
        <Detail label="GSM">{c.gsm}</Detail>
        <Detail label="WhatsApp">{c.whatsapp}</Detail>
        <Detail label="Email">{c.email}</Detail>
        <Detail label="Fonction">{c.fonction}</Detail>
        <Detail label="Statut">{c.actif ? "Actif" : "Inactif"}</Detail>
      </Grille>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Notes</p>
        <pre className="mt-1 whitespace-pre-wrap rounded-md bg-surface p-3 text-sm text-foreground">{c.notes || "—"}</pre>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <ChampTexte label="Ajouter une note" value={note} onChange={setNote} rows={2} />
        </div>
        <Button size="sm" className="self-end" onClick={() => { if (note.trim()) { ajouterNote("contacts", c.id, note); setNote(""); } }}>
          Ajouter
        </Button>
      </div>
      <div>
        <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Historique</p>
        <Historique items={c.historique} />
      </div>
    </div>
  );
}
