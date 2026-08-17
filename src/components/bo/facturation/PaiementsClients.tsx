import { useMemo, useState } from "react";
import { useBO, useLookups } from "@/lib/bo-store";
import { totalFacture, dh, fr, uid, today, type ReglementFacture, type Facture } from "@/lib/bo-data";
import {
  DataTable,
  FilterBar,
  FormDialog,
  Grille,
  SearchInput,
  SelectFilter,
  Statut,
  tonStatut,
  Champ,
  ChampSelect,
  ChampTexte,
  useDialog,
  type Colonne,
} from "@/components/bo/kit";
import { Button } from "@/components/ui/button";

const MOYENS = ["Chèque", "Virement", "Espèces", "Autre"] as const;
const STATUTS_REGLEMENT = ["En attente", "Reçu", "Validé", "Annulé"] as const;
type StatutReglement = (typeof STATUTS_REGLEMENT)[number];

export type PaiementClient = ReglementFacture & {
  numero: string;
  factureId: string;
  clientId: string;
  statut: StatutReglement;
  notes: string;
};

function toPaiement(f: Facture, r: ReglementFacture): PaiementClient {
  const p = r as Partial<PaiementClient>;
  return {
    ...r,
    numero: p.numero ?? r.id,
    factureId: f.id,
    clientId: f.clientId,
    statut: p.statut ?? "Validé",
    notes: p.notes ?? "",
  };
}

export function PaiementsClients() {
  const { data, patch, log } = useBO();
  const lk = useLookups();
  const [recherche, setRecherche] = useState("");
  const [client, setClient] = useState("");
  const [statut, setStatut] = useState("");
  const creerDialog = useDialog<null>();
  const editDialog = useDialog<PaiementClient>();
  const [editForm, setEditForm] = useState<{ montant: string; moyen: string; reference: string; statut: StatutReglement; notes: string }>({
    montant: "0",
    moyen: "Virement",
    reference: "",
    statut: "Reçu",
    notes: "",
  });

  const facturesFacturables = useMemo(() => data.factures.filter((f) => f.statut !== "Brouillon" && f.statut !== "Annulée"), [data.factures]);

  const [form, setForm] = useState({
    factureId: facturesFacturables[0]?.id ?? "",
    montant: "0",
    moyen: "Virement" as (typeof MOYENS)[number],
    reference: "",
    statut: "Reçu" as StatutReglement,
    notes: "",
  });

  const paiements = useMemo(() => {
    const out: PaiementClient[] = [];
    data.factures.forEach((f) => f.reglements.forEach((r) => out.push(toPaiement(f, r))));
    const t = recherche.trim().toLowerCase();
    return out
      .filter((p) => (client ? p.clientId === client : true))
      .filter((p) => (statut ? p.statut === statut : true))
      .filter((p) => (t ? `${p.numero} ${p.reference} ${lk.clientNom(p.clientId)}`.toLowerCase().includes(t) : true))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [data.factures, client, statut, recherche, lk]);

  const appliquerStatutFacture = (factureId: string) => {
    const f = data.factures.find((x) => x.id === factureId);
    if (!f) return;
    const totaux = totalFacture(f);
    const nouveauStatut = totaux.reste <= 0 ? "Payée" : totaux.paye > 0 ? "Partiellement payée" : f.statut;
    if (nouveauStatut !== f.statut) patch("factures", f.id, { statut: nouveauStatut });
  };

  const colonnes: Colonne<PaiementClient>[] = [
    { cle: "numero", titre: "N° paiement", rendu: (p) => <span className="font-medium text-navy">{p.numero}</span> },
    { cle: "client", titre: "Client", rendu: (p) => lk.clientNom(p.clientId) },
    { cle: "facture", titre: "Facture", rendu: (p) => lk.facture(p.factureId)?.numero ?? p.factureId },
    { cle: "montant", titre: "Montant", rendu: (p) => dh(p.montant), align: "right" },
    { cle: "date", titre: "Date", rendu: (p) => fr(p.date) },
    { cle: "moyen", titre: "Moyen", rendu: (p) => p.moyen },
    { cle: "reference", titre: "Référence", rendu: (p) => p.reference || "—" },
    { cle: "notes", titre: "Notes", rendu: (p) => p.notes || "—" },
    { cle: "statut", titre: "Statut", rendu: (p) => <Statut ton={tonStatut(p.statut)}>{p.statut}</Statut> },
    {
      cle: "actions",
      titre: "Actions",
      rendu: (p) => (
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditForm({ montant: String(p.montant), moyen: p.moyen, reference: p.reference, statut: p.statut, notes: p.notes });
              editDialog.ouvrir(p);
            }}
          >
            Modifier
          </Button>
          {p.statut !== "Validé" && p.statut !== "Annulé" && (
            <Button
              size="sm"
              onClick={() => {
                const f = lk.facture(p.factureId);
                if (!f) return;
                const reglements = f.reglements.map((r) => (r.id === p.id ? ({ ...r, statut: "Validé" } as ReglementFacture) : r));
                patch("factures", f.id, { reglements });
                appliquerStatutFacture(f.id);
                log({ entite: "Paiement", entiteId: p.id, utilisateur: "Back-Office", action: "Validation du paiement client", ancienneValeur: p.statut, nouvelleValeur: "Validé" });
              }}
            >
              Valider
            </Button>
          )}
          {p.statut !== "Annulé" && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                const f = lk.facture(p.factureId);
                if (!f) return;
                const reglements = f.reglements.map((r) => (r.id === p.id ? ({ ...r, statut: "Annulé" } as ReglementFacture) : r));
                patch("factures", f.id, { reglements });
                appliquerStatutFacture(f.id);
                log({ entite: "Paiement", entiteId: p.id, utilisateur: "Back-Office", action: "Annulation du paiement client", ancienneValeur: p.statut, nouvelleValeur: "Annulé" });
              }}
            >
              Annuler
            </Button>
          )}
        </div>
      ),
      align: "right",
    },
  ];

  return (
    <div className="space-y-4">
      <FilterBar>
        <SearchInput value={recherche} onChange={setRecherche} placeholder="Rechercher un paiement…" />
        <SelectFilter label="Client" value={client} onChange={setClient} options={data.clients.map((c) => c.id)} />
        <SelectFilter label="Statut" value={statut} onChange={setStatut} options={STATUTS_REGLEMENT} />
        <Button
          size="sm"
          onClick={() => {
            setForm({ factureId: facturesFacturables[0]?.id ?? "", montant: "0", moyen: "Virement", reference: "", statut: "Reçu", notes: "" });
            creerDialog.ouvrir(null);
          }}
        >
          Enregistrer un paiement
        </Button>
      </FilterBar>

      <DataTable colonnes={colonnes} lignes={paiements} vide="Aucun paiement enregistré." />

      <FormDialog
        open={creerDialog.open}
        onOpenChange={creerDialog.setOpen}
        titre="Enregistrer un paiement client"
        submitLabel="Enregistrer"
        onSubmit={() => {
          const f = data.factures.find((x) => x.id === form.factureId);
          if (!f) return;
          const montant = Number(form.montant) || 0;
          if (montant <= 0) return;
          const compteur = data.factures.reduce((s, ff) => s + ff.reglements.length, 0);
          const reglement = {
            id: uid("reg"),
            numero: `REG-${String(compteur + 1).padStart(4, "0")}`,
            date: today(),
            montant,
            moyen: form.moyen,
            reference: form.reference,
            statut: form.statut,
            notes: form.notes,
          } as unknown as ReglementFacture;
          const reglements = [...f.reglements, reglement];
          patch("factures", f.id, { reglements });
          if (form.statut === "Validé" || form.statut === "Reçu") appliquerStatutFacture(f.id);
          log({ entite: "Paiement", entiteId: reglement.id, utilisateur: "Back-Office", action: "Création d'un paiement client", ancienneValeur: "", nouvelleValeur: dh(montant) });
        }}
      >
        <Grille>
          <ChampSelect
            label="Facture"
            value={form.factureId}
            onChange={(v) => setForm((f) => ({ ...f, factureId: v }))}
            options={facturesFacturables.map((f) => ({ value: f.id, label: `${f.numero} — ${lk.clientNom(f.clientId)}` }))}
          />
          <Champ label="Montant" type="number" value={form.montant} onChange={(v) => setForm((f) => ({ ...f, montant: v }))} />
          <ChampSelect label="Moyen" value={form.moyen} onChange={(v) => setForm((f) => ({ ...f, moyen: v as (typeof MOYENS)[number] }))} options={MOYENS} />
          <Champ label="Référence" value={form.reference} onChange={(v) => setForm((f) => ({ ...f, reference: v }))} />
          <ChampSelect label="Statut" value={form.statut} onChange={(v) => setForm((f) => ({ ...f, statut: v as StatutReglement }))} options={STATUTS_REGLEMENT} />
        </Grille>
        <ChampTexte label="Notes" value={form.notes} onChange={(v) => setForm((f) => ({ ...f, notes: v }))} />
      </FormDialog>

      <FormDialog
        open={editDialog.open}
        onOpenChange={editDialog.setOpen}
        titre={`Modifier le paiement — ${editDialog.item?.numero ?? ""}`}
        submitLabel="Enregistrer"
        onSubmit={() => {
          const p = editDialog.item;
          if (!p) return;
          const f = lk.facture(p.factureId);
          if (!f) return;
          const montant = Number(editForm.montant) || 0;
          const reglements = f.reglements.map((r) =>
            r.id === p.id
              ? ({ ...r, montant, moyen: editForm.moyen, reference: editForm.reference, statut: editForm.statut, notes: editForm.notes } as ReglementFacture)
              : r,
          );
          patch("factures", f.id, { reglements });
          appliquerStatutFacture(f.id);
          log({ entite: "Paiement", entiteId: p.id, utilisateur: "Back-Office", action: "Modification d'un paiement client", ancienneValeur: "", nouvelleValeur: "" });
        }}
      >
        <Grille>
          <Champ label="Montant" type="number" value={editForm.montant} onChange={(v) => setEditForm((f) => ({ ...f, montant: v }))} />
          <ChampSelect label="Moyen" value={editForm.moyen} onChange={(v) => setEditForm((f) => ({ ...f, moyen: v }))} options={MOYENS} />
          <Champ label="Référence" value={editForm.reference} onChange={(v) => setEditForm((f) => ({ ...f, reference: v }))} />
          <ChampSelect label="Statut" value={editForm.statut} onChange={(v) => setEditForm((f) => ({ ...f, statut: v as StatutReglement }))} options={STATUTS_REGLEMENT} />
        </Grille>
        <ChampTexte label="Notes" value={editForm.notes} onChange={(v) => setEditForm((f) => ({ ...f, notes: v }))} />
      </FormDialog>
    </div>
  );
}
