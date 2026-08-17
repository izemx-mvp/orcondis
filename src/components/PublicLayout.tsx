import { Link } from "@tanstack/react-router";
import { Menu, MessageCircle } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/services", label: "Nos services" },
  { to: "/comment-ca-marche", label: "Comment ça marche" },
  { to: "/demande", label: "Faire une demande" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
] as const;

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
        A
      </span>
      <span
        className={`text-lg font-semibold tracking-tight ${dark ? "text-navy-foreground" : "text-navy"}`}
      >
        ARCONDIS
      </span>
    </span>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "bg-accent text-navy" }}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-navy"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link to="/connexion">Connexion</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/demande">Faire une demande</Link>
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
              Bureau de services spécialisé dans les courses professionnelles et particulières,
              les démarches administratives, la collecte et la remise de documents, les paiements
              fournisseurs et le traitement des chèques.
            </p>
            <a
              href="https://wa.me/212661000000"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-whatsapp px-3 py-2 text-sm font-medium text-whatsapp-foreground"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp ARCONDIS
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
              <li>+212 661 00 00 00</li>
              <li>contact@arcondis.ma</li>
              <li>Lundi – Samedi : 08h30 – 19h00</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-navy-foreground/10 py-4 text-center text-xs text-navy-foreground/60">
          © {new Date().getFullYear()} ARCONDIS — Created by IZEMX
        </div>
      </footer>
    </div>
  );
}
