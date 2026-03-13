import { TemplateForm } from "@/components/templates/template-form";

export default function NewTemplatePage(): React.ReactNode {
  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 10rem)" }}>
      <div className="mb-6">
        <h1 className="font-serif text-2xl tracking-tight text-ink">New Template</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Select controls from compliance frameworks to build your assessment checklist.
        </p>
      </div>
      <TemplateForm />
    </div>
  );
}
