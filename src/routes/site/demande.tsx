import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, MessageCircle, ArrowRight, Zap, Globe, Smartphone, Mail, MapPin } from "lucide-react";
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
import { AnimatedBackground } from "@/components/ui/design-system/AnimatedBackground";
import { cn } from "@/lib/utils";

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
        <section className="relative overflow-hidden py-24 sm:py-32 flex flex-col items-center">
          <AnimatedBackground variant="restrained" />
          <div className="surface-card p-12 lg:p-16 text-center max-w-xl mx-auto shadow-elevated border-none bg-white/70 backdrop-blur-xl rounded-[3rem] animate-in zoom-in-95 duration-500">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-success/10 text-success mb-8">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-black text-navy tracking-tight mb-4">Demande envoyée !</h1>
            <p className="text-lg text-muted-foreground font-medium mb-10">
              Merci Karim, votre demande est enregistrée sous la référence :
              <span className="block mt-4 text-5xl font-black text-primary tracking-tighter">{submitted.numero}</span>
            </p>
            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 mb-10">
              <p className="text-sm font-bold text-navy/70 italic">
                "Notre assistant WhatsApp vous contactera dans quelques minutes pour finaliser les détails opérationnels."
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Button asChild size="lg" className="h-16 rounded-2xl font-black text-lg bg-whatsapp hover:bg-whatsapp/90 shadow-xl shadow-whatsapp/20 hover:scale-[1.02] transition-all">
                <a href={`https://wa.me/212666709941`}>
                  <MessageCircle className="mr-3 h-6 w-6" /> Continuer sur WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-16 rounded-2xl font-black text-lg">
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
      <section className="relative overflow-hidden py-24 sm:py-32">
        <AnimatedBackground variant="ambient" />
        <div className="mx-auto w-full max-w-4xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
             <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-black text-primary uppercase tracking-[0.2em] mb-6">
              <Zap className="h-4 w-4 fill-primary" /> Qualification express
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-navy sm:text-7xl leading-[0.9]">
              Lancer une mission
            </h1>
            <p className="mt-8 text-xl text-muted-foreground font-medium">
              Décrivez votre besoin en 2 minutes. Nous nous occupons du reste.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="surface-card p-10 lg:p-16 shadow-elevated border-none bg-white/70 backdrop-blur-xl rounded-[3rem] relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary via-info to-primary animate-pulse" />
            
            <div className="space-y-12">
              {/* Type de client */}
              <div>
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6 block">Vous êtes :</Label>
                <div className="flex flex-wrap gap-8">
                  {CATEGORIES_CLIENT.map((opt) => (
                    <label key={opt} className={cn(
                      "flex items-center gap-4 px-6 py-4 rounded-2xl border-2 transition-all cursor-pointer font-bold",
                      form.categorie === opt 
                        ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5" 
                        : "border-border/40 bg-white/50 text-navy/60 hover:border-primary/20"
                    )}>
                      <input
                        type="radio"
                        name="categorie"
                        value={opt}
                        checked={form.categorie === opt}
                        onChange={() => setField("categorie", opt)}
                        className="h-5 w-5 text-primary border-border cursor-pointer focus:ring-offset-0 focus:ring-0"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Informations identité */}
              <div className="grid gap-8 sm:grid-cols-2">
                {form.categorie === "Personne physique" && (
                  <>
                    <div className="space-y-3">
                      <Label htmlFor="prenom" className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40">Prénom</Label>
                      <Input
                        id="prenom"
                        value={form.prenom}
                        onChange={(e) => setField("prenom", e.target.value)}
                        className="h-14 rounded-2xl bg-white/50 border-border/40 focus:ring-primary/20 px-6 font-black text-navy"
                        placeholder="Ex: Karim"
                      />
                      {errors.prenom && <p className="mt-1 text-xs text-destructive font-bold">{errors.prenom}</p>}
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="nom" className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40">Nom</Label>
                      <Input
                        id="nom"
                        value={form.nom}
                        onChange={(e) => setField("nom", e.target.value)}
                        className="h-14 rounded-2xl bg-white/50 border-border/40 focus:ring-primary/20 px-6 font-black text-navy"
                        placeholder="Ex: Bennani"
                      />
                      {errors.nom && <p className="mt-1 text-xs text-destructive font-bold">{errors.nom}</p>}
                    </div>
                  </>
                )}

                {form.categorie === "Entreprise" && (
                  <div className="sm:col-span-2 space-y-3">
                    <Label htmlFor="denomination" className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40">Dénomination</Label>
                    <Input
                      id="denomination"
                      value={form.denomination}
                      onChange={(e) => setField("denomination", e.target.value)}
                      className="h-14 rounded-2xl bg-white/50 border-border/40 px-6 font-black"
                      placeholder="Nom de l'entreprise"
                    />
                  </div>
                )}

                {form.categorie === "Société" && (
                  <div className="sm:col-span-2 space-y-3">
                    <Label htmlFor="raisonSociale" className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40">Raison sociale</Label>
                    <Input
                      id="raisonSociale"
                      value={form.raisonSociale}
                      onChange={(e) => setField("raisonSociale", e.target.value)}
                      className="h-14 rounded-2xl bg-white/50 border-border/40 px-6 font-black"
                      placeholder="Ex: ORCONDIS SARL"
                    />
                  </div>
                )}
              </div>

              {/* Coordonnées */}
              <div className="pt-8 border-t border-border/40">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8">Coordonnées de contact</p>
                <div className="grid gap-8 sm:grid-cols-2">
                  <div className="space-y-3">
                    <Label htmlFor="gsm" className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40 flex items-center gap-2">
                       <Smartphone className="h-3 w-3" /> GSM / Mobile
                    </Label>
                    <Input id="gsm" value={form.gsm} onChange={(e) => setField("gsm", e.target.value)} className="h-14 rounded-2xl bg-white/50 border-border/40 px-6 font-black" placeholder="06..." />
                    {errors.telephone && <p className="mt-1 text-xs text-destructive font-bold">{errors.telephone}</p>}
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40 flex items-center gap-2">
                      <Mail className="h-3 w-3" /> Email
                    </Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} className="h-14 rounded-2xl bg-white/50 border-border/40 px-6 font-black" placeholder="karim@exemple.com" />
                    {errors.email && <p className="mt-1 text-xs text-destructive font-bold">{errors.email}</p>}
                  </div>
                   <div className="sm:col-span-2 space-y-3">
                    <Label htmlFor="adresseComplete" className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40 flex items-center gap-2">
                       <MapPin className="h-3 w-3" /> Localisation à Casablanca
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                       <Input id="quartier" value={form.quartier} onChange={(e) => setField("quartier", e.target.value)} className="h-14 rounded-2xl bg-white/50 border-border/40 px-6 font-black" placeholder="Quartier (Ex: Maarif)" />
                       <Input id="ville" value={form.ville} readOnly className="h-14 rounded-2xl bg-muted/20 border-border/40 px-6 font-black text-navy/40" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails mission */}
              <div className="pt-8 border-t border-border/40">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8">Détails de la mission</p>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="service" className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40">Type de prestation</Label>
                    <Select value={form.service} onValueChange={(v) => setField("service", v)}>
                      <SelectTrigger id="service" className="h-14 rounded-2xl bg-white/50 border-border/40 px-6 font-black text-left">
                        <SelectValue placeholder="Choisir un service" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl p-2">
                        {SERVICES.map((service) => (
                          <SelectItem key={service} value={service} className="rounded-xl font-bold py-3">
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.service && <p className="mt-1 text-xs text-destructive font-bold">{errors.service}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="messageInitial" className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40">Description du besoin</Label>
                    <Textarea
                      id="messageInitial"
                      value={form.messageInitial}
                      onChange={(e) => setField("messageInitial", e.target.value)}
                      className="min-h-[160px] rounded-[2rem] bg-white/50 border-border/40 px-6 py-5 font-bold text-lg resize-none"
                      placeholder="Expliquez-nous en quelques mots votre besoin précis..."
                    />
                    {errors.messageInitial && <p className="mt-1 text-xs text-destructive font-bold">{errors.messageInitial}</p>}
                  </div>
                </div>
              </div>

              {/* Consentement */}
              <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10">
                <div className="flex items-start gap-4">
                  <Checkbox
                    id="consentement"
                    checked={form.consentementWhatsApp}
                    onCheckedChange={(checked) => setField("consentementWhatsApp", checked === true)}
                    className="mt-1 h-6 w-6 rounded-lg border-primary/40 data-[state=checked]:bg-primary"
                  />
                  <Label htmlFor="consentement" className="cursor-pointer text-base font-bold leading-relaxed text-navy/80">
                    J’accepte d’être contacté par ORCONDIS via WhatsApp pour la qualification opérationnelle immédiate de ma demande.
                  </Label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-8 flex flex-wrap items-center gap-6">
                <Button type="submit" size="lg" className="flex-1 sm:flex-none min-w-[280px] rounded-[1.5rem] h-20 px-12 text-xl font-black shadow-2xl shadow-primary/30 hover:scale-105 transition-all group">
                  Lancer la mission <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button asChild type="button" variant="outline" size="lg" className="flex-1 sm:flex-none rounded-[1.5rem] h-20 px-10 text-xl font-black border-whatsapp text-whatsapp hover:bg-whatsapp/5">
                  <a href="https://wa.me/212666709941">
                    <MessageCircle className="mr-3 h-6 w-6" /> WhatsApp Direct
                  </a>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}
