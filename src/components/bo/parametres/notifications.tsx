// ORCONDIS — Modèles de notifications internes (back-office) et activation par type.
import { useState } from "react";
import { useBO } from "@/lib/bo-store";
import { useParamExtra, uidExtra, type NotifTemplate } from "@/lib/bo-param-extra";
import {
  PageHeader,
  Panel,
  DataTable,
  Statut,
  tonStatut,
  Champ,
  ChampTexte,
  FormDialog,
  useDialog,
  type Colonne,
} from "@/components/bo/kit";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";

const UTILISATEUR_COURANT = "Yassine Bennani";

export function SectionNotifications() {
  const { log } = useBO();
  const { data, add, patch, remove } = useParamExtra();
  const dlg = useDialog<NotifTemplate | null>();
  const [form, setForm] = useState<Partial<NotifTemplate>>({});

  const ouvrirNouveau = () => {
    setForm({ type: "", titre: "", message: "", actif: true });
    dlg.ouvrir(null);
  };
  const ouvrirEdition = (item: NotifTemplate) => {
    setForm({ ...item });
    dlg.ouvrir(item);
  };

  const enregistrer = () => {
    if (dlg.item) {
      patch("notifTemplates", dlg.item.id, form);
      log({
        entite: "Notification",
        entiteId: dlg.item.id,
        utilisateur: UTILISATEUR_COURANT,
        action: "Modification modèle de notification",
        ancienneValeur: dlg.item.titre,
        nouvelleValeur: String(form.titre ?? ""),
      });
    } else {
      const item: NotifTemplate = {
        id: uidExtra("NT"),
        type: form.type ?? "",
        titre: form.titre ?? "",
        message: form.message ?? "",
        actif: form.actif ?? true,
      };
      add("notifTemplates", item);
      log({
        entite: "Notification",
        entiteId: item.id,
        utilisateur: UTILISATEUR_COURANT,
        action: "Création modèle de notification",
        ancienneValeur: "—",
        nouvelleValeur: item.titre,
      });
    }
  };

  const supprimer = (item: NotifTemplate) => {
    if (!window.confirm(`Supprimer le modèle « ${item.titre} » ?`)) return;
    remove("notifTemplates", item.id);
    log({
      entite: "Notification",
      entiteId: item.id,
      utilisateur: UTILISATEUR_COURANT,
      action: "Suppression modèle de notification",
      ancienneValeur: item.titre,
      nouvelleValeur: "—",
    });
  };

  const toggleActif = (item: NotifTemplate) => {
    const nv = !item.actif;
    patch("notifTemplates", item.id, { actif: nv });
    log({
      entite: "Notification",
      entiteId: item.id,
      utilisateur: UTILISATEUR_COURANT,
      action: "Changement de statut — Notification",
      ancienneValeur: item.actif ? "Actif" : "Inactif",
      nouvelleValeur: nv ? "Actif" : "Inactif",
    });
  };

  const colonnes: Colonne<NotifTemplate>[] = [
    { cle: "type", titre: "Type", rendu: (r) => <span className="font-medium text-navy">{r.type}</span> },
    { cle: "titre", titre: "Titre", rendu: (r) => r.titre },
    { cle: "message", titre: "Message", rendu: (r) => <span className="text-muted-foreground">{r.message}</span> },
    {
      cle: "actif",
      titre: "Statut",
      rendu: (r) => (
        <button type="button" onClick={() => toggleActif(r)}>
          <Statut ton={tonStatut(r.actif ? "Validée" : "Annulée")}>{r.actif ? "Actif" : "Inactif"}</Statut>
        </button>
      ),
    },
    {
      cle: "actions",
      titre: "Actions",
      align: "right",
      rendu: (r) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" onClick={() => ouvrirEdition(r)} aria-label="Modifier">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => supprimer(r)} aria-label="Supprimer">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        titre="Notifications"
        sous="Modèles des notifications internes affichées aux utilisateurs du back-office, avec activation par type."
        actions={
          <Button onClick={ouvrirNouveau}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        }
      />
      <Panel>
        <DataTable colonnes={colonnes} lignes={data.notifTemplates} vide="Aucun modèle." />
      </Panel>
      <FormDialog open={dlg.open} onOpenChange={dlg.setOpen} titre={dlg.item ? "Modifier le modèle" : "Ajouter un modèle"} onSubmit={enregistrer}>
        <Champ label="Type" value={form.type ?? ""} onChange={(v) => setForm((f) => ({ ...f, type: v }))} />
        <Champ label="Titre" value={form.titre ?? ""} onChange={(v) => setForm((f) => ({ ...f, titre: v }))} />
        <ChampTexte label="Message" value={form.message ?? ""} onChange={(v) => setForm((f) => ({ ...f, message: v }))} />
      </FormDialog>
    </div>
  );
}
