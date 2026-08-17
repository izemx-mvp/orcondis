import { Button } from "@/components/ui/button";
import { Champ, ChampSelect, ChampTexte, Grille } from "@/components/bo/kit";
import { ZONES, type PointOps } from "@/lib/bo/ops-data";

export function EditeurPoint({
  titre,
  point,
  onChange,
  onSupprimer,
}: {
  titre: string;
  point: PointOps;
  onChange: (p: PointOps) => void;
  onSupprimer?: () => void;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-navy">{titre}</p>
        {onSupprimer && (
          <Button size="sm" variant="ghost" onClick={onSupprimer}>
            Supprimer
          </Button>
        )}
      </div>
      <Grille cols={2}>
        <ChampSelect label="Zone" value={point.zone} onChange={(v) => onChange({ ...point, zone: v })} options={ZONES} />
        <Champ label="Ville" value={point.ville} onChange={(v) => onChange({ ...point, ville: v })} />
      </Grille>
      <Grille cols={2}>
        <Champ label="Quartier" value={point.quartier} onChange={(v) => onChange({ ...point, quartier: v })} />
        <Champ label="Adresse" value={point.adresse} onChange={(v) => onChange({ ...point, adresse: v })} />
      </Grille>
      <Grille cols={2}>
        <Champ label="Contact" value={point.contact} onChange={(v) => onChange({ ...point, contact: v })} />
        <Champ label="GSM" value={point.gsm} onChange={(v) => onChange({ ...point, gsm: v })} />
      </Grille>
      <ChampTexte label="Instructions" value={point.instructions} onChange={(v) => onChange({ ...point, instructions: v })} rows={2} />
    </div>
  );
}
