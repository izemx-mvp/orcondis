import { Loader2, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { resolved, mounted, toggle } = useTheme();

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled aria-label="Thème" title="Thème">
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  const isDark = resolved === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      title={isDark ? "Mode clair" : "Mode sombre"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
