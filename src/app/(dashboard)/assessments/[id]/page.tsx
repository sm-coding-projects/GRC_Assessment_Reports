"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2, Check, FileBarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { AssessmentTable } from "@/components/assessments/assessment-table";
import { ProgressBar } from "@/components/assessments/progress-bar";
import { useAssessment } from "@/hooks/use-assessment";
import { useAssessmentStore, computeProgress } from "@/stores/assessment-store";
import { trpc } from "@/lib/trpc/client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AssessmentRunnerPage({ params }: PageProps): React.ReactNode {
  const { id } = use(params);

  return <AssessmentRunner assessmentId={id} />;
}

function AssessmentRunner({ assessmentId }: { assessmentId: string }): React.ReactNode {
  const router = useRouter();
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const {
    isLoading,
    error,
    saving,
    lastSavedAt,
    assessmentName,
    templateName,
    assessmentStatus,
  } = useAssessment({ assessmentId });

  const responses = useAssessmentStore((s) => s.responses);
  const query = trpc.assessments.getById.useQuery(
    { id: assessmentId },
    { refetchOnWindowFocus: false },
  );

  const completeMutation = trpc.assessments.complete.useMutation({
    onSuccess: () => {
      utils.assessments.getById.invalidate({ id: assessmentId });
      toast("Assessment marked as completed", { variant: "success" });
    },
    onError: (err) => toast(err.message, { variant: "danger" }),
  });

  const progress = computeProgress(responses);
  const controls = query.data?.template?.controls ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-full max-w-md" />
        <div className="space-y-2 mt-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-lg font-serif text-ink">Assessment not found</h2>
        <p className="mt-1 text-sm text-ink-muted">{error}</p>
        <Button asChild variant="ghost" className="mt-4">
          <Link href="/assessments">Back to Assessments</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/assessments"
          className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Back to Assessments
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <h1 className="font-serif text-xl sm:text-2xl tracking-tight text-ink">
              {assessmentName}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Template: {templateName}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Save status indicator */}
            <SaveIndicator saving={saving} lastSavedAt={lastSavedAt} />

            {/* Complete button */}
            {assessmentStatus === "IN_PROGRESS" && (
              <Button
                onClick={() => completeMutation.mutate({ id: assessmentId })}
                disabled={completeMutation.isPending}
                size="sm"
              >
                <CheckCircle2 size={14} className="mr-1.5" />
                {completeMutation.isPending ? "Completing..." : "Mark Complete"}
              </Button>
            )}

            {assessmentStatus === "COMPLETED" && (
              <>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success bg-success-bg px-2.5 py-1 rounded">
                  <Check size={12} />
                  Completed
                </span>
                <Button asChild size="sm">
                  <Link href={`/reports/${assessmentId}`}>
                    <FileBarChart2 size={14} className="mr-1.5" />
                    View Report
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress summary */}
      {progress.total > 0 && (
        <div className="mb-6 rounded border border-border-muted bg-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-ink-muted tracking-label uppercase">
              Progress
            </span>
            <span className="text-sm font-medium text-ink">
              {progress.total - progress.notAssessed} / {progress.total} assessed
            </span>
          </div>
          <ProgressBar
            compliant={progress.compliant}
            partiallyCompliant={progress.partiallyCompliant}
            nonCompliant={progress.nonCompliant}
            notApplicable={progress.notApplicable}
            notAssessed={progress.notAssessed}
            total={progress.total}
          />
          {progress.complianceRate > 0 && (
            <p className="mt-3 text-xs text-ink-muted">
              Compliance rate:{" "}
              <span className="font-medium text-ink">
                {progress.complianceRate.toFixed(1)}%
              </span>
              <span className="text-ink-subtle">
                {" "}(excluding N/A controls)
              </span>
            </p>
          )}
        </div>
      )}

      {/* Assessment table */}
      <div className="rounded border border-border-muted bg-surface overflow-hidden">
        <AssessmentTable assessmentId={assessmentId} controls={controls} />
      </div>
    </div>
  );
}

function SaveIndicator({
  saving,
  lastSavedAt,
}: {
  saving: boolean;
  lastSavedAt: Date | null;
}): React.ReactNode {
  if (saving) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
        <Loader2 size={12} className="animate-spin" />
        Saving...
      </span>
    );
  }

  if (lastSavedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-ink-subtle">
        <Check size={12} />
        All changes saved
      </span>
    );
  }

  return null;
}
