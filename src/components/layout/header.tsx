"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Kbd } from "@/components/ui/kbd";
import { useCommandPalette } from "@/components/ui/command-palette";

const ROUTE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/templates": "Templates",
  "/templates/new": "New Template",
  "/assessments": "Assessments",
  "/assessments/new": "New Assessment",
  "/reports": "Reports",
  "/settings": "Settings",
};

function buildBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const items: { label: string; href?: string }[] = [
    { label: "Home", href: "/" },
  ];

  if (pathname === "/") return items;

  const segments = pathname.split("/").filter(Boolean);
  let currentPath = "";

  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = ROUTE_LABELS[currentPath] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
    items.push({ label, href: currentPath });
  }

  return items;
}

function Header(): React.ReactNode {
  const pathname = usePathname();
  const breadcrumbItems = buildBreadcrumbs(pathname);
  const { open: openCommandPalette } = useCommandPalette();

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border-muted bg-surface px-4 sm:px-8">
      <Breadcrumbs
        items={breadcrumbItems}
        renderLink={({ href, children }) => (
          <Link href={href}>{children}</Link>
        )}
      />

      <button
        onClick={openCommandPalette}
        className="flex items-center gap-2 rounded px-3 py-1.5 text-sm text-ink-subtle transition-colors duration-150 hover:bg-surface-alt hover:text-ink-muted"
        aria-label="Open search (Cmd+K)"
      >
        <Search size={16} />
        <span className="hidden sm:inline">Search</span>
        <Kbd keys={["⌘", "K"]} className="ml-1 hidden sm:flex" />
      </button>
    </header>
  );
}

export { Header };
