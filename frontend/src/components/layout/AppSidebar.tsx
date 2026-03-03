import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, Receipt, ArrowLeftRight, Users, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PactumLogo } from "@/components/shared/PactumLogo";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/agreements", label: "Agreements", icon: FileText },
  { to: "/invoices", label: "Invoices", icon: Receipt },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  return (
    <aside className={cn(
      "sticky top-0 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Branding */}
      <NavLink to="/" className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4 hover:bg-sidebar-accent transition-colors">
        <PactumLogo size={32} />
        {!collapsed && <span className="text-lg font-bold tracking-tight text-foreground">Pactum</span>}
      </NavLink>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex h-10 items-center justify-center border-t border-sidebar-border text-sidebar-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
