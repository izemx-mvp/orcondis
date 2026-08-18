// ORCONDIS — Règles de tarification générales (tarif général : clientId === "").
import { useState, useEffect } from "react";
import { useBO } from "@/lib/bo-store";
import { Panel, PageHeader, Champ, ChampCase, Grille } from "@/components/bo/kit";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Tarif } from "@/lib/bo-data";

const UTILISATEUR_COURANT = "Yassine Bennani";

export function SectionTarification() {
  const { data, patch, log } = useBO();
  const general = data.tarifs.find((t) => t.clientId === "" && t.service === "Tous services");
  const [form, setForm] = useState<Tarif | null>(general ?? null);

  useEffect(() => {
    setForm(general ?? null);
  }, [general?.id]);

  if (!general || !form) {
    return (
      <div className="space-y-4">
        <PageHeader titre="Règles de tarification" sous="Aucun tarif général n’est configuré." />
      </div>
    );
  }

  const majFacturation = (mode: "mission" | "vide" | "les-deux") => {
    setForm((f) =>
      f
        ? {
            ...f,
            facturerKmMission: mode === "mission" || mode === "les-deux",
            facturerKmVide: mode === "vide" || mode === "les-deux",
          }
        : f,
    );
  };

  const modeActuel: "mission" | "vide" | "les-deux" =
    form.facturerKmMission && form.facturerKmVide
      ? "les-deux"
      : form.facturerKmVide
        ? "vide"
        : "mission";

  const enregistrer = () => {
    const champsSuivis: { k: keyof Tarif; label: string }[] = [
      { k: "franchiseAttente", label: "Franchise d’attente" },
      { k: "tarifAttente", label: "Tarif d’attente" },
      { k: "majorationUrgence", label: "Majoration urgence" },
      { k: "majorationNuit", label: "Majoration nuit" },
      { k: "majorationWeekend", label: "Majoration week-end" },
    ];
    champsSuivis.forEach(({ k, label }) => {
      if (general[k] !== form[k]) {
        log({
          entite: "Tarif",
          entiteId: general.id,
          utilisateur: UTILISATEUR_COURANT,
          action: `Modification règle — ${label}`,
          ancienneValeur: String(general[k]),
          nouvelleValeur: String(form[k]),
        });
      }
    });
    if (general.facturerKmMission !== form.facturerKmMission || general.facturerKmVide !== form.facturerKmVide) {
      log({
        entite: "Tarif",
        entiteId: general.id,
        utilisateur: UTILISATEUR_COURANT,
        action: "Modification règle — Mode de facturation kilométrique",
        ancienneValeur: general.facturerKmMission && general.facturerKmVide ? "Les deux" : general.facturerKmVide ? "Km à vide" : "Km mission",
        nouvelleValeur: modeActuel === "les-deux" ? "Les deux" : modeActuel === "vide" ? "Km à vide" : "Km mission",
      });
    }
    patch("tarifs", general.id, form);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        titre="Règles de tarification"
        sous="Paramètres généraux appliqués par défaut à l’ensemble des clients (tarif général)."
        actions={<Button onClick={enregistrer}>Enregistrer</Button>}
      />
      <Panel titre="Facturation kilométrique">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Mode de facturation des kilomètres</Label>
          <div className="flex flex-wrap gap-4 text-sm">
            {[
              { v: "mission", l: "Km mission uniquement" },
              { v: "vide", l: "Km à vide uniquement" },
              { v: "les-deux", l: "Les deux" },
            ].map((o) => (
              <label key={o.v} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="mode-km"
                  checked={modeActuel === o.v}
                  onChange={() => majFacturation(o.v as any)}
                  className="h-4 w-4"
                />
                {o.l}
              </label>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <Grille cols={3}>
            <Champ
              label="Prix au km (mission, MAD)"
              type="number"
              value={form.prixKm}
              onChange={(v) => setForm((f) => (f ? { ...f, prixKm: Number(v) } : f))}
            />
            <Champ
              label="Prix au km (à vide, MAD)"
              type="number"
              value={form.prixKmVide}
              onChange={(v) => setForm((f) => (f ? { ...f, prixKmVide: Number(v) } : f))}
            />
            <Champ
              label="Prix destination supplémentaire (MAD)"
              type="number"
              value={form.prixDestinationSup}
              onChange={(v) => setForm((f) => (f ? { ...f, prixDestinationSup: Number(v) } : f))}
            />
          </Grille>
        </div>
      </Panel>
      <Panel titre="Temps d’attente">
        <Grille cols={2}>
          <Champ
            label="Franchise d’attente par défaut (minutes)"
            type="number"
            value={form.franchiseAttente}
            onChange={(v) => setForm((f) => (f ? { ...f, franchiseAttente: Number(v) } : f))}
          />
          <Champ
            label="Tarif d’attente (MAD / minute au-delà de la franchise)"
            type="number"
            value={form.tarifAttente}
            onChange={(v) => setForm((f) => (f ? { ...f, tarifAttente: Number(v) } : f))}
          />
        </Grille>
      </Panel>
      <Panel titre="Majorations (%)">
        <Grille cols={3}>
          <Champ
            label="Majoration urgence (%)"
            type="number"
            value={form.majorationUrgence}
            onChange={(v) => setForm((f) => (f ? { ...f, majorationUrgence: Number(v) } : f))}
          />
          <Champ
            label="Majoration nuit (%)"
            type="number"
            value={form.majorationNuit}
            onChange={(v) => setForm((f) => (f ? { ...f, majorationNuit: Number(v) } : f))}
          />
          <Champ
            label="Majoration week-end (%)"
            type="number"
            value={form.majorationWeekend}
            onChange={(v) => setForm((f) => (f ? { ...f, majorationWeekend: Number(v) } : f))}
          />
        </Grille>
      </Panel>
      <Panel titre="Prestation de base">
        <Grille cols={2}>
          <Champ
            label="Prix fixe (MAD)"
            type="number"
            value={form.prixFixe}
            onChange={(v) => setForm((f) => (f ? { ...f, prixFixe: Number(v) } : f))}
          />
          <ChampCase
            label="Facturer les km à vide"
            checked={form.facturerKmVide}
            onChange={(v) => setForm((f) => (f ? { ...f, facturerKmVide: v } : f))}
          />
        </Grille>
      </Panel>
    </div>
  );
}
