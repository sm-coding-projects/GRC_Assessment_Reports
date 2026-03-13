import Link from "next/link";
import { FileStack, ClipboardCheck, FileBarChart2, ArrowRight } from "lucide-react";

const GETTING_STARTED_STEPS = [
  {
    step: 1,
    title: "Create a compliance template",
    description:
      "Select controls from ISO 27001, SOC 2, NIST CSF, PCI DSS, HIPAA, or GDPR to build a custom checklist.",
    href: "/templates/new",
    icon: FileStack,
  },
  {
    step: 2,
    title: "Run an assessment",
    description:
      "Assess a business against your template. Record compliance status, notes, and evidence for each control.",
    href: "/assessments/new",
    icon: ClipboardCheck,
  },
  {
    step: 3,
    title: "Generate a report",
    description:
      "View assessment results with an executive summary, compliance metrics, and findings. Export as PDF, CSV, or HTML.",
    href: "/reports",
    icon: FileBarChart2,
  },
] as const;

export default function DashboardPage(): React.ReactNode {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl tracking-tight text-ink">
          Welcome to GRC Report Generator
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Build compliance checklists, run assessments, and generate reports across
          major governance frameworks.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xs font-medium uppercase tracking-label text-ink-subtle">
          Getting Started
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {GETTING_STARTED_STEPS.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.step}
              href={item.href}
              className="group rounded-md border border-border-muted bg-surface p-5 transition-colors duration-150 hover:border-border"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-accent-subtle text-accent">
                  <Icon size={16} />
                </div>
                <span className="font-mono text-xs text-ink-subtle">
                  Step {item.step}
                </span>
              </div>
              <h3 className="text-sm font-medium text-ink">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                {item.description}
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-accent opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                <span>Get started</span>
                <ArrowRight size={12} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
