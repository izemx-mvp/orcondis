// ORCONDIS — Règles de fonctionnement et paramètres métier.
import { useState } from "react";
import { useBO } from "@/lib/bo-store";
import { Panel, PageHeader, Champ, ChampTexte, Grille } from "@/components/bo/kit";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const UTILISATEUR_COURANT = "Yassine Bennani";

export function SectionRegles() {
  const { data, set, log } = useBO();
  
  const [regles, setRegles] = useState(data.regles || {
    commandeVeilleObligatoire: true,
    autoriserDemandeMemeJour: true,
    supplementMemeJour: "Potentiel / À étudier",
    rayonStandardKm: 7,
    poidsMaxStandardKg: 3,
    tarifMensuelMin: 900,
  });

  const enregistrer = () => {
    log({
      entite: "Règles",
      entiteId: "regles",
      utilisateur: UTILISATEUR_COURANT,
      action: "Mise à jour des règles d'exploitation",
      ancienneValeur: "—",
      nouvelleValeur: "Config mise à jour",
    });
    set("regles", regles);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        titre="Règles d'exploitation"
        sous="Paramètres commerciaux et contraintes opérationnelles d'ORCONDIS."
        actions={<Button onClick={enregistrer}>Enregistrer</Button>}
      />

      <div className="grid gap-6">
        <Panel titre="Délais et Commandes">
          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label>Commande la veille obligatoire</Label>
                <p className="text-xs text-muted-foreground italic">Applique une règle de courtoisie commerciale pour les courses standards.</p>
              </div>
              <Switch 
                checked={regles.commandeVeilleObligatoire} 
                onCheckedChange={(checked) => setRegles({...regles, commandeVeilleObligatoire: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between space-x-2 border-t pt-4">
              <div className="space-y-0.5">
                <Label>Autoriser les demandes le jour même</Label>
                <p className="text-xs text-muted-foreground italic">Permet aux clients de soumettre des demandes pour aujourd'hui.</p>
              </div>
              <Switch 
                checked={regles.autoriserDemandeMemeJour} 
                onCheckedChange={(checked) => setRegles({...regles, autoriserDemandeMemeJour: checked})}
              />
            </div>

            <div className="border-t pt-4">
              <Champ 
                label="Message / Supplément (Même jour)" 
                value={regles.supplementMemeJour} 
                onChange={(v) => setRegles({...regles, supplementMemeJour: v})}
              />
              <p className="mt-1 text-xs text-muted-foreground">Note affichée en interne lors d'une demande le jour même.</p>
            </div>
          </div>
        </Panel>

        <Panel titre="Standards de Service">
          <Grille cols={2}>
            <Champ 
              label="Rayon standard (km)" 
              type="number"
              value={regles.rayonStandardKm} 
              onChange={(v) => setRegles({...regles, rayonStandardKm: Number(v)})}
            />
            <Champ 
              label="Poids maximum standard (kg)" 
              type="number"
              value={regles.poidsMaxStandardKg} 
              onChange={(v) => setRegles({...regles, poidsMaxStandardKg: Number(v)})}
            />
          </Grille>
        </Panel>

        <Panel titre="Tarification Minimum">
          <div className="max-w-xs">
            <Champ 
              label="Prestation mensuelle minimum (DH HT)" 
              type="number"
              value={regles.tarifMensuelMin} 
              onChange={(v) => setRegles({...regles, tarifMensuelMin: Number(v)})}
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
