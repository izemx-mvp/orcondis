import { useMemo, useState } from "react";
import { useBO, useLookups } from "@/lib/bo-store";
import { calculerCourse, tarifApplicable, dh, fr, type Course } from "@/lib/bo-data";
import {
  DataTable,
  FilterBar,
  FormDialog,
  Grille,
  SearchInput,
  SelectFilter,
  Statut,
  tonStatut,
  Detail,
  Champ,
  useDialog,
  type Colonne,
} from "@/components/bo/kit";
import { Button } from "@/components/ui/button";
import { coursesEligibles } from "./shared";

export function CoursesAFacturer() {
  const { data, patch, log } = useBO();
  const lk = useLookups();
  const [recherche, setRecherche] = useState("");
  const [client, setClient] = useState("");
  const [service, setService] = useState("");
  const [statut, setStatut] = useState("");
  const [debut, setDebut] = useState("");
  const [fin, setFin] = useState("");

  const verifDialog = useDialog<Course>();
  const modifDialog = useDialog<Course>();
  const [form, setForm] = useState<Partial<Course>>({});

  const base = useMemo(() => coursesEligibles(data.courses, data.factures), [data.courses, data.factures]);

  const lignes = useMemo(() => {
    const t = recherche.trim().toLowerCase();
    return base.filter((c) => {
      if (client && c.clientId !== client) return false;
      if (service && c.service !== service) return false;
      if (statut && c.statut !== statut) return false;
      if (debut && c.date < debut) return false;
      if (fin && c.date > fin) return false;
      if (t && !(`${c.numero} ${lk.clientNom(c.clientId)} ${lk.dossierNom(c.dossierId)}`.toLowerCase().includes(t)))
        return false;
      return true;
    });
  }, [base, recherche, client, service, statut, debut, fin, lk]);

  const services = useMemo(() => Array.from(new Set(data.courses.map((c) => c.service))), [data.courses]);
  const statuts = useMemo(() => Array.from(new Set(base.map((c) => c.statut))), [base]);

  const colonnes: Colonne<Course>[] = [
    { cle: "numero", titre: "Course", rendu: (c) => <span className="font-medium text-navy">{c.numero}</span> },
    { cle: "client", titre: "Client", rendu: (c) => lk.clientNom(c.clientId) },
    { cle: "dossier", titre: "Dossier", rendu: (c) => lk.dossierNom(c.dossierId) },
    { cle: "date", titre: "Date", rendu: (c) => fr(c.date) },
    { cle: "service", titre: "Service", rendu: (c) => c.service },
    { cle: "km", titre: "Km", rendu: (c) => c.kmMission, align: "right" },
    { cle: "kmVide", titre: "Km à vide", rendu: (c) => c.kmVide, align: "right" },
    { cle: "attente", titre: "Attente", rendu: (c) => `${c.attenteMinutes} min`, align: "right" },
    { cle: "frais", titre: "Frais", rendu: (c) => dh(c.fraisSupplementaires), align: "right" },
    {
      cle: "montant",
      titre: "Montant calculé",
      rendu: (c) => {
        const t = tarifApplicable(data.tarifs, c);
        const calc = calculerCourse(c, t);
        return <span className="font-semibold text-navy">{dh(calc.total)}</span>;
      },
      align: "right",
    },
    { cle: "statut", titre: "Statut", rendu: (c) => <Statut ton={tonStatut(c.statut)}>{c.statut}</Statut> },
    {
      cle: "actions",
      titre: "Actions",
      rendu: (c) => (
        <div className="flex flex-wrap justify-end gap-1">
          <Button size="sm" variant="outline" onClick={() => verifDialog.ouvrir(c)}>
            Vérifier
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setForm(c);
              modifDialog.ouvrir(c);
            }}
          >
            Modifier
          </Button>
          <Button
            size="sm"
            onClick={() => {
              patch("courses", c.id, { statut: "À facturer" });
              log({ entite: "Course", entiteId: c.id, utilisateur: "Back-Office", action: "Inclusion pour facturation", ancienneValeur: c.statut, nouvelleValeur: "À facturer" });
            }}
          >
            Inclure
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              patch("courses", c.id, { statut: "Annulée", notes: `${c.notes} [Non facturable]`.trim() });
              log({ entite: "Course", entiteId: c.id, utilisateur: "Back-Office", action: "Marquée non facturable", ancienneValeur: c.statut, nouvelleValeur: "Annulée" });
            }}
          >
            Non facturable
          </Button>
        </div>
      ),
      align: "right",
    },
  ];

  const courseVerif = verifDialog.item;
  const calcVerif = courseVerif ? calculerCourse(courseVerif, tarifApplicable(data.tarifs, courseVerif)) : null;

  return (
    <div className="space-y-4">
      <FilterBar>
        <SearchInput value={recherche} onChange={setRecherche} placeholder="Rechercher une course…" />
        <SelectFilter label="Client" value={client} onChange={setClient} options={data.clients.map((c) => c.id)} />
        <SelectFilter label="Service" value={service} onChange={setService} options={services} />
        <SelectFilter label="Statut" value={statut} onChange={setStatut} options={statuts} />
        <input type="date" value={debut} onChange={(e) => setDebut(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm" />
        <input type="date" value={fin} onChange={(e) => setFin(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm" />
      </FilterBar>

      <DataTable colonnes={colonnes} lignes={lignes} vide="Aucune course à facturer." />

      <FormDialog
        open={verifDialog.open}
        onOpenChange={verifDialog.setOpen}
        titre={`Détail du calcul — ${courseVerif?.numero ?? ""}`}
        large
      >
        {courseVerif && calcVerif && (
          <div className="space-y-3">
            <Grille cols={3}>
              <Detail label="Client">{lk.clientNom(courseVerif.clientId)}</Detail>
              <Detail label="Dossier">{lk.dossierNom(courseVerif.dossierId)}</Detail>
              <Detail label="Service">{courseVerif.service}</Detail>
            </Grille>
            <div className="rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-surface text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Élément de calcul</th>
                    <th className="px-3 py-2 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {calcVerif.lignes.map((l, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">{l.libelle}</td>
                      <td className="px-3 py-2 text-right">{dh(l.montant)}</td>
                    </tr>
                  ))}
                  {calcVerif.lignes.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-3 py-4 text-center text-muted-foreground">
                        Aucun tarif applicable trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border font-semibold text-navy">
                    <td className="px-3 py-2">Total</td>
                    <td className="px-3 py-2 text-right">{dh(calcVerif.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {!calcVerif.tarif && <p className="text-sm text-destructive">Aucun tarif applicable — configurez la grille tarifaire.</p>}
          </div>
        )}
      </FormDialog>

      <FormDialog
        open={modifDialog.open}
        onOpenChange={modifDialog.setOpen}
        titre={`Modifier la course — ${modifDialog.item?.numero ?? ""}`}
        submitLabel="Enregistrer"
        onSubmit={() => {
          if (!modifDialog.item) return;
          patch("courses", modifDialog.item.id, {
            kmDepart: Number(form.kmDepart) || 0,
            kmArrivee: Number(form.kmArrivee) || 0,
            kmMission: Number(form.kmMission) || 0,
            kmVide: Number(form.kmVide) || 0,
            heureArrivee: form.heureArrivee ?? "",
            heureDepart: form.heureDepart ?? "",
            attenteMinutes: Number(form.attenteMinutes) || 0,
            fraisSupplementaires: Number(form.fraisSupplementaires) || 0,
          });
          log({
            entite: "Course",
            entiteId: modifDialog.item.id,
            utilisateur: "Back-Office",
            action: "Modification des données de facturation",
            ancienneValeur: "",
            nouvelleValeur: "Km / attente / frais mis à jour",
          });
        }}
        large
      >
        <Grille cols={3}>
          <Champ label="Km départ" type="number" value={form.kmDepart ?? 0} onChange={(v) => setForm((f) => ({ ...f, kmDepart: Number(v) }))} />
          <Champ label="Km arrivée" type="number" value={form.kmArrivee ?? 0} onChange={(v) => setForm((f) => ({ ...f, kmArrivee: Number(v) }))} />
          <Champ label="Km mission" type="number" value={form.kmMission ?? 0} onChange={(v) => setForm((f) => ({ ...f, kmMission: Number(v) }))} />
          <Champ label="Km à vide" type="number" value={form.kmVide ?? 0} onChange={(v) => setForm((f) => ({ ...f, kmVide: Number(v) }))} />
          <Champ label="Heure d'arrivée" type="time" value={form.heureArrivee ?? ""} onChange={(v) => setForm((f) => ({ ...f, heureArrivee: v }))} />
          <Champ label="Heure de départ" type="time" value={form.heureDepart ?? ""} onChange={(v) => setForm((f) => ({ ...f, heureDepart: v }))} />
          <Champ label="Attente (minutes)" type="number" value={form.attenteMinutes ?? 0} onChange={(v) => setForm((f) => ({ ...f, attenteMinutes: Number(v) }))} />
          <Champ label="Frais supplémentaires" type="number" value={form.fraisSupplementaires ?? 0} onChange={(v) => setForm((f) => ({ ...f, fraisSupplementaires: Number(v) }))} />
        </Grille>
      </FormDialog>
    </div>
  );
}
