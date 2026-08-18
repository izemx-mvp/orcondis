import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, MessageCircle, ArrowRight } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SERVICES } from "@/lib/orcondis";
import { useStore } from "@/lib/store";
import { CATEGORIES_CLIENT, SOUS_TYPES_AUTRES, type CategorieClient } from "@/lib/bo/ops-data";

export const Route = createFileRoute("/site/demande")({
  head: () => ({
    meta: [
      { title: "Faire une demande — ORCONDIS" },
      {
        name: "description",
        content:
          "Décrivez votre besoin en quelques minutes. ORCONDIS qualifie votre demande par WhatsApp et prend en charge votre course ou démarche administrative.",
      },
      { property: "og:title", content: "Faire une demande — ORCONDIS" },
      {
        property: "og:description",
        content: "Envoyez votre demande de course professionnelle ou démarche administrative à ORCONDIS.",
      },
    ],
  }),
  component: Demande,
});

const initial = {
  categorie: "Personne physique" as CategorieClient,
  sousType: "",
  autrePrecision: "",
  nom: "",
  prenom: "",
  denomination: "",
  raisonSociale: "",
  ville: "Casablanca",
  quartier: "",
  adresseComplete: "",
  pays: "Maroc",
  site: "",
  email: "",
  telephoneFixe: "",
  fax: "",
  gsm: "",
  whatsapp: "",
  facebook: "",
  instagram: "",
  service: "",
  messageInitial: "",
  consentementWhatsApp: true,
};

function Demande() {
  const { creerDemande } = useStore();
  const [submitted, setSubmitted] = useState<any>(null);
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<{
    nom?: string;
    prenom?: string;
    telephone?: string;
    email?: string;
    service?: string;
    messageInitial?: string;
  }>({});

  const setField = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof typeof errors];
        return next;
      });
    }
  };

  const validate = () => {
    const next: typeof errors = {};
    if (form.categorie === "Personne physique") {
      if (!form.nom.trim()) next.nom = "Le nom est requis.";
      if (!form.prenom.trim()) next.prenom = "Le prénom est requis.";
    }
    if (!form.gsm?.trim() && !form.whatsapp?.trim()) next.telephone = "Un contact (GSM ou WhatsApp) est requis.";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Un email valide est requis.";
    if (!form.service) next.service = "Veuillez choisir une prestation.";
    if (!form.messageInitial.trim()) next.messageInitial = "Décrivez votre besoin.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const nouvelle = creerDemande({
      ...form,
      source: "Site web",
      documents: [],
    });
    setSubmitted(nouvelle);
  };

  if (submitted) {
    return (
      <PublicLayout>
        <section className="mx-auto flex w-full max-w-md flex-col px-4 py-16 sm:px-6">
          <div className="surface-card p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-xl font-semibold">Demande envoyée</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Votre demande a été enregistrée sous la référence :
            </p>
            <p className="mt-3 text-2xl font-bold text-navy">{submitted.numero}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              Notre assistant WhatsApp vous contactera rapidement pour compléter les informations.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button asChild variant="outline">
                <a href={`https://wa.me/${submitted.whatsapp.replace(/\D/g, "")}`}>
                  <MessageCircle className="mr-2 h-4 w-4" /> Continuer sur WhatsApp
                </a>
              </Button>
              <Button asChild>
                <Link to="/site">Retour à l’accueil</Link>
              </Button>
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="text-center">
          <h1 className="text-2xl font-black sm:text-4xl text-navy uppercase tracking-tighter">Faire une demande</h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground font-medium">
            ORCONDIS vous accompagne dans vos opérations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-12 surface-card p-6 sm:p-10 shadow-2xl shadow-navy/5 border border-border/50">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Vous êtes :</Label>
              <div className="mt-2 flex flex-wrap gap-4">
                {CATEGORIES_CLIENT.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="categorie"
                      value={opt}
                      checked={form.categorie === opt}
                      onChange={() => setField("categorie", opt)}
                      className="h-4 w-4 text-primary"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {form.categorie === "Personne physique" && (
              <>
                <div>
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    value={form.prenom}
                    onChange={(e) => setField("prenom", e.target.value)}
                    className="mt-1.5"
                    placeholder="Jean"
                  />
                  {errors.prenom && <p className="mt-1 text-xs text-destructive">{errors.prenom}</p>}
                </div>
                <div>
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    value={form.nom}
                    onChange={(e) => setField("nom", e.target.value)}
                    className="mt-1.5"
                    placeholder="Dupont"
                  />
                  {errors.nom && <p className="mt-1 text-xs text-destructive">{errors.nom}</p>}
                </div>
              </>
            )}

            {form.categorie === "Entreprise" && (
              <div className="sm:col-span-2">
                <Label htmlFor="denomination">Dénomination</Label>
                <Input
                  id="denomination"
                  value={form.denomination}
                  onChange={(e) => setField("denomination", e.target.value)}
                  className="mt-1.5"
                  placeholder="Nom de l'entreprise"
                />
              </div>
            )}

            {form.categorie === "Société" && (
              <div className="sm:col-span-2">
                <Label htmlFor="raisonSociale">Raison sociale</Label>
                <Input
                  id="raisonSociale"
                  value={form.raisonSociale}
                  onChange={(e) => setField("raisonSociale", e.target.value)}
                  className="mt-1.5"
                  placeholder="Raison sociale"
                />
              </div>
            )}

            {form.categorie === "Autres" && (
              <>
                <div className="sm:col-span-2">
                  <Label htmlFor="sousType">Type d'organisation</Label>
                  <Select value={form.sousType} onValueChange={(v) => setField("sousType", v)}>
                    <SelectTrigger id="sousType" className="mt-1.5 w-full">
                      <SelectValue placeholder="Choisir un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOUS_TYPES_AUTRES.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="denomination">Dénomination</Label>
                  <Input
                    id="denomination"
                    value={form.denomination}
                    onChange={(e) => setField("denomination", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                {form.sousType === "Autres" && (
                  <div className="sm:col-span-2">
                    <Label htmlFor="autrePrecision">Précisez</Label>
                    <Input
                      id="autrePrecision"
                      value={form.autrePrecision}
                      onChange={(e) => setField("autrePrecision", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                )}
              </>
            )}

            <div className="sm:col-span-2 border-t pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-navy mb-4">Coordonnées</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="ville">Ville</Label>
                  <Input id="ville" value={form.ville} onChange={(e) => setField("ville", e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="quartier">Quartier</Label>
                  <Input id="quartier" value={form.quartier} onChange={(e) => setField("quartier", e.target.value)} className="mt-1.5" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="adresseComplete">Adresse complète</Label>
                  <Input id="adresseComplete" value={form.adresseComplete} onChange={(e) => setField("adresseComplete", e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="gsm">GSM</Label>
                  <Input id="gsm" value={form.gsm} onChange={(e) => setField("gsm", e.target.value)} className="mt-1.5" />
                  {errors.telephone && <p className="mt-1 text-xs text-destructive">{errors.telephone}</p>}
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input id="whatsapp" value={form.whatsapp} onChange={(e) => setField("whatsapp", e.target.value)} className="mt-1.5" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={form.email} onChange={(e) => setField("email", e.target.value)} className="mt-1.5" />
                  {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 border-t pt-4">
              <Label htmlFor="service">Prestation souhaitée</Label>
              <Select value={form.service} onValueChange={(v) => setField("service", v)}>
                <SelectTrigger id="service" className="mt-1.5 w-full">
                  <SelectValue placeholder="Choisir une prestation" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICES.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.service && <p className="mt-1 text-xs text-destructive">{errors.service}</p>}
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="messageInitial">Décrivez votre besoin</Label>
              <Textarea
                id="messageInitial"
                value={form.messageInitial}
                onChange={(e) => setField("messageInitial", e.target.value)}
                className="mt-1.5 min-h-[120px]"
                placeholder="Je dois récupérer un chèque à Maarif et le remettre à mon fournisseur à Aïn Sebaâ avant 11h..."
              />
              {errors.messageInitial && <p className="mt-1 text-xs text-destructive">{errors.messageInitial}</p>}
            </div>

            <div className="sm:col-span-2 flex items-start gap-3">
              <Checkbox
                id="consentement"
                checked={form.consentementWhatsApp}
                onCheckedChange={(checked) => setField("consentementWhatsApp", checked === true)}
              />
              <Label htmlFor="consentement" className="cursor-pointer text-sm font-normal leading-relaxed text-muted-foreground">
                J’accepte d’être contacté par ORCONDIS via WhatsApp pour qualifier ma demande.
              </Label>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Envoyer ma demande <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button asChild type="button" variant="outline" size="lg" className="w-full sm:w-auto">
              <a href="https://wa.me/212666709941">
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
              </a>
            </Button>
          </div>
        </form>
      </section>
    </PublicLayout>
  );
}
