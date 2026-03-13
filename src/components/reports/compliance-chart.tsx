"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { FrameworkBreakdown, DomainBreakdown } from "@/types/report";

interface ComplianceChartProps {
  frameworkBreakdowns: FrameworkBreakdown[];
  domainBreakdowns: DomainBreakdown[];
}

function ComplianceChart({
  frameworkBreakdowns,
  domainBreakdowns,
}: ComplianceChartProps): React.ReactNode {
  const chartData = frameworkBreakdowns.map((fw) => {
    const applicable = fw.total - fw.notApplicable - fw.notAssessed;
    return {
      name: fw.frameworkName,
      Compliant: applicable > 0 ? Math.round((fw.compliant / applicable) * 100) : 0,
      Partial: applicable > 0 ? Math.round((fw.partiallyCompliant / applicable) * 100) : 0,
      "Non-Compliant": applicable > 0 ? Math.round((fw.nonCompliant / applicable) * 100) : 0,
    };
  });

  return (
    <section aria-labelledby="compliance-chart-heading">
      <h2
        id="compliance-chart-heading"
        className="font-serif text-xl tracking-tight text-ink mb-6"
      >
        Compliance Overview
      </h2>

      {/* Horizontal stacked bar chart */}
      {chartData.length > 0 && (
        <div className="bg-surface rounded-md border border-border-muted p-4 mb-8">
          <ResponsiveContainer width="100%" height={Math.max(chartData.length * 56, 120)}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
            >
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(v: number) => `${v}%`}
                tick={{ fontSize: 11, fill: "#8B949E" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fontSize: 12, fill: "#1B1F23" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => `${value}%`}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 4,
                  border: "1px solid #D1D9E0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              <Bar dataKey="Compliant" stackId="a" fill="#1A7F37" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Partial" stackId="a" fill="#9A6700" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Non-Compliant" stackId="a" fill="#CF222E" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Domain heatmap grid */}
      {domainBreakdowns.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-ink-muted tracking-label uppercase mb-3">
            Domain Compliance Heatmap
          </h3>
          <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
            {domainBreakdowns.map((domain) => (
              <DomainHeatCell key={`${domain.frameworkId}-${domain.domainName}`} domain={domain} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function DomainHeatCell({ domain }: { domain: DomainBreakdown }): React.ReactNode {
  const rate = domain.complianceRate;
  const bg = heatColor(rate);

  return (
    <div
      className="rounded-md border border-border-muted p-3 text-xs"
      style={{ backgroundColor: bg }}
    >
      <div className="font-medium text-ink truncate" title={domain.domainName}>
        {domain.domainName}
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-ink-muted">{domain.total} controls</span>
        <span className="font-mono font-medium text-ink">{rate}%</span>
      </div>
    </div>
  );
}

function heatColor(rate: number): string {
  if (rate >= 80) return "#DAFBE1"; // success-bg
  if (rate >= 50) return "#FFF8C5"; // warning-bg
  if (rate > 0) return "#FFEBE9";   // danger-bg
  return "#F3F4F6";                  // neutral-bg
}

export { ComplianceChart, type ComplianceChartProps };
