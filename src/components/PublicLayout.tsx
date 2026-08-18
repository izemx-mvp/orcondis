import { Link } from "@tanstack/react-router";
import { Menu, MessageCircle } from "lucide-react";
import { useState, type ReactNode } from "react";
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

export function Logo({ dark = false, backoffice = false }: { dark?: boolean; backoffice?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <div className="flex flex-col">
        <span className={`text-xl font-black tracking-tighter leading-none ${dark ? "text-white" : "text-navy"}`}>
          ORCONDIS
        </span>
        {backoffice && (
          <span className="text-[10px] font-medium opacity-70">Back-Office</span>
        )}
      </div>
    </span>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/site">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/site" }}
                activeProps={{ className: "bg-accent text-navy" }}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-navy"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link to="/connexion">Connexion</Link>
            </Button>
            <Button asChild size="sm">
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

      <footer className="border-t border-border bg-navy text-navy-foreground">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo dark />
            <p className="mt-3 max-w-sm text-sm text-navy-foreground/70">
              ORCONDIS. Services de courses, accompagnement et prestations de proximité.
            </p>
            <a
              href="https://wa.me/212666709941"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-whatsapp px-3 py-2 text-sm font-medium text-whatsapp-foreground transition-transform hover:scale-105"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp ORCONDIS
            </a>
          </div>
          <div>
            <p className="text-sm font-semibold">Navigation</p>
            <ul className="mt-3 space-y-2 text-sm text-navy-foreground/70">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-navy-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Contact</p>
            <ul className="mt-3 space-y-2 text-sm text-navy-foreground/70">
              <li>Casablanca, Maroc</li>
              <li>0666 70 99 41</li>
              <li>orcondiscourses@gmail.com</li>
              <li>Lundi – Vendredi : 08h00 – 18h30</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-navy-foreground/10 py-4 text-center text-xs text-navy-foreground/60">
          © {new Date().getFullYear()} ORCONDIS — Created by IZEMX
        </div>
      </footer>
    </div>
  );
}
