"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import type { FindingRow } from "@/types/report";
import type { ComplianceStatus } from "@/types/assessment";
import { cn } from "@/lib/utils/cn";

interface FindingsTableProps {
  findings: FindingRow[];
}

const STATUS_TO_BADGE: Record<ComplianceStatus, BadgeVariant> = {
  compliant: "compliant",
  partially_compliant: "partial",
  non_compliant: "non-compliant",
  not_applicable: "not-applicable",
  not_assessed: "not-assessed",
};

function FindingsTable({ findings }: FindingsTableProps): React.ReactNode {
  const [expandedFramework, setExpandedFramework] = useState<string | null>(null);

  // Group by framework > domain
  const grouped = useMemo(() => {
    const map = new Map<string, Map<string, FindingRow[]>>();
    for (const row of findings) {
      if (!map.has(row.frameworkName)) {
        map.set(row.frameworkName, new Map());
      }
      const domains = map.get(row.frameworkName)!;
      if (!domains.has(row.domain)) {
        domains.set(row.domain, []);
      }
      domains.get(row.domain)!.push(row);
    }
    return map;
  }, [findings]);

  if (findings.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-ink-muted">
        No findings to display.
      </div>
    );
  }

  return (
    <section aria-labelledby="findings-heading">
      <h2
        id="findings-heading"
        className="font-serif text-xl tracking-tight text-ink mb-6"
      >
        Detailed Findings
      </h2>

      {Array.from(grouped.entries()).map(([frameworkName, domains]) => (
        <div key={frameworkName} className="mb-8">
          <button
            type="button"
            className="flex items-center gap-2 text-left w-full mb-4 group"
            onClick={() =>
              setExpandedFramework(
                expandedFramework === frameworkName ? null : frameworkName,
              )
            }
          >
            <h3 className="font-serif text-lg text-ink group-hover:text-accent transition-colors">
              {frameworkName}
            </h3>
            <span className="text-xs text-ink-subtle">
              ({Array.from(domains.values()).reduce((sum, rows) => sum + rows.length, 0)} controls)
            </span>
          </button>

          {Array.from(domains.entries()).map(([domain, rows]) => (
            <div key={domain} className="mb-6">
              <h4 className="text-xs font-medium text-ink-muted tracking-label uppercase mb-2 pl-1">
                {domain}
              </h4>
              <div className="rounded-md border border-border-muted overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">ID</TableHead>
                      <TableHead>Control</TableHead>
                      <TableHead className="w-36">Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Evidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow
                        key={`${row.framework}-${row.controlId}`}
                        className={cn(
                          row.status === "non_compliant" && "bg-danger-bg/50",
                        )}
                      >
                        <TableCell className="font-mono text-xs text-ink-muted">
                          {row.controlId}
                        </TableCell>
                        <TableCell className="text-sm">{row.controlName}</TableCell>
                        <TableCell>
                          <Badge variant={STATUS_TO_BADGE[row.status]} />
                        </TableCell>
                        <TableCell className="text-xs text-ink-muted max-w-[200px] truncate">
                          {row.notes || "\u2014"}
                        </TableCell>
                        <TableCell className="text-xs text-ink-muted max-w-[200px] truncate">
                          {row.evidence || "\u2014"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

export { FindingsTable, type FindingsTableProps };
