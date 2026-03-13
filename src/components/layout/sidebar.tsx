"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileStack,
  ClipboardCheck,
  FileBarChart2,
  Settings,
  PanelLeftClose,
  PanelLeft,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/lib/supabase/client";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Templates", href: "/templates", icon: FileStack },
  { label: "Assessments", href: "/assessments", icon: ClipboardCheck },
  { label: "Reports", href: "/reports", icon: FileBarChart2 },
  { label: "Settings", href: "/settings", icon: Settings },
];

function Sidebar(): React.ReactNode {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  // Close mobile menu on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  }

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  async function handleSignOut(): Promise<void> {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/login");
    router.refresh();
  }

  const displayName =
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "User";
  const displayEmail = user?.email ?? "";

  const sidebarContent = (
    <>
      {/* Logo / App name */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-border-muted px-4",
          collapsed && "justify-center px-0 max-md:justify-start max-md:px-4",
        )}
      >
        {collapsed ? (
          <>
            <span className="font-serif text-lg font-normal text-accent md:block hidden">G</span>
            <span className="font-serif text-lg tracking-tight text-ink md:hidden">
              GRC Report Generator
            </span>
          </>
        ) : (
          <span className="font-serif text-lg tracking-tight text-ink">
            GRC Report Generator
          </span>
        )}

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-auto rounded p-1.5 text-ink-muted hover:bg-surface-alt hover:text-ink md:hidden"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors duration-150",
                    collapsed && "md:justify-center md:px-0",
                    active
                      ? "border-l-2 border-accent bg-accent-subtle text-accent"
                      : "border-l-2 border-transparent text-ink-muted hover:bg-surface-alt hover:text-ink",
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      "shrink-0",
                      active ? "text-accent" : "text-ink-subtle group-hover:text-ink-muted",
                    )}
                    size={20}
                  />
                  <span className={cn(collapsed && "md:hidden")}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User area */}
      <div className="border-t border-border-muted px-2 py-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded px-3 py-2",
            collapsed && "md:justify-center md:px-0",
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-inset text-ink-subtle">
            <User size={16} />
          </div>
          <div className={cn("min-w-0 flex-1", collapsed && "md:hidden")}>
            <p className="truncate text-sm font-medium text-ink">
              {displayName}
            </p>
            <p className="truncate text-xs text-ink-subtle">
              {displayEmail}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-border-muted px-2 py-2 flex flex-col gap-0.5">
        <button
          onClick={handleSignOut}
          className={cn(
            "flex w-full items-center gap-3 rounded px-3 py-2 text-sm text-ink-muted transition-colors duration-150 hover:bg-danger-bg hover:text-danger",
            collapsed && "md:justify-center md:px-0",
          )}
          title={collapsed ? "Sign out" : undefined}
          aria-label="Sign out"
        >
          <LogOut size={16} />
          <span className={cn(collapsed && "md:hidden")}>Sign out</span>
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "hidden md:flex w-full items-center gap-3 rounded px-3 py-2 text-sm text-ink-muted transition-colors duration-150 hover:bg-surface-alt hover:text-ink",
            collapsed && "justify-center px-0",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-40 rounded p-2 text-ink-muted bg-surface border border-border-muted shadow-sm hover:bg-surface-alt md:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-surface border-r border-border shadow-lg transition-transform duration-200 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex h-screen flex-col border-r border-border bg-surface transition-[width] duration-150",
          collapsed ? "w-14" : "w-[260px]",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

export { Sidebar };
