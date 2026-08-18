import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/site/contact")({
  head: () => ({
    meta: [
      { title: "Contact — ORCONDIS" },
      {
        name: "description",
        content:
          "Contactez ORCONDIS à Casablanca par téléphone, email ou WhatsApp pour vos courses professionnelles et démarches administratives.",
      },
      { property: "og:title", content: "Contact — ORCONDIS" },
      { property: "og:description", content: "Nos coordonnées et notre formulaire de contact." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [envoye, setEnvoye] = useState(false);

  return (
    <PublicLayout>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
          <h1 className="text-3xl font-semibold sm:text-4xl">Contact</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Notre équipe vous répond du lundi au samedi, de 08h30 à 19h00.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3">
        <div className="space-y-4">
          {[
            { icon: Phone, label: "Téléphone", valeur: "0666 70 99 41" },
            { icon: Mail, label: "Email", valeur: "orcondiscourses@gmail.com" },
            { icon: MapPin, label: "Adresse", valeur: "27, boulevard Zerktouni, Casablanca" },
          ].map((item) => (
            <div key={item.label} className="surface-card flex items-start gap-3 p-4">
              <item.icon className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium text-navy">{item.valeur}</p>
              </div>
            </div>
          ))}
          <Button asChild className="w-full bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90">
            <a href="https://wa.me/212666709941">
              <MessageCircle className="mr-2 h-4 w-4" /> Nous contacter sur WhatsApp
            </a>
          </Button>
        </div>

        <div className="surface-card p-6 lg:col-span-2">
          {envoye ? (
            <div className="py-10 text-center">
              <p className="text-lg font-semibold text-navy">Message envoyé</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Merci, notre équipe revient vers vous dans les meilleurs délais.
              </p>
            </div>
          ) : (
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                setEnvoye(true);
                toast.success("Votre message a bien été envoyé.");
              }}
            >
              <div>
                <Label htmlFor="c-nom">Nom complet</Label>
                <Input id="c-nom" required maxLength={100} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="c-soc">Société</Label>
                <Input id="c-soc" maxLength={120} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="c-tel">Téléphone</Label>
                <Input id="c-tel" required maxLength={30} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="c-mail">Email</Label>
                <Input id="c-mail" type="email" required maxLength={255} className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="c-msg">Message</Label>
                <Textarea id="c-msg" required maxLength={1000} rows={5} className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">Envoyer</Button>
              </div>
            </form>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
