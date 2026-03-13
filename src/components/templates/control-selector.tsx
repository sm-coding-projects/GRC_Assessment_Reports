"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import type { Framework, FrameworkDomain } from "@/types/framework";

function controlKey(framework: string, controlId: string): string {
  return `${framework}::${controlId}`;
}

interface ControlSelectorProps {
  framework: Framework;
  selectedKeys: Set<string>;
  onToggle: (key: string) => void;
  onToggleDomain: (frameworkId: string, domain: FrameworkDomain, selectAll: boolean) => void;
}

function ControlSelector({
  framework,
  selectedKeys,
  onToggle,
  onToggleDomain,
}: ControlSelectorProps): React.ReactNode {
  const [search, setSearch] = useState("");
  const [collapsedDomains, setCollapsedDomains] = useState<Set<string>>(new Set());

  const filteredDomains = useMemo(() => {
    if (!search.trim()) return framework.domains;
    const query = search.toLowerCase();
    return framework.domains
      .map((domain) => ({
        ...domain,
        controls: domain.controls.filter(
          (c) =>
            c.id.toLowerCase().includes(query) ||
            c.name.toLowerCase().includes(query) ||
            c.description.toLowerCase().includes(query),
        ),
      }))
      .filter((d) => d.controls.length > 0);
  }, [framework.domains, search]);

  const totalControls = framework.domains.reduce((sum, d) => sum + d.controls.length, 0);
  const selectedInFramework = framework.domains.reduce(
    (sum, d) =>
      sum + d.controls.filter((c) => selectedKeys.has(controlKey(framework.id, c.id))).length,
    0,
  );

  function toggleDomainCollapse(domainId: string): void {
    setCollapsedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domainId)) {
        next.delete(domainId);
      } else {
        next.add(domainId);
      }
      return next;
    });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-ink">{framework.name}</h3>
          <p className="text-xs text-ink-subtle mt-0.5">
            {selectedInFramework} of {totalControls} controls selected
          </p>
        </div>
      </div>

      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by ID, name, or description..."
          className="pl-9"
          aria-label="Search controls"
        />
      </div>

      <div className="flex-1 overflow-y-auto -mx-1 px-1" role="tabpanel">
        {filteredDomains.length === 0 && (
          <p className="text-sm text-ink-subtle py-8 text-center">
            No controls match your search.
          </p>
        )}

        {filteredDomains.map((domain) => {
          const isCollapsed = collapsedDomains.has(domain.id);
          const domainSelectedCount = domain.controls.filter((c) =>
            selectedKeys.has(controlKey(framework.id, c.id)),
          ).length;
          const allSelected = domain.controls.length > 0 && domainSelectedCount === domain.controls.length;
          const someSelected = domainSelectedCount > 0 && !allSelected;

          return (
            <div key={domain.id} className="mb-2">
              <div className="flex items-center gap-2 rounded px-2 py-2 hover:bg-surface-alt group">
                <button
                  type="button"
                  onClick={() => toggleDomainCollapse(domain.id)}
                  className="shrink-0 text-ink-subtle"
                  aria-label={isCollapsed ? `Expand ${domain.name}` : `Collapse ${domain.name}`}
                >
                  {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </button>

                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={(checked) => {
                    onToggleDomain(framework.id, domain, !!checked);
                  }}
                  aria-label={`Select all controls in ${domain.name}`}
                />

                <button
                  type="button"
                  onClick={() => toggleDomainCollapse(domain.id)}
                  className="flex-1 text-left"
                >
                  <span className="text-sm font-medium text-ink">{domain.name}</span>
                  <span className="ml-2 text-xs text-ink-subtle">
                    {domainSelectedCount}/{domain.controls.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleDomain(framework.id, domain, !allSelected)}
                  className="text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {allSelected ? "Deselect all" : "Select all"}
                </button>
              </div>

              {!isCollapsed && (
                <div className="ml-6 border-l border-border-muted pl-4 mt-1">
                  {domain.controls.map((control) => {
                    const key = controlKey(framework.id, control.id);
                    const isSelected = selectedKeys.has(key);

                    return (
                      <label
                        key={control.id}
                        className={cn(
                          "flex items-start gap-3 rounded px-2 py-2 cursor-pointer transition-colors",
                          "hover:bg-surface-alt",
                          isSelected && "bg-accent-subtle/30",
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggle(key)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-xs text-ink-subtle shrink-0">
                              {control.id}
                            </span>
                            <span className="text-sm font-medium text-ink">{control.name}</span>
                          </div>
                          <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">
                            {control.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { ControlSelector, controlKey, type ControlSelectorProps };
