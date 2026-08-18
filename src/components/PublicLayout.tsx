import { Link } from "@tanstack/react-router";
import { Menu, MessageCircle, MapPin, Phone, Mail } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { to: "/site", label: "Accueil" },
  { to: "/site/services", label: "Nos services" },
  { to: "/site/comment-ca-marche", label: "Comment ça marche" },
  { to: "/site/demande", label: "Faire une demande" },
  { to: "/site/a-propos", label: "À propos" },
  { to: "/site/contact", label: "Contact" },
] as const;

export function Logo({ dark = false, backoffice = false, className }: { dark?: boolean; backoffice?: boolean; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-1 group transition-transform hover:scale-105 duration-300", className)}>
      <div className="relative">
        <img 
          src="/assets/orcondis-logo.png" 
          alt="ORCONDIS" 
          className={cn(
            "object-contain transition-all",
            backoffice ? "h-12 w-auto" : "h-14 md:h-16 lg:h-20 w-auto"
          )}
          style={{ maxWidth: backoffice ? '180px' : '210px' }}
        />
      </div>
      {backoffice && (
        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 text-white mt-1">
          Back-Office
        </span>
      )}
    </div>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6">
          <Link to="/site">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex bg-muted/20 p-1 rounded-2xl border border-border/50">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/site" }}
                activeProps={{ className: "bg-white dark:bg-navy shadow-sm text-primary" }}
                className="rounded-xl px-4 py-2 text-sm font-bold text-muted-foreground transition-all hover:text-navy hover:scale-105"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex rounded-xl font-bold">
              <Link to="/connexion">Connexion</Link>
            </Button>
            <Button asChild size="sm" className="rounded-xl font-bold px-6 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
              <Link to="/site/demande">Faire une demande</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-border bg-surface px-4 py-2 lg:hidden">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-navy"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/connexion"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-navy"
            >
              Connexion
            </Link>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.02),transparent)]" />
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 relative z-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo dark />
            <p className="mt-6 max-w-sm text-base text-white/50 font-medium">
              ORCONDIS est votre partenaire de confiance pour toutes vos courses professionnelles, démarches administratives et prestations de proximité à Casablanca.
            </p>
            <div className="mt-8 flex gap-4">
               <a
                href="https://wa.me/212666709941"
                className="flex items-center gap-2 rounded-2xl bg-whatsapp/10 border border-whatsapp/20 px-6 py-3 text-sm font-black text-whatsapp transition-all hover:bg-whatsapp hover:text-white hover:scale-105"
              >
                <MessageCircle className="h-5 w-5" /> WhatsApp Direct
              </a>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">Navigation</p>
            <ul className="space-y-4">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-white/60 font-bold hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">Contact</p>
            <ul className="space-y-4 text-white/60 font-medium">
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-white/30" /> Casablanca, Maroc
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-white/30" /> 0666 70 99 41
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-white/30" /> orcondiscourses@gmail.com
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 py-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
            © {new Date().getFullYear()} ORCONDIS — Created by IZEMX
          </p>
        </div>
      </footer>
    </div>
  );
}
