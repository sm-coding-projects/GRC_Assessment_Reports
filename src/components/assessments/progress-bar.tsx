import { cn } from "@/lib/utils/cn";

interface ProgressBarProps {
  compliant: number;
  partiallyCompliant: number;
  nonCompliant: number;
  notApplicable: number;
  notAssessed: number;
  total: number;
  /** When true, renders a compact version for table cells */
  compact?: boolean;
}

function ProgressBar({
  compliant,
  partiallyCompliant,
  nonCompliant,
  notApplicable,
  notAssessed,
  total,
  compact,
}: ProgressBarProps): React.ReactNode {
  if (total === 0) return null;

  const segments = [
    { count: compliant, color: "bg-success", label: "Compliant" },
    { count: partiallyCompliant, color: "bg-warning", label: "Partial" },
    { count: nonCompliant, color: "bg-danger", label: "Non-Compliant" },
    { count: notApplicable, color: "bg-neutral", label: "N/A" },
    { count: notAssessed, color: "bg-ink-subtle/30", label: "Unassessed" },
  ];

  return (
    <div className={cn("w-full", compact ? "min-w-[100px]" : "")}>
      {/* Stacked bar */}
      <div
        className={cn(
          "flex w-full overflow-hidden rounded-sm",
          compact ? "h-1.5" : "h-2.5",
        )}
        role="img"
        aria-label={`Progress: ${compliant} compliant, ${partiallyCompliant} partial, ${nonCompliant} non-compliant, ${notApplicable} N/A, ${notAssessed} unassessed of ${total} total`}
      >
        {segments.map((segment) => {
          if (segment.count === 0) return null;
          const pct = (segment.count / total) * 100;
          return (
            <div
              key={segment.label}
              className={cn(segment.color, "transition-all duration-300")}
              style={{ width: `${pct}%` }}
              title={`${segment.label}: ${segment.count}`}
            />
          );
        })}
      </div>

      {/* Counts below the bar (non-compact only) */}
      {!compact && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {segments
            .filter((s) => s.count > 0)
            .map((segment) => (
              <span
                key={segment.label}
                className="inline-flex items-center gap-1.5 text-xs text-ink-muted"
              >
                <span
                  className={cn("h-2 w-2 shrink-0 rounded-full", segment.color)}
                  aria-hidden="true"
                />
                {segment.count} {segment.label}
              </span>
            ))}
        </div>
      )}
    </div>
  );
}

export { ProgressBar, type ProgressBarProps };
