// ORCONDIS — Numérotation automatique (préfixes et prochains numéros par entité).
import { useState } from "react";
import { useBO } from "@/lib/bo-store";
import { useParamExtra, apercuNumero, type NumerotationConfig } from "@/lib/bo-param-extra";
import { PageHeader, Panel, DataTable, Champ, FormDialog, Grille, useDialog, type Colonne } from "@/components/bo/kit";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

const UTILISATEUR_COURANT = "Yassine Bennani";

export function SectionNumerotation() {
  const { log } = useBO();
  const { data, patch } = useParamExtra();
  const dlg = useDialog<NumerotationConfig>();
  const [form, setForm] = useState<Partial<NumerotationConfig>>({});

  const ouvrir = (item: NumerotationConfig) => {
    setForm({ ...item });
    dlg.ouvrir(item);
  };

  const enregistrer = () => {
    if (!dlg.item) return;
    patch("numerotation", dlg.item.id, form);
    if (form.prefixe !== dlg.item.prefixe) {
      log({
        entite: "Numérotation",
        entiteId: dlg.item.id,
        utilisateur: UTILISATEUR_COURANT,
        action: `Modification préfixe — ${dlg.item.entite}`,
        ancienneValeur: dlg.item.prefixe,
        nouvelleValeur: String(form.prefixe ?? ""),
      });
    }
    if (form.prochain !== dlg.item.prochain) {
      log({
        entite: "Numérotation",
        entiteId: dlg.item.id,
        utilisateur: UTILISATEUR_COURANT,
        action: `Modification prochain numéro — ${dlg.item.entite}`,
        ancienneValeur: String(dlg.item.prochain),
        nouvelleValeur: String(form.prochain ?? ""),
      });
    }
  };

  const colonnes: Colonne<NumerotationConfig>[] = [
    { cle: "entite", titre: "Entité", rendu: (r) => <span className="font-medium text-navy">{r.entite}</span> },
    { cle: "prefixe", titre: "Préfixe", rendu: (r) => r.prefixe || "—" },
    { cle: "prochain", titre: "Prochain numéro", rendu: (r) => r.prochain },
    { cle: "apercu", titre: "Aperçu", rendu: (r) => <span className="font-mono text-xs">{apercuNumero(r)}</span> },
    {
      cle: "actions",
      titre: "Actions",
      align: "right",
      rendu: (r) => (
        <Button size="icon" variant="ghost" onClick={() => ouvrir(r)} aria-label="Modifier">
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        titre="Numérotation"
        sous="Préfixes et compteurs utilisés pour la génération automatique des numéros de chaque entité."
      />
      <Panel>
        <DataTable colonnes={colonnes} lignes={data.numerotation} />
      </Panel>
      <FormDialog
        open={dlg.open}
        onOpenChange={dlg.setOpen}
        titre={`Numérotation — ${dlg.item?.entite ?? ""}`}
        onSubmit={enregistrer}
      >
        <Grille>
          <Champ label="Préfixe" value={form.prefixe ?? ""} onChange={(v) => setForm((f) => ({ ...f, prefixe: v }))} />
          <Champ
            label="Prochain numéro"
            type="number"
            value={form.prochain ?? 0}
            onChange={(v) => setForm((f) => ({ ...f, prochain: Number(v) }))}
          />
          <Champ
            label="Nombre de chiffres (0 = libre)"
            type="number"
            value={form.digits ?? 0}
            onChange={(v) => setForm((f) => ({ ...f, digits: Number(v) }))}
          />
        </Grille>
        {form.prefixe !== undefined && (
          <p className="text-xs text-muted-foreground">
            Aperçu du prochain numéro : <span className="font-mono">{apercuNumero(form as NumerotationConfig)}</span>
          </p>
        )}
      </FormDialog>
    </div>
  );
}
