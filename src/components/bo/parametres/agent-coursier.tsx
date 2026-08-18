import { useOps } from "@/lib/bo/ops-store";
import { Champ, ChampSelect, ChampCase, Grille, Panel } from "@/components/bo/kit";
import { MODES_COMMUNICATION, MOMENTS_ENVOI } from "@/lib/bo/ops-data";

export function SectionAgentCoursier() {
  const { data, majSettingsAgent } = useOps();
  const s = data.settingsAgent;

  return (
    <Panel titre="Agent de communication coursier">
      <div className="mb-4 text-sm text-muted-foreground">Configuration de l'automate de dispatch des missions.</div>

      <div className="space-y-6">
        <div className="border-b pb-4">
          <ChampCase
            label="Activer l'agent de communication"
            checked={s.actif}
            onChange={(v) => majSettingsAgent({ actif: v })}
          />
          <p className="mt-1 text-xs text-muted-foreground pl-6">
            Si désactivé, aucune communication automatique ne sera programmée ou envoyée.
          </p>
        </div>

        <Grille>
          <ChampSelect
            label="Canal principal"
            value={s.canalPrincipal}
            onChange={(v) => majSettingsAgent({ canalPrincipal: v as any })}
            options={["WhatsApp", "Application", "Les deux"]}
          />
          <ChampSelect
            label="Mode de communication par défaut"
            value={s.modeParDefaut}
            onChange={(v) => majSettingsAgent({ modeParDefaut: v as any })}
            options={MODES_COMMUNICATION}
          />
        </Grille>

        <Grille>
          <ChampSelect
            label="Programmation par défaut"
            value={s.programmationParDefaut}
            onChange={(v) => majSettingsAgent({ programmationParDefaut: v as any })}
            options={MOMENTS_ENVOI}
          />
          {s.programmationParDefaut === "Selon règle automatique ORCONDIS" && (
            <Champ
              label="Heure d'envoi (la veille)"
              type="time"
              value={s.heureLaVeille || "17:00"}
              onChange={(v) => majSettingsAgent({ heureLaVeille: v })}
            />
          )}
          {(s.programmationParDefaut === "X minutes avant la course" || 
            s.programmationParDefaut === "X heures avant la course") && (
            <Champ
              label="Valeur (X)"
              type="number"
              value={s.valeurParDefaut || 0}
              onChange={(v) => majSettingsAgent({ valeurParDefaut: Number(v) })}
            />
          )}
        </Grille>

        <div className="border-t pt-4">
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-navy">Confirmations & Relances</p>
          <Grille>
            <ChampCase
              label="Confirmation obligatoire"
              checked={s.confirmationObligatoire}
              onChange={(v) => majSettingsAgent({ confirmationObligatoire: v })}
            />
            <ChampCase
              label="Relance automatique"
              checked={s.relanceAuto}
              onChange={(v) => majSettingsAgent({ relanceAuto: v })}
            />
          </Grille>
          <Grille>
            <Champ
              label="Délai avant relance (min)"
              type="number"
              value={s.delaiRelance}
              onChange={(v) => majSettingsAgent({ delaiRelance: Number(v) })}
            />
            <Champ
              label="Nombre max de relances"
              type="number"
              value={s.nbRelancesMax}
              onChange={(v) => majSettingsAgent({ nbRelancesMax: Number(v) })}
            />
          </Grille>
        </div>

        <div className="border-t pt-4">
          <ChampSelect
            label="Ton du message"
            value={s.ton}
            onChange={(v) => majSettingsAgent({ ton: v as any })}
            options={["Professionnel", "Direct", "Court"]}
          />
        </div>
      </div>
    </Panel>
  );
}
