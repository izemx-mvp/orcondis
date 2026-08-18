import { Link, useRouterState } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Bell,
  Building2,
  ClipboardList,
  FileText,
  FolderKanban,
  Gauge,
  Inbox,
  Menu,
  MessageCircle,
  Receipt,
  Route as RouteIcon,
  Search,
  Settings,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useBO, useLookups } from "@/lib/bo-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/PublicLayout";
import { dh, fr } from "@/lib/bo-data";

type NavItem = { to: string; label: string; icon: typeof Gauge; exact?: boolean };

const NAV: NavItem[] = [
  { to: "/backoffice/dashboard", label: "Tableau de bord", icon: Gauge },
  { to: "/backoffice/demandes", label: "Demandes entrantes", icon: Inbox },
  { to: "/backoffice/clients", label: "Clients", icon: Building2 },
  { to: "/backoffice/dossiers", label: "Dossiers", icon: FolderKanban },
  { to: "/backoffice/courses", label: "Courses", icon: RouteIcon },
  { to: "/backoffice/coursiers", label: "Coursiers", icon: Truck },
  { to: "/backoffice/procedures", label: "Procédures", icon: ClipboardList },
  { to: "/backoffice/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { to: "/backoffice/fournisseurs", label: "Fournisseurs & Paiements", icon: Building2 },
  { to: "/backoffice/paiements", label: "Paiements", icon: Wallet },
  { to: "/backoffice/documents", label: "Documents", icon: FileText },
  { to: "/backoffice/facturation", label: "Facturation", icon: Receipt },
  { to: "/backoffice/rapports", label: "Rapports", icon: Gauge },
  { to: "/backoffice/parametres", label: "Paramètres", icon: Settings },
];

function GlobalSearch() {
  const { data } = useBO();
  const [q, setQ] = useState("");
  const terme = q.trim().toLowerCase();

  const resultats = useMemo(() => {
    if (terme.length < 2) return [];
    const out: { id: string; label: string; detail: string; to: string }[] = [];
    const match = (...v: (string | undefined)[]) =>
      v.filter(Boolean).some((x) => (x as string).toLowerCase().includes(terme));

    data.clients.forEach((c) => {
      if (match(c.code, c.raisonSociale, c.contactPrincipal, c.gsm, c.whatsapp, c.email))
        out.push({ id: c.id, label: `${c.code} — ${c.raisonSociale}`, detail: "Client", to: "/backoffice/clients" });
      c.contacts.forEach((ct) => {
        if (match(ct.nom, ct.gsm, ct.email))
          out.push({ id: ct.id, label: ct.nom, detail: `Contact · ${c.raisonSociale}`, to: "/backoffice/clients" });
      });
    });
    data.dossiers.forEach((d) => {
      if (match(d.numero, d.intitule)) out.push({ id: d.id, label: `${d.numero} — ${d.intitule}`, detail: "Dossier", to: "/backoffice/dossiers" });
    });
    data.courses.forEach((c) => {
      if (match(c.numero, c.demandeNumero, c.service))
        out.push({ id: c.id, label: `${c.numero} — ${c.service}`, detail: "Course", to: "/backoffice/courses" });
    });
    data.coursiers.forEach((c) => {
      if (match(c.code, c.nom, c.gsm)) out.push({ id: c.id, label: `${c.code} — ${c.nom}`, detail: "Coursier", to: "/backoffice/coursiers" });
    });
    data.fournisseurs.forEach((f) => {
      if (match(f.code, f.raisonSociale, f.contact, f.gsm))
        out.push({ id: f.id, label: `${f.code} — ${f.raisonSociale}`, detail: "Fournisseur", to: "/backoffice/fournisseurs" });
    });
    data.paiements.forEach((p) => {
      if (match(p.numero, p.numeroCheque, p.banque))
        out.push({ id: p.id, label: `${p.numero}${p.numeroCheque ? ` · chèque ${p.numeroCheque}` : ""}`, detail: `Paiement · ${dh(p.montant, p.devise)}`, to: "/backoffice/paiements" });
    });
    data.factures.forEach((f) => {
      if (match(f.numero, f.periode)) out.push({ id: f.id, label: f.numero, detail: "Facture", to: "/backoffice/facturation" });
    });
    data.conversations.forEach((c) => {
      if (match(c.numero, c.clientNom, c.demandeNumero))
        out.push({ id: c.id, label: `${c.clientNom} — ${c.numero}`, detail: "WhatsApp", to: "/backoffice/whatsapp" });
    });
    return out.slice(0, 12);
  }, [data, terme]);

  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Recherche globale : client, contact, N° course, chèque…"
        className="pl-9"
      />
      {resultats.length > 0 && (
        <div className="absolute left-0 right-0 top-11 z-50 max-h-80 overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-lg">
          {resultats.map((r) => (
            <Link
              key={`${r.detail}-${r.id}`}
              to={r.to}
              onClick={() => setQ("")}
              className="block rounded-md px-3 py-2 text-sm hover:bg-surface"
            >
              <span className="font-medium text-navy">{r.label}</span>
              <span className="ml-2 text-xs text-muted-foreground">{r.detail}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationCenter() {
  const { data, marquerLue, toutMarquerLu } = useBO();
  const [open, setOpen] = useState(false);
  const nonLues = data.notifications.filter((n) => !n.lue).length;

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
        <Bell className="h-4 w-4" />
        {nonLues > 0 && (
          <Badge className="ml-2 h-5 min-w-5 justify-center px-1 text-[11px]">{nonLues}</Badge>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-96 rounded-lg border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <p className="text-sm font-semibold text-navy">Notifications</p>
            <Button variant="ghost" size="sm" onClick={toutMarquerLu}>
              Tout marquer lu
            </Button>
          </div>
          <ul className="max-h-96 divide-y divide-border overflow-y-auto">
            {data.notifications.map((n) => (
              <li key={n.id} className={`px-3 py-2 text-sm ${n.lue ? "opacity-60" : ""}`}>
                <button className="w-full text-left" onClick={() => marquerLue(n.id)}>
                  <p className="flex items-center gap-2 font-medium text-navy">
                    {n.gravite !== "info" && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
                    {n.titre}
                  </p>
                  <p className="text-xs text-muted-foreground">{n.detail}</p>
                  <p className="text-[11px] text-muted-foreground">{n.date}</p>
                </button>
              </li>
            ))}
            {data.notifications.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">Aucune notification.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export function BOLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data } = useBO();
  const alertesWA = data.conversations.filter((c) => c.statut === "Intervention humaine").length;

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 overflow-y-auto border-r border-border bg-navy text-navy-foreground transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <Link to="/backoffice/dashboard" className="flex items-center gap-2">
            <Logo dark backoffice />
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-0.5 px-2 pb-8">
          {NAV.map((n) => {
            const actif = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  actif ? "bg-primary text-primary-foreground" : "text-navy-foreground/80 hover:bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{n.label}</span>
                {n.label === "WhatsApp" && alertesWA > 0 && (
                  <span className="rounded-full bg-destructive px-1.5 text-[11px] text-destructive-foreground">
                    {alertesWA}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>
          <GlobalSearch />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <NotificationCenter />
            <Button asChild variant="ghost" size="sm">
              <Link to="/">Site public</Link>
            </Button>
          </div>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">{children}</main>
        <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} ORCONDIS — Created by IZEMX
        </footer>
      </div>
    </div>
  );
}
