"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils/cn";

function NewAssessmentForm(): React.ReactNode {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const preselectedTemplateId = searchParams.get("templateId") ?? "";
  const [name, setName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(preselectedTemplateId);
  const [nameError, setNameError] = useState("");
  const [templateError, setTemplateError] = useState("");

  const templatesQuery = trpc.templates.list.useQuery();

  const createMutation = trpc.assessments.create.useMutation({
    onSuccess: (data) => {
      toast("Assessment created", { variant: "success" });
      router.push(`/assessments/${data.id}`);
    },
    onError: (err) => {
      toast(err.message, { variant: "danger" });
    },
  });

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();

    let valid = true;
    if (!name.trim()) {
      setNameError("Assessment name is required");
      valid = false;
    } else {
      setNameError("");
    }
    if (!selectedTemplateId) {
      setTemplateError("Please select a template");
      valid = false;
    } else {
      setTemplateError("");
    }

    if (!valid) return;

    createMutation.mutate({
      name: name.trim(),
      templateId: selectedTemplateId,
    });
  }

  const templates = templatesQuery.data;
  const isLoading = templatesQuery.isLoading;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/assessments"
          className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Back to Assessments
        </Link>
        <h1 className="font-serif text-2xl tracking-tight text-ink">New Assessment</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Select a compliance template to assess against.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
        {/* Assessment name */}
        <div>
          <label
            htmlFor="assessment-name"
            className="block text-xs font-medium text-ink-muted tracking-label uppercase mb-1.5"
          >
            Assessment Name
          </label>
          <Input
            id="assessment-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g. "Acme Corp Q1 2026 SOC 2 Review"'
            error={!!nameError}
          />
          {nameError && (
            <p className="mt-1 text-xs text-danger">{nameError}</p>
          )}
        </div>

        {/* Template selector */}
        <div>
          <label className="block text-xs font-medium text-ink-muted tracking-label uppercase mb-1.5">
            Template
          </label>

          {isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          )}

          {!isLoading && templates && templates.length === 0 && (
            <div className="rounded border border-border-muted bg-surface p-6 text-center">
              <p className="text-sm text-ink-muted">No templates found.</p>
              <Button asChild variant="ghost" size="sm" className="mt-2">
                <Link href="/templates/new">Create a template first</Link>
              </Button>
            </div>
          )}

          {!isLoading && templates && templates.length > 0 && (
            <div className="space-y-2">
              {templates.map((template) => {
                const isSelected = selectedTemplateId === template.id;
                const frameworks = [
                  ...new Set(template.controls.map((c) => c.framework)),
                ];
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplateId(template.id);
                      setTemplateError("");
                    }}
                    className={cn(
                      "w-full text-left rounded border p-4 transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
                      isSelected
                        ? "border-accent bg-accent-subtle/30"
                        : "border-border hover:border-border hover:bg-surface-alt/50",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-ink">
                        {template.name}
                      </span>
                      <span className="font-mono text-xs text-ink-subtle">
                        {template.controls.length} controls
                      </span>
                    </div>
                    {template.description && (
                      <p className="mt-1 text-xs text-ink-muted truncate">
                        {template.description}
                      </p>
                    )}
                    <div className="mt-2 flex gap-1.5">
                      {frameworks.map((fw) => (
                        <span
                          key={fw}
                          className="rounded bg-surface-inset px-2 py-0.5 text-xs text-ink-muted"
                        >
                          {fw}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {templateError && (
            <p className="mt-1 text-xs text-danger">{templateError}</p>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" disabled={createMutation.isPending}>
            <ClipboardCheck size={16} className="mr-2" />
            {createMutation.isPending ? "Creating..." : "Start Assessment"}
          </Button>
          <Button variant="ghost" type="button" asChild>
            <Link href="/assessments">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

function NewAssessmentFallback(): React.ReactNode {
  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-4 w-36 mb-4" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="max-w-xl space-y-6">
        <Skeleton className="h-9 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function NewAssessmentPage(): React.ReactNode {
  return (
    <Suspense fallback={<NewAssessmentFallback />}>
      <NewAssessmentForm />
    </Suspense>
  );
}
