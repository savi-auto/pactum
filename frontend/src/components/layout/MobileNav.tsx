import { NavLink } from "react-router-dom";
import { Home, LayoutDashboard, FileText, Receipt, ArrowLeftRight, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/agreements", label: "Agreements", icon: FileText },
  { to: "/invoices", label: "Invoices", icon: Receipt },
  { to: "/transactions", label: "Txns", icon: ArrowLeftRight },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-card/95 backdrop-blur-lg">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) => cn(
            "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium transition-colors",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
