import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ClipboardList, LayoutDashboard, Store, UtensilsCrossed } from "lucide-react";

const navigation = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard },
  { label: "Restaurant", to: "/admin/restaurant", icon: Store },
  { label: "Menu", to: "/admin/menu", icon: UtensilsCrossed },
  { label: "Orders", to: "/admin/orders", icon: ClipboardList },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();

  return (
    <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
      <aside className="h-fit rounded-2xl border bg-card p-3 lg:sticky lg:top-24">
        <p className="hidden px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:block">Manage restaurant</p>
        <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Restaurant dashboard">
          {navigation.map(({ label, to, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
};

export default AdminLayout;
