import { useMemo, useState } from "react";
import { useBO, useLookups } from "@/lib/bo-store";
import {
  calculerCourse,
  tarifApplicable,
  totalFacture,
  dh,
  fr,
  uid,
  today,
  daysAhead,
  STATUTS_FACTURE,
  type Facture,
  type LigneFacture,
  type Course,
} from "@/lib/bo-data";
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
  ChampSelect,
  useDialog,
  type Colonne,
} from "@/components/bo/kit";
import { Button } from "@/components/ui/button";
import { coursesEligibles, genererNumeroFacture, telechargerTexte } from "./shared";

const MOYENS = ["Chèque", "Virement", "Espèces", "Autre"] as const;

function facturePdfTexte(f: Facture, lk: ReturnType<typeof useLookups>) {
  const t = totalFacture(f);
  const lignes = f.lignes
    .map((l) => `  - ${l.libelle} : ${dh(l.montant)}`)
    .join("\n");
  return `ORCONDIS — FACTURE ${f.numero}
Client : ${lk.clientNom(f.clientId)}
Période : ${f.periode} (${fr(f.dateDebut)} → ${fr(f.dateFin)})
Dossiers : ${f.dossiers.join(", ") || "—"}
Date d'émission : ${fr(f.dateEmission)}
Date d'échéance : ${fr(f.dateEcheance)}
Statut : ${f.statut}

Lignes de facturation :
${lignes || "  (aucune)"}

Sous-total : ${dh(t.sousTotal)}
Frais : ${dh(f.frais)}
Remises : ${dh(f.remises)}
Taxes (${f.tauxTaxe}%) : ${dh(t.taxes)}
TOTAL : ${dh(t.total)}
Montant payé : ${dh(t.paye)}
Reste à payer : ${dh(t.reste)}
`;
}

export function Factures() {
  const { data, add, patch, log } = useBO();
  const lk = useLookups();
  const [recherche, setRecherche] = useState("");
  const [client, setClient] = useState("");
  const [statut, setStatut] = useState("");
  const [debut, setDebut] = useState("");
  const [fin, setFin] = useState("");

  const detailDialog = useDialog<Facture>();
  const editDialog = useDialog<Facture>();
  const creerDialog = useDialog<null>();
  const paiementDialog = useDialog<Facture>();

  const [form, setForm] = useState<{ clientId: string; periode: string; dateDebut: string; dateFin: string }>({
    clientId: "",
    periode: "",
    dateDebut: today(),
    dateFin: today(),
  });
  const [paiementForm, setPaiementForm] = useState({ montant: "0", moyen: "Virement", reference: "" });

  const factures = useMemo(() => {
    const t = recherche.trim().toLowerCase();
    return data.factures.filter((f) => {
      if (client && f.clientId !== client) return false;
      if (statut && f.statut !== statut) return false;
      if (debut && f.dateEmission && f.dateEmission < debut) return false;
      if (fin && f.dateEmission && f.dateEmission > fin) return false;
      if (t && !(`${f.numero} ${lk.clientNom(f.clientId)} ${f.periode}`.toLowerCase().includes(t))) return false;
      return true;
    });
  }, [data.factures, recherche, client, statut, debut, fin, lk]);

  const colonnes: Colonne<Facture>[] = [
    { cle: "numero", titre: "N° facture", rendu: (f) => <span className="font-medium text-navy">{f.numero}</span> },
    { cle: "client", titre: "Client", rendu: (f) => lk.clientNom(f.clientId) },
    { cle: "periode", titre: "Période", rendu: (f) => f.periode },
    { cle: "dossiers", titre: "Dossiers", rendu: (f) => f.dossiers.join(", ") || "—" },
    { cle: "courses", titre: "Courses", rendu: (f) => f.lignes.length },
    { cle: "sousTotal", titre: "Sous-total", rendu: (f) => dh(totalFacture(f).sousTotal), align: "right" },
    { cle: "frais", titre: "Frais", rendu: (f) => dh(f.frais), align: "right" },
    { cle: "remises", titre: "Remises", rendu: (f) => dh(f.remises), align: "right" },
    { cle: "taxes", titre: "Taxes", rendu: (f) => dh(totalFacture(f).taxes), align: "right" },
    { cle: "total", titre: "Total", rendu: (f) => <span className="font-semibold text-navy">{dh(totalFacture(f).total)}</span>, align: "right" },
    { cle: "paye", titre: "Payé", rendu: (f) => dh(totalFacture(f).paye), align: "right" },
    { cle: "reste", titre: "Reste", rendu: (f) => dh(totalFacture(f).reste), align: "right" },
    { cle: "emission", titre: "Émission", rendu: (f) => fr(f.dateEmission) },
    { cle: "echeance", titre: "Échéance", rendu: (f) => fr(f.dateEcheance) },
    { cle: "statut", titre: "Statut", rendu: (f) => <Statut ton={tonStatut(f.statut)}>{f.statut}{f.archive ? " · archivée" : ""}</Statut> },
    {
      cle: "actions",
      titre: "Actions",
      rendu: (f) => (
        <div className="flex flex-wrap justify-end gap-1">
          <Button size="sm" variant="outline" onClick={() => detailDialog.ouvrir(f)}>Voir</Button>
          {f.statut === "Brouillon" && (
            <Button size="sm" variant="outline" onClick={() => editDialog.ouvrir(f)}>Modifier</Button>
          )}
          {f.statut === "Brouillon" && (
            <Button
              size="sm"
              onClick={() => {
                patch("factures", f.id, { statut: "À valider" });
                log({ entite: "Facture", entiteId: f.id, utilisateur: "Back-Office", action: "Génération de la facture", ancienneValeur: "Brouillon", nouvelleValeur: "À valider" });
              }}
            >
              Générer
            </Button>
          )}
          {f.statut === "À valider" && (
            <Button
              size="sm"
              onClick={() => {
                patch("factures", f.id, { statut: "Émise", dateEmission: today(), dateEcheance: f.dateEcheance || daysAhead(30) });
                f.lignes.forEach((l) => patch("courses", l.courseId, { statut: "Facturée", factureId: f.id }));
                log({ entite: "Facture", entiteId: f.id, utilisateur: "Back-Office", action: "Validation de la facture", ancienneValeur: "À valider", nouvelleValeur: "Émise" });
              }}
            >
              Valider
            </Button>
          )}
          {(f.statut === "Émise") && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                patch("factures", f.id, { statut: "Envoyée" });
                log({ entite: "Facture", entiteId: f.id, utilisateur: "Back-Office", action: "Envoi de la facture au client", ancienneValeur: "Émise", nouvelleValeur: "Envoyée" });
              }}
            >
              Envoyer
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              telechargerTexte(`${f.numero}.txt`, facturePdfTexte(f, lk));
              log({ entite: "Facture", entiteId: f.id, utilisateur: "Back-Office", action: "Téléchargement du PDF de facture", ancienneValeur: "", nouvelleValeur: "" });
            }}
          >
            PDF
          </Button>
          {["Émise", "Envoyée", "Partiellement payée", "En retard"].includes(f.statut) && (
            <Button size="sm" onClick={() => { setPaiementForm({ montant: String(totalFacture(f).reste), moyen: "Virement", reference: "" }); paiementDialog.ouvrir(f); }}>
              Paiement
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const num = genererNumeroFacture(data.factures);
              add("factures", { ...f, id: uid("fac"), numero: num, statut: "Brouillon", dateEmission: "", reglements: [] });
              log({ entite: "Facture", entiteId: num, utilisateur: "Back-Office", action: "Duplication de facture", ancienneValeur: f.numero, nouvelleValeur: num });
            }}
          >
            Dupliquer
          </Button>
          {!["Payée", "Annulée"].includes(f.statut) && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                patch("factures", f.id, { statut: "Annulée" });
                log({ entite: "Facture", entiteId: f.id, utilisateur: "Back-Office", action: "Annulation de la facture", ancienneValeur: f.statut, nouvelleValeur: "Annulée" });
              }}
            >
              Annuler
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              patch("factures", f.id, { archive: !f.archive });
              log({ entite: "Facture", entiteId: f.id, utilisateur: "Back-Office", action: f.archive ? "Restauration de la facture" : "Archivage de la facture", ancienneValeur: "", nouvelleValeur: "" });
            }}
          >
            {f.archive ? "Restaurer" : "Archiver"}
          </Button>
        </div>
      ),
      align: "right",
    },
  ];

  const eligibles = useMemo(() => coursesEligibles(data.courses, data.factures), [data.courses, data.factures]);
  const detailFacture = detailDialog.item;
  const editFacture = editDialog.item;

  return (
    <div className="space-y-4">
      <FilterBar>
        <SearchInput value={recherche} onChange={setRecherche} placeholder="Rechercher une facture…" />
        <SelectFilter label="Client" value={client} onChange={setClient} options={data.clients.map((c) => c.id)} />
        <SelectFilter label="Statut" value={statut} onChange={setStatut} options={STATUTS_FACTURE} />
        <input type="date" value={debut} onChange={(e) => setDebut(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm" />
        <input type="date" value={fin} onChange={(e) => setFin(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm" />
        <Button
          size="sm"
          onClick={() => {
            setForm({ clientId: data.clients[0]?.id ?? "", periode: "Facturation manuelle", dateDebut: today(), dateFin: today() });
            creerDialog.ouvrir(null);
          }}
        >
          Créer une facture
        </Button>
      </FilterBar>

      <DataTable colonnes={colonnes} lignes={factures} vide="Aucune facture." />

      {/* Détail facture */}
      <FormDialog open={detailDialog.open} onOpenChange={detailDialog.setOpen} titre={`Facture ${detailFacture?.numero ?? ""}`} large>
        {detailFacture && (
          <div className="space-y-3">
            <Grille cols={3}>
              <Detail label="Client">{lk.clientNom(detailFacture.clientId)}</Detail>
              <Detail label="Période">{detailFacture.periode}</Detail>
              <Detail label="Dossiers">{detailFacture.dossiers.join(", ") || "—"}</Detail>
              <Detail label="Émission">{fr(detailFacture.dateEmission)}</Detail>
              <Detail label="Échéance">{fr(detailFacture.dateEcheance)}</Detail>
              <Detail label="Statut">{detailFacture.statut}</Detail>
            </Grille>
            <div className="rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-surface text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Course</th>
                    <th className="px-3 py-2">Libellé</th>
                    <th className="px-3 py-2 text-right">Montant</th>
                    <th className="px-3 py-2 text-right">Retirer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {detailFacture.lignes.map((l) => (
                    <tr key={l.id}>
                      <td className="px-3 py-2">{lk.course(l.courseId)?.numero ?? l.courseId}</td>
                      <td className="px-3 py-2">{l.libelle}</td>
                      <td className="px-3 py-2 text-right">{dh(l.montant)}</td>
                      <td className="px-3 py-2 text-right">
                        {detailFacture.statut === "Brouillon" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const lignes = detailFacture.lignes.filter((x) => x.id !== l.id);
                              patch("factures", detailFacture.id, { lignes });
                              patch("courses", l.courseId, { statut: "À facturer", factureId: "" });
                              log({ entite: "Facture", entiteId: detailFacture.id, utilisateur: "Back-Office", action: "Retrait d'une course de la facture", ancienneValeur: l.courseId, nouvelleValeur: "" });
                              detailDialog.setOpen(false);
                            }}
                          >
                            Retirer
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {detailFacture.lignes.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">Aucune ligne.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {detailFacture.statut === "Brouillon" && (
              <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Ajouter une course éligible</p>
                <div className="flex flex-wrap gap-2">
                  {eligibles
                    .filter((c) => c.clientId === detailFacture.clientId)
                    .map((c) => (
                      <Button
                        key={c.id}
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const t = tarifApplicable(data.tarifs, c);
                          const calc = calculerCourse(c, t);
                          const ligne: LigneFacture = { id: uid("lig"), courseId: c.id, libelle: `${c.numero} — ${c.service}`, montant: calc.total };
                          patch("factures", detailFacture.id, { lignes: [...detailFacture.lignes, ligne] });
                          patch("courses", c.id, { statut: "Facturée", factureId: detailFacture.id });
                          log({ entite: "Facture", entiteId: detailFacture.id, utilisateur: "Back-Office", action: "Ajout d'une course à la facture", ancienneValeur: "", nouvelleValeur: c.numero });
                          detailDialog.setOpen(false);
                        }}
                      >
                        + {c.numero}
                      </Button>
                    ))}
                  {eligibles.filter((c) => c.clientId === detailFacture.clientId).length === 0 && (
                    <p className="text-sm text-muted-foreground">Aucune course éligible pour ce client.</p>
                  )}
                </div>
              </div>
            )}
            <Grille cols={3}>
              <Detail label="Sous-total">{dh(totalFacture(detailFacture).sousTotal)}</Detail>
              <Detail label="Taxes">{dh(totalFacture(detailFacture).taxes)}</Detail>
              <Detail label="Total">{dh(totalFacture(detailFacture).total)}</Detail>
              <Detail label="Payé">{dh(totalFacture(detailFacture).paye)}</Detail>
              <Detail label="Reste">{dh(totalFacture(detailFacture).reste)}</Detail>
            </Grille>
            {detailFacture.reglements.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Règlements</p>
                <ul className="space-y-1 text-sm">
                  {detailFacture.reglements.map((r) => (
                    <li key={r.id} className="rounded-md border border-border bg-surface/60 px-3 py-1.5">
                      {fr(r.date)} · {dh(r.montant)} · {r.moyen} · {r.reference || "—"}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </FormDialog>

      {/* Modifier brouillon (métadonnées) */}
      <FormDialog
        open={editDialog.open}
        onOpenChange={editDialog.setOpen}
        titre={`Modifier le brouillon — ${editFacture?.numero ?? ""}`}
        submitLabel="Enregistrer"
        onSubmit={() => {
          if (!editFacture) return;
          patch("factures", editFacture.id, {
            periode: form.periode,
            dateDebut: form.dateDebut,
            dateFin: form.dateFin,
            dateEcheance: daysAhead(30),
          });
          log({ entite: "Facture", entiteId: editFacture.id, utilisateur: "Back-Office", action: "Modification du brouillon", ancienneValeur: "", nouvelleValeur: "" });
        }}
      >
        <Grille>
          <Champ label="Période" value={form.periode} onChange={(v) => setForm((f) => ({ ...f, periode: v }))} />
          <Champ label="Date début" type="date" value={form.dateDebut} onChange={(v) => setForm((f) => ({ ...f, dateDebut: v }))} />
          <Champ label="Date fin" type="date" value={form.dateFin} onChange={(v) => setForm((f) => ({ ...f, dateFin: v }))} />
        </Grille>
      </FormDialog>

      {/* Créer facture */}
      <FormDialog
        open={creerDialog.open}
        onOpenChange={creerDialog.setOpen}
        titre="Créer une facture"
        submitLabel="Créer le brouillon"
        onSubmit={() => {
          if (!form.clientId) return;
          const numero = genererNumeroFacture(data.factures);
          const facture: Facture = {
            id: uid("fac"),
            numero,
            clientId: form.clientId,
            periode: form.periode || "Facturation manuelle",
            dateDebut: form.dateDebut,
            dateFin: form.dateFin,
            dossiers: [],
            lignes: [],
            frais: 0,
            remises: 0,
            tauxTaxe: 20,
            dateEmission: "",
            dateEcheance: daysAhead(30),
            statut: "Brouillon",
            reglements: [],
            notes: "",
            archive: false,
          };
          add("factures", facture);
          log({ entite: "Facture", entiteId: numero, utilisateur: "Back-Office", action: "Création d'une facture", ancienneValeur: "", nouvelleValeur: numero });
        }}
      >
        <Grille>
          <ChampSelect
            label="Client"
            value={form.clientId}
            onChange={(v) => setForm((f) => ({ ...f, clientId: v }))}
            options={data.clients.map((c) => ({ value: c.id, label: c.raisonSociale }))}
          />
          <Champ label="Période" value={form.periode} onChange={(v) => setForm((f) => ({ ...f, periode: v }))} />
          <Champ label="Date début" type="date" value={form.dateDebut} onChange={(v) => setForm((f) => ({ ...f, dateDebut: v }))} />
          <Champ label="Date fin" type="date" value={form.dateFin} onChange={(v) => setForm((f) => ({ ...f, dateFin: v }))} />
        </Grille>
      </FormDialog>

      {/* Enregistrer paiement */}
      <FormDialog
        open={paiementDialog.open}
        onOpenChange={paiementDialog.setOpen}
        titre={`Enregistrer un paiement — ${paiementDialog.item?.numero ?? ""}`}
        submitLabel="Enregistrer"
        onSubmit={() => {
          const f = paiementDialog.item;
          if (!f) return;
          const montant = Number(paiementForm.montant) || 0;
          if (montant <= 0) return;
          const reglement = { id: uid("reg"), date: today(), montant, moyen: paiementForm.moyen, reference: paiementForm.reference };
          const reglements = [...f.reglements, reglement];
          const totaux = totalFacture({ ...f, reglements });
          const statut = totaux.reste <= 0 ? "Payée" : "Partiellement payée";
          patch("factures", f.id, { reglements, statut });
          log({ entite: "Facture", entiteId: f.id, utilisateur: "Back-Office", action: "Enregistrement d'un paiement", ancienneValeur: "", nouvelleValeur: dh(montant) });
        }}
      >
        <Grille>
          <Champ label="Montant" type="number" value={paiementForm.montant} onChange={(v) => setPaiementForm((f) => ({ ...f, montant: v }))} />
          <ChampSelect label="Moyen" value={paiementForm.moyen} onChange={(v) => setPaiementForm((f) => ({ ...f, moyen: v }))} options={MOYENS} />
          <Champ label="Référence" value={paiementForm.reference} onChange={(v) => setPaiementForm((f) => ({ ...f, reference: v }))} />
        </Grille>
      </FormDialog>
    </div>
  );
}
