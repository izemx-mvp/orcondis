// ORCONDIS — Composant générique de gestion des référentiels (CRUD + archivage).
import { useState } from "react";
import { useBO } from "@/lib/bo-store";
import { uid, type Referentiel } from "@/lib/bo-data";
import {
  Panel,
  PageHeader,
  SearchInput,
  DataTable,
  Statut,
  tonStatut,
  Champ,
  ChampTexte,
  ChampCase,
  FormDialog,
  Grille,
  useDialog,
  type Colonne,
} from "@/components/bo/kit";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Archive, ArchiveRestore, Trash2, Lock } from "lucide-react";

export type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "checkbox";
};

const UTILISATEUR_COURANT = "Yassine Bennani";

export function ReferentielTable<T extends Referentiel>({
  collectionKey,
  entiteLabel,
  titre,
  sous,
  fields = [],
  extraColumns,
  nonDeletable,
  idPrefix,
  extraDefaults,
}: {
  collectionKey: any;
  entiteLabel: string;
  titre: string;
  sous?: string;
  fields?: Field[];
  extraColumns?: Colonne<T>[];
  nonDeletable?: (item: T) => boolean;
  idPrefix: string;
  extraDefaults?: Record<string, unknown>;
}) {
  const { data, add, patch, remove, toggleArchive, log } = useBO();
  const items = (data as any)[collectionKey] as T[];
  const [q, setQ] = useState("");
  const dlg = useDialog<T | null>();
  const [form, setForm] = useState<Record<string, any>>({});

  const filtered = items.filter(
    (i) => !i.archive && String(i.nom ?? "").toLowerCase().includes(q.toLowerCase()),
  );
  const archived = items.filter((i) => i.archive);

  const ouvrirNouveau = () => {
    const base: Record<string, any> = { nom: "", description: "", actif: true, ...extraDefaults };
    fields.forEach((f) => {
      if (!(f.key in base)) base[f.key] = f.type === "checkbox" ? false : f.type === "number" ? 0 : "";
    });
    setForm(base);
    dlg.ouvrir(null);
  };

  const ouvrirEdition = (item: T) => {
    setForm({ ...item });
    dlg.ouvrir(item);
  };

  const enregistrer = () => {
    if (dlg.item) {
      patch(collectionKey, dlg.item.id, form as Partial<T>);
      log({
        entite: entiteLabel,
        entiteId: dlg.item.id,
        utilisateur: UTILISATEUR_COURANT,
        action: `Modification — ${entiteLabel}`,
        ancienneValeur: String((dlg.item as any).nom ?? ""),
        nouvelleValeur: String(form.nom ?? ""),
      });
    } else {
      const item = { id: uid(idPrefix), archive: false, ...form } as unknown as T;
      add(collectionKey, item as any);
      log({
        entite: entiteLabel,
        entiteId: item.id,
        utilisateur: UTILISATEUR_COURANT,
        action: `Création — ${entiteLabel}`,
        ancienneValeur: "—",
        nouvelleValeur: String(form.nom ?? ""),
      });
    }
  };

  const supprimer = (item: T) => {
    if (!window.confirm(`Supprimer « ${item.nom} » ?`)) return;
    remove(collectionKey, item.id);
    log({
      entite: entiteLabel,
      entiteId: item.id,
      utilisateur: UTILISATEUR_COURANT,
      action: `Suppression — ${entiteLabel}`,
      ancienneValeur: String(item.nom ?? ""),
      nouvelleValeur: "—",
    });
  };

  const archiverToggle = (item: T) => {
    toggleArchive(collectionKey, item.id);
    log({
      entite: entiteLabel,
      entiteId: item.id,
      utilisateur: UTILISATEUR_COURANT,
      action: item.archive ? `Restauration — ${entiteLabel}` : `Archivage — ${entiteLabel}`,
      ancienneValeur: item.archive ? "Archivé" : "Actif",
      nouvelleValeur: item.archive ? "Actif" : "Archivé",
    });
  };

  const toggleActif = (item: T) => {
    const nv = !item.actif;
    patch(collectionKey, item.id, { actif: nv } as Partial<T>);
    log({
      entite: entiteLabel,
      entiteId: item.id,
      utilisateur: UTILISATEUR_COURANT,
      action: `Changement de statut — ${entiteLabel}`,
      ancienneValeur: item.actif ? "Actif" : "Inactif",
      nouvelleValeur: nv ? "Actif" : "Inactif",
    });
  };

  const colonnes: Colonne<T>[] = [
    {
      cle: "nom",
      titre: "Nom",
      rendu: (r) => (
        <span className="flex items-center gap-1.5 font-medium text-navy">
          {r.nom}
          {nonDeletable?.(r) && <Lock className="h-3 w-3 text-muted-foreground" aria-label="Élément système" />}
        </span>
      ),
    },
    ...(extraColumns ?? []),
    {
      cle: "description",
      titre: "Description",
      rendu: (r) => <span className="text-muted-foreground">{r.description || "—"}</span>,
    },
    {
      cle: "actif",
      titre: "Statut",
      rendu: (r) => (
        <button type="button" onClick={() => toggleActif(r)}>
          <Statut ton={tonStatut(r.actif ? "Validée" : "Annulée")}>{r.actif ? "Actif" : "Inactif"}</Statut>
        </button>
      ),
    },
    {
      cle: "actions",
      titre: "Actions",
      align: "right",
      rendu: (r) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" onClick={() => ouvrirEdition(r)} aria-label="Modifier">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => archiverToggle(r)} aria-label="Archiver">
            {r.archive ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
          </Button>
          {!nonDeletable?.(r) && (
            <Button size="icon" variant="ghost" onClick={() => supprimer(r)} aria-label="Supprimer">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        titre={titre}
        sous={sous}
        actions={
          <Button onClick={ouvrirNouveau}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        }
      />
      <Panel actions={<SearchInput value={q} onChange={setQ} placeholder="Rechercher…" />}>
        <DataTable colonnes={colonnes} lignes={filtered} vide="Aucun élément." />
      </Panel>
      {archived.length > 0 && (
        <Panel titre="Éléments archivés">
          <DataTable colonnes={colonnes} lignes={archived} vide="Aucun élément archivé." />
        </Panel>
      )}
      <FormDialog
        open={dlg.open}
        onOpenChange={dlg.setOpen}
        titre={dlg.item ? "Modifier l’élément" : "Ajouter un élément"}
        onSubmit={enregistrer}
      >
        <Grille>
          <Champ label="Nom" value={form.nom ?? ""} onChange={(v) => setForm((f) => ({ ...f, nom: v }))} />
          {fields.map((f) =>
            f.type === "checkbox" ? (
              <ChampCase
                key={f.key}
                label={f.label}
                checked={!!form[f.key]}
                onChange={(v) => setForm((f2) => ({ ...f2, [f.key]: v }))}
              />
            ) : f.type === "textarea" ? null : (
              <Champ
                key={f.key}
                label={f.label}
                type={f.type === "number" ? "number" : "text"}
                value={form[f.key] ?? ""}
                onChange={(v) => setForm((f2) => ({ ...f2, [f.key]: f.type === "number" ? Number(v) : v }))}
              />
            ),
          )}
        </Grille>
        {fields
          .filter((f) => f.type === "textarea")
          .map((f) => (
            <ChampTexte
              key={f.key}
              label={f.label}
              value={form[f.key] ?? ""}
              onChange={(v) => setForm((f2) => ({ ...f2, [f.key]: v }))}
            />
          ))}
        <ChampTexte
          label="Description"
          value={form.description ?? ""}
          onChange={(v) => setForm((f) => ({ ...f, description: v }))}
        />
        <ChampCase label="Actif" checked={form.actif ?? true} onChange={(v) => setForm((f) => ({ ...f, actif: v }))} />
      </FormDialog>
    </div>
  );
}

export { UTILISATEUR_COURANT };
