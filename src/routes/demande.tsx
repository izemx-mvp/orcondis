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
import { SERVICES } from "@/lib/arcondis";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/demande")({
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
  typeClient: "Nouveau client" as "Client existant" | "Nouveau client",
  nom: "",
  prenom: "",
  societe: "",
  telephone: "",
  whatsapp: "",
  email: "",
  service: "",
  messageInitial: "",
  consentementWhatsApp: true,
};

function Demande() {
  const { creerDemande } = useStore();
  const [submitted, setSubmitted] = useState<ReturnType<typeof creerDemande> | null>(null);
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
    if (!form.nom.trim()) next.nom = "Le nom est requis.";
    if (!form.prenom.trim()) next.prenom = "Le prénom est requis.";
    if (!form.telephone.trim()) next.telephone = "Le téléphone est requis.";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Un email valide est requis.";
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
      service: form.service,
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
                <Link to="/">Retour à l’accueil</Link>
              </Button>
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="text-center">
          <h1 className="text-2xl font-semibold sm:text-3xl">Faire une demande</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Décrivez votre besoin. ORCONDIS le qualifie par WhatsApp et vous tient informé à chaque étape.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 surface-card p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Je suis</Label>
              <div className="mt-2 flex gap-4">
                {(["Nouveau client", "Client existant"] as const).map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="typeClient"
                      value={opt}
                      checked={form.typeClient === opt}
                      onChange={() => setField("typeClient", opt)}
                      className="h-4 w-4 text-primary"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

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

            <div className="sm:col-span-2">
              <Label htmlFor="societe">Société / Organisation (optionnel)</Label>
              <Input
                id="societe"
                value={form.societe}
                onChange={(e) => setField("societe", e.target.value)}
                className="mt-1.5"
                placeholder="Atlas Industrie SARL"
              />
            </div>

            <div>
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                type="tel"
                value={form.telephone}
                onChange={(e) => setField("telephone", e.target.value)}
                className="mt-1.5"
                placeholder="+212 661 00 00 00"
              />
              {errors.telephone && <p className="mt-1 text-xs text-destructive">{errors.telephone}</p>}
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp (si différent)</Label>
              <Input
                id="whatsapp"
                type="tel"
                value={form.whatsapp}
                onChange={(e) => setField("whatsapp", e.target.value)}
                className="mt-1.5"
                placeholder="+212 661 00 00 00"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                className="mt-1.5"
                placeholder="contact@exemple.ma"
              />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="sm:col-span-2">
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
              <Label htmlFor="consentement" className="cursor-pointer text-sm font-normal leading-relaxed">
                J’accepte d’être contacté par ORCONDIS via WhatsApp pour qualifier ma demande.
              </Label>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button type="submit" size="lg">
              Envoyer ma demande <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button asChild type="button" variant="outline" size="lg">
              <a href="https://wa.me/212661000000">
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
              </a>
            </Button>
          </div>
        </form>
      </section>
    </PublicLayout>
  );
}
