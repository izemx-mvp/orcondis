import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedBackground } from "@/components/ui/design-system/AnimatedBackground";

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
      <section className="relative overflow-hidden py-24 sm:py-32">
        <AnimatedBackground variant="ambient" />
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
            <h1 className="text-5xl font-black tracking-tighter text-navy sm:text-7xl leading-[0.9]">
              Contactez-nous
            </h1>
            <p className="mt-8 text-xl text-muted-foreground font-medium">
              Une équipe à votre écoute du lundi au samedi, de 08h30 à 19h00.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-3 items-start">
            <div className="space-y-6">
              {[
                { icon: Phone, label: "Téléphone", valeur: "0666 70 99 41", color: "bg-primary/5 text-primary" },
                { icon: Mail, label: "Email", valeur: "orcondiscourses@gmail.com", color: "bg-info/5 text-info" },
                { icon: MapPin, label: "Adresse", valeur: "27, boulevard Zerktouni, Casablanca", color: "bg-success/5 text-success" },
                { icon: Clock, label: "Horaires", valeur: "Lun - Sam: 08:30 - 19:00", color: "bg-warning/5 text-warning" },
              ].map((item, i) => (
                <div 
                  key={item.label} 
                  className="surface-card group flex items-start gap-5 p-8 border border-border/40 hover:border-primary/20 transition-all hover:shadow-elevated animate-in fade-in slide-in-from-left-8 duration-700"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">{item.label}</p>
                    <p className="text-lg font-black text-navy">{item.valeur}</p>
                  </div>
                </div>
              ))}
              
              <Button asChild className="w-full h-16 rounded-2xl bg-whatsapp text-white hover:bg-whatsapp/90 font-black text-lg shadow-xl shadow-whatsapp/20 hover:scale-[1.02] transition-all">
                <a href="https://wa.me/212666709941">
                  <MessageCircle className="mr-3 h-6 w-6" /> WhatsApp Direct
                </a>
              </Button>
            </div>

            <div className="surface-card p-10 lg:p-14 lg:col-span-2 shadow-elevated border-none bg-white/70 backdrop-blur-xl relative overflow-hidden rounded-[2.5rem]">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-info opacity-50" />
              
              {envoye ? (
                <div className="py-20 text-center animate-in zoom-in-95 duration-500">
                  <div className="h-20 w-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h2 className="text-3xl font-black text-navy tracking-tight">Message envoyé !</h2>
                  <p className="mt-6 text-lg text-muted-foreground font-medium max-w-sm mx-auto">
                    Merci Karim, notre équipe revient vers vous dans les meilleurs délais sur WhatsApp ou par téléphone.
                  </p>
                  <Button variant="outline" onClick={() => setEnvoye(false)} className="mt-10 rounded-xl">Envoyer un autre message</Button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-black text-navy tracking-tight mb-10">Laissez-nous un message</h3>
                  <form
                    className="grid gap-8 sm:grid-cols-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setEnvoye(true);
                      toast.success("Votre message a bien été envoyé.");
                    }}
                  >
                    <div className="space-y-3">
                      <Label htmlFor="c-nom" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Nom complet</Label>
                      <Input id="c-nom" required maxLength={100} className="h-12 rounded-xl bg-muted/20 border-border/40 font-medium" placeholder="Votre nom" />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="c-soc" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Société (Optionnel)</Label>
                      <Input id="c-soc" maxLength={120} className="h-12 rounded-xl bg-muted/20 border-border/40 font-medium" placeholder="Ex: AXA Maroc" />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="c-tel" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Téléphone</Label>
                      <Input id="c-tel" required maxLength={30} className="h-12 rounded-xl bg-muted/20 border-border/40 font-medium" placeholder="06..." />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="c-mail" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Email</Label>
                      <Input id="c-mail" type="email" required maxLength={255} className="h-12 rounded-xl bg-muted/20 border-border/40 font-medium" placeholder="email@exemple.com" />
                    </div>
                    <div className="sm:col-span-2 space-y-3">
                      <Label htmlFor="c-msg" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Message</Label>
                      <Textarea id="c-msg" required maxLength={1000} rows={5} className="rounded-xl bg-muted/20 border-border/40 font-medium resize-none" placeholder="Décrivez votre besoin..." />
                    </div>
                    <div className="sm:col-span-2 pt-4">
                      <Button type="submit" size="lg" className="h-14 px-10 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                        Envoyer mon message <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
