"use client";

import type { RemediationItem } from "@/types/report";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

interface RemediationSectionProps {
  items: RemediationItem[];
}

const STATUS_TO_BADGE: Record<string, BadgeVariant> = {
  non_compliant: "non-compliant",
  partially_compliant: "partial",
};

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  critical: { bg: "bg-danger-bg", text: "text-danger" },
  high: { bg: "bg-warning-bg", text: "text-warning" },
  medium: { bg: "bg-neutral-bg", text: "text-neutral" },
};

function RemediationSection({ items }: RemediationSectionProps): React.ReactNode {
  if (items.length === 0) {
    return (
      <section aria-labelledby="remediation-heading">
        <h2
          id="remediation-heading"
          className="font-serif text-xl tracking-tight text-ink mb-4"
        >
          Remediation Roadmap
        </h2>
        <div className="rounded-md border border-border-muted bg-success-bg/30 p-6 text-center">
          <p className="text-sm text-success font-medium">
            No remediation items — all assessed controls are compliant.
          </p>
        </div>
      </section>
    );
  }

  const nonCompliantCount = items.filter((i) => i.status === "non_compliant").length;
  const partialCount = items.filter((i) => i.status === "partially_compliant").length;

  return (
    <section aria-labelledby="remediation-heading">
      <h2
        id="remediation-heading"
        className="font-serif text-xl tracking-tight text-ink mb-2"
      >
        Remediation Roadmap
      </h2>
      <p className="text-sm text-ink-muted mb-6">
        {nonCompliantCount} non-compliant and {partialCount} partially compliant
        controls requiring attention.
      </p>

      <div className="space-y-3">
        {items.map((item) => {
          const priority = PRIORITY_STYLES[item.priority] ?? PRIORITY_STYLES.medium;
          const badge = STATUS_TO_BADGE[item.status] ?? "not-assessed";

          return (
            <div
              key={`${item.framework}-${item.controlId}`}
              className={cn(
                "rounded-md border border-border-muted p-4",
                item.status === "non_compliant" ? "bg-danger-bg/30" : "bg-warning-bg/30",
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-ink-muted">
                    {item.frameworkName} / {item.controlId}
                  </span>
                  <Badge variant={badge} />
                </div>
                <span
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-label",
                    priority.text,
                  )}
                >
                  {item.priority}
                </span>
              </div>
              <div className="font-medium text-sm text-ink mb-1">
                {item.controlName}
              </div>
              {item.notes ? (
                <p className="text-xs text-ink-muted leading-relaxed">{item.notes}</p>
              ) : (
                <p className="text-xs text-ink-subtle italic">No analyst notes provided.</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export { RemediationSection, type RemediationSectionProps };
