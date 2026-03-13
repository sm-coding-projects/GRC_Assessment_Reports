"use client";

import {
  Shield,
  ShieldCheck,
  Building2,
  CreditCard,
  Heart,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { frameworkList } from "@/data";
import type { FrameworkId } from "@/types/framework";

const FRAMEWORK_ICONS: Record<string, React.ElementType> = {
  iso27001: Shield,
  soc2: ShieldCheck,
  nist_csf: Building2,
  pci_dss: CreditCard,
  hipaa: Heart,
  gdpr: Scale,
};

interface FrameworkPickerProps {
  activeFramework: FrameworkId;
  onFrameworkChange: (id: FrameworkId) => void;
  selectedCounts: Record<string, number>;
}

function FrameworkPicker({
  activeFramework,
  onFrameworkChange,
  selectedCounts,
}: FrameworkPickerProps): React.ReactNode {
  return (
    <div className="flex flex-col gap-0.5" role="tablist" aria-label="Compliance frameworks">
      {frameworkList.map((fw) => {
        const Icon = FRAMEWORK_ICONS[fw.id] ?? Shield;
        const totalControls = fw.domains.reduce((sum, d) => sum + d.controls.length, 0);
        const selectedCount = selectedCounts[fw.id] ?? 0;
        const isActive = activeFramework === fw.id;

        return (
          <button
            key={fw.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onFrameworkChange(fw.id as FrameworkId)}
            className={cn(
              "flex items-center gap-3 rounded px-3 py-2.5 text-left text-sm transition-colors duration-150",
              isActive
                ? "bg-accent-subtle text-accent"
                : "text-ink-muted hover:bg-surface-alt hover:text-ink",
            )}
          >
            <Icon
              size={16}
              className={cn("shrink-0", isActive ? "text-accent" : "text-ink-subtle")}
            />
            <div className="flex-1 min-w-0">
              <div className="truncate font-medium">{fw.name}</div>
              <div className="text-xs text-ink-subtle">{totalControls} controls</div>
            </div>
            {selectedCount > 0 && (
              <span
                className={cn(
                  "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-medium",
                  isActive ? "bg-accent text-white" : "bg-surface-inset text-ink-muted",
                )}
              >
                {selectedCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export { FrameworkPicker, type FrameworkPickerProps };
