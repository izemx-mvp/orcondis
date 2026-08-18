// ORCONDIS — Paramètres de la société et règles de fonctionnement.
import { useState, useEffect } from "react";
import { useBO } from "@/lib/bo-store";
import { Panel, PageHeader, Champ, ChampTexte, Grille } from "@/components/bo/kit";
import { Button } from "@/components/ui/button";

const UTILISATEUR_COURANT = "Yassine Bennani";

export function SectionSociete() {
  const { data, set, log } = useBO();
  const [form, setForm] = useState(data.societe || {
    nom: "ORCONDIS",
    nomCommercial: "Tizzla and Serve",
    telephone: "0666 70 99 41",
    email: "orcondiscourses@gmail.com",
    horaires: "Lundi – Vendredi : 08h00 – 18h30",
    villePrincipale: "Casablanca",
    description: "Services de courses, accompagnement et prestations de proximité."
  });

  const enregistrer = () => {
    log({
      entite: "Société",
      entiteId: "societe",
      utilisateur: UTILISATEUR_COURANT,
      action: "Mise à jour des informations société",
      ancienneValeur: "—",
      nouvelleValeur: form.nom,
    });
    set("societe", form);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        titre="Informations société"
        sous="Coordonnées et informations de marque affichées sur le site et les documents."
        actions={<Button onClick={enregistrer}>Enregistrer</Button>}
      />
      <Panel>
        <div className="space-y-4">
          <Grille>
            <Champ label="Nom de la société" value={form.nom} onChange={(v) => setForm((f: any) => ({ ...f, nom: v }))} />
            <Champ label="Nom commercial" value={form.nomCommercial} onChange={(v) => setForm((f: any) => ({ ...f, nomCommercial: v }))} />
            <Champ label="Téléphone" value={form.telephone} onChange={(v) => setForm((f: any) => ({ ...f, telephone: v }))} />
            <Champ label="Email" value={form.email} onChange={(v) => setForm((f: any) => ({ ...f, email: v }))} />
          </Grille>
          <Grille>
            <Champ label="Horaires d'activité" value={form.horaires} onChange={(v) => setForm((f: any) => ({ ...f, horaires: v }))} />
            <Champ label="Ville principale" value={form.villePrincipale} onChange={(v) => setForm((f: any) => ({ ...f, villePrincipale: v }))} />
          </Grille>
          <ChampTexte
            label="Description / Slogan"
            value={form.description}
            onChange={(v) => setForm((f: any) => ({ ...f, description: v }))}
          />
        </div>
      </Panel>
    </div>
  );
}
