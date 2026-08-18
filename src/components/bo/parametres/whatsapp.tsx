// ORCONDIS — Réglages de l’agent WhatsApp et modèles de messages.
import { useState, useEffect } from "react";
import { useBO } from "@/lib/bo-store";
import { Panel, PageHeader, Champ, ChampTexte, ChampCase, Grille } from "@/components/bo/kit";
import { Button } from "@/components/ui/button";
import { ReferentielTable } from "./generic";
import type { Referentiel } from "@/lib/bo-data";

const UTILISATEUR_COURANT = "Yassine Bennani";

export function SectionWhatsapp() {
  const { data, set, log } = useBO();
  const [form, setForm] = useState(data.whatsapp);

  useEffect(() => setForm(data.whatsapp), [data.whatsapp]);

  const enregistrer = () => {
    (Object.keys(form) as (keyof typeof form)[]).forEach((k) => {
      if (form[k] !== data.whatsapp[k]) {
        log({
          entite: "WhatsApp",
          entiteId: "whatsapp",
          utilisateur: UTILISATEUR_COURANT,
          action: `Modification réglage — ${k}`,
          ancienneValeur: String(data.whatsapp[k]),
          nouvelleValeur: String(form[k]),
        });
      }
    });
    set("whatsapp", form);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        titre="WhatsApp"
        sous="Configuration de l’agent conversationnel et des modèles de messages envoyés aux clients."
        actions={<Button onClick={enregistrer}>Enregistrer</Button>}
      />
      <Panel titre="Agent WhatsApp">
        <div className="space-y-4">
          <Grille>
            <Champ label="Numéro WhatsApp" value={form.numero} onChange={(v) => setForm((f) => ({ ...f, numero: v }))} />
            <Champ label="Horaires" value={form.horaires} onChange={(v) => setForm((f) => ({ ...f, horaires: v }))} />
            <Champ label="Tonalité" value={form.tonalite} onChange={(v) => setForm((f) => ({ ...f, tonalite: v }))} />
            <ChampCase label="Agent actif" checked={form.agentActif} onChange={(v) => setForm((f) => ({ ...f, agentActif: v }))} />
          </Grille>
          <ChampTexte
            label="Message de bienvenue"
            value={form.messageBienvenue}
            onChange={(v) => setForm((f) => ({ ...f, messageBienvenue: v }))}
          />
          <ChampTexte
            label="Règle de bascule vers un agent humain"
            value={form.handoffHumain}
            onChange={(v) => setForm((f) => ({ ...f, handoffHumain: v }))}
          />
        </div>
      </Panel>
      <ReferentielTable<Referentiel>
        collectionKey="modelesNotification"
        entiteLabel="Modèle de message WhatsApp"
        idPrefix="MN"
        titre="Modèles de messages"
        sous="Textes types utilisés par l’agent WhatsApp pour communiquer avec les clients."
      />
    </div>
  );
}
