import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeVariant =
  | "compliant"
  | "partial"
  | "non-compliant"
  | "not-applicable"
  | "not-assessed";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
}

const VARIANT_CONFIG: Record<BadgeVariant, { dot: string; text: string; label: string }> = {
  compliant: {
    dot: "bg-success",
    text: "text-success",
    label: "Compliant",
  },
  partial: {
    dot: "bg-warning",
    text: "text-warning",
    label: "Partially Compliant",
  },
  "non-compliant": {
    dot: "bg-danger",
    text: "text-danger",
    label: "Non-Compliant",
  },
  "not-applicable": {
    dot: "bg-neutral",
    text: "text-neutral",
    label: "Not Applicable",
  },
  "not-assessed": {
    dot: "bg-ink-subtle",
    text: "text-ink-subtle",
    label: "Not Assessed",
  },
};

function Badge({ variant, className, children, ...props }: BadgeProps): React.ReactNode {
  const config = VARIANT_CONFIG[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium font-sans",
        config.text,
        className,
      )}
      {...props}
    >
      <span
        className={cn("h-2 w-2 shrink-0 rounded-full", config.dot)}
        aria-hidden="true"
      />
      {children ?? config.label}
    </span>
  );
}

export { Badge, type BadgeProps, type BadgeVariant };
