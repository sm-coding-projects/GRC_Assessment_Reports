"use client";

import { useCallback, useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils/cn";
import type { ComplianceStatus } from "@/types/assessment";

interface StatusOption {
  value: ComplianceStatus;
  label: string;
  shortLabel: string;
  dot: string;
  bg: string;
  text: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: "compliant",
    label: "Compliant",
    shortLabel: "Compliant",
    dot: "bg-success",
    bg: "bg-success-bg",
    text: "text-success",
  },
  {
    value: "partially_compliant",
    label: "Partially Compliant",
    shortLabel: "Partial",
    dot: "bg-warning",
    bg: "bg-warning-bg",
    text: "text-warning",
  },
  {
    value: "non_compliant",
    label: "Non-Compliant",
    shortLabel: "Non-Comp.",
    dot: "bg-danger",
    bg: "bg-danger-bg",
    text: "text-danger",
  },
  {
    value: "not_applicable",
    label: "Not Applicable",
    shortLabel: "N/A",
    dot: "bg-neutral",
    bg: "bg-neutral-bg",
    text: "text-neutral",
  },
  {
    value: "not_assessed",
    label: "Not Assessed",
    shortLabel: "Unassessed",
    dot: "bg-ink-subtle",
    bg: "bg-surface-inset",
    text: "text-ink-subtle",
  },
];

interface StatusSelectorProps {
  value: ComplianceStatus;
  onChange: (status: ComplianceStatus) => void;
  disabled?: boolean;
}

function StatusSelector({ value, onChange, disabled }: StatusSelectorProps): React.ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);

  const currentIndex = STATUS_OPTIONS.findIndex((o) => o.value === value);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;

      let nextIndex = currentIndex;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % STATUS_OPTIONS.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + STATUS_OPTIONS.length) % STATUS_OPTIONS.length;
      }

      if (nextIndex !== currentIndex) {
        onChange(STATUS_OPTIONS[nextIndex].value);
        // Focus the newly selected button
        const buttons = containerRef.current?.querySelectorAll<HTMLButtonElement>(
          "[role='radio']",
        );
        buttons?.[nextIndex]?.focus();
      }
    },
    [currentIndex, onChange, disabled],
  );

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label="Compliance status"
      className="inline-flex items-center gap-1"
      onKeyDown={handleKeyDown}
    >
      {STATUS_OPTIONS.map((option, index) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={isSelected}
            aria-label={option.label}
            tabIndex={isSelected ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
              "disabled:pointer-events-none disabled:opacity-50",
              isSelected
                ? [option.bg, option.text]
                : "text-ink-subtle hover:bg-surface-alt hover:text-ink-muted",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                isSelected ? option.dot : "bg-ink-subtle/40",
              )}
              aria-hidden="true"
            />
            {option.shortLabel}
          </button>
        );
      })}
    </div>
  );
}

export { StatusSelector, STATUS_OPTIONS, type StatusSelectorProps };
