import { type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  renderLink?: (props: { href: string; children: ReactNode }) => ReactNode;
}

function Breadcrumbs({
  items,
  className,
  renderLink,
}: BreadcrumbsProps): ReactNode {
  return (
    <nav aria-label="Breadcrumb" className={cn("font-sans", className)}>
      <ol className="flex items-center gap-1 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight
                  className="h-3.5 w-3.5 text-ink-subtle"
                  aria-hidden="true"
                />
              )}
              {isLast || !item.href ? (
                <span
                  className={cn(
                    isLast ? "text-ink font-medium" : "text-ink-muted",
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : renderLink ? (
                renderLink({
                  href: item.href,
                  children: (
                    <span className="text-ink-muted hover:text-ink transition-colors">
                      {item.label}
                    </span>
                  ),
                })
              ) : (
                <a
                  href={item.href}
                  className="text-ink-muted hover:text-ink transition-colors"
                >
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { Breadcrumbs, type BreadcrumbItem, type BreadcrumbsProps };
