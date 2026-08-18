// ORCONDIS — Services et Zones (référentiels avec champs spécifiques).
import { ReferentielTable } from "./generic";
import type { ServiceParam, ZoneParam } from "@/lib/bo-data";
import { dh } from "@/lib/bo-data";

export function SectionServices() {
  return (
    <ReferentielTable<ServiceParam>
      collectionKey="services"
      entiteLabel="Service"
      idPrefix="SRV"
      titre="Services"
      sous="Prestations proposées aux clients avec leur prix par défaut et leur procédure associée."
      fields={[
        { key: "prixDefaut", label: "Prix par défaut (MAD)", type: "number" },
        { key: "procedure", label: "Procédure associée", type: "text" },
      ]}
      extraColumns={[
        { cle: "prixDefaut", titre: "Prix par défaut", rendu: (r) => dh(r.prixDefaut ?? 0) },
        { cle: "procedure", titre: "Procédure", rendu: (r) => r.procedure || "—" },
      ]}
      extraDefaults={{ prixDefaut: 0, procedure: "" }}
    />
  );
}

export function SectionZones() {
  return (
    <ReferentielTable<ZoneParam>
      collectionKey="zones"
      entiteLabel="Zone"
      idPrefix="ZN"
      titre="Zones"
      sous="Découpage géographique utilisé pour la tarification et l’affectation des coursiers."
      fields={[
        { key: "ville", label: "Ville", type: "text" },
        { key: "quartiers", label: "Quartiers", type: "text" },
      ]}
      extraColumns={[
        { cle: "ville", titre: "Ville", rendu: (r) => r.ville || "—" },
        { cle: "quartiers", titre: "Quartiers", rendu: (r) => r.quartiers || "—" },
      ]}
      extraDefaults={{ ville: "", quartiers: "" }}
    />
  );
}
