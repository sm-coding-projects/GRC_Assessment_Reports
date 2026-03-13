import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface KbdProps extends HTMLAttributes<HTMLElement> {
  keys?: string[];
}

function Kbd({ keys, className, children, ...props }: KbdProps): React.ReactNode {
  if (keys && keys.length > 0) {
    return (
      <span className="inline-flex items-center gap-0.5">
        {keys.map((key, i) => (
          <kbd
            key={i}
            className={cn(
              "inline-flex h-5 min-w-[20px] items-center justify-center rounded-sm",
              "border border-border bg-surface-alt px-1.5",
              "font-mono text-[11px] text-ink-muted",
              "shadow-[0_1px_0_1px_rgba(0,0,0,0.04)]",
              className,
            )}
            {...props}
          >
            {key}
          </kbd>
        ))}
      </span>
    );
  }

  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-[20px] items-center justify-center rounded-sm",
        "border border-border bg-surface-alt px-1.5",
        "font-mono text-[11px] text-ink-muted",
        "shadow-[0_1px_0_1px_rgba(0,0,0,0.04)]",
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}

export { Kbd, type KbdProps };
