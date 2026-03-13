"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { FrameworkPicker } from "./framework-picker";
import { ControlSelector, controlKey } from "./control-selector";
import { frameworks, frameworkList } from "@/data";
import type { FrameworkId, FrameworkDomain } from "@/types/framework";
import { trpc } from "@/lib/trpc/client";

interface TemplateFormProps {
  initialData?: {
    id: string;
    name: string;
    description: string | null;
    controls: Array<{ framework: string; controlId: string }>;
  };
}

function TemplateForm({ initialData }: TemplateFormProps): React.ReactNode {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [activeFramework, setActiveFramework] = useState<FrameworkId>("iso27001");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => {
    if (!initialData?.controls) return new Set();
    return new Set(initialData.controls.map((c) => controlKey(c.framework, c.controlId)));
  });
  const formRef = useRef<HTMLFormElement>(null);
  const isDirty = name.length > 0 || description.length > 0 || selectedKeys.size > 0;

  // Cmd+S to save
  useKeyboardShortcut({
    key: "s",
    meta: true,
    handler: () => {
      formRef.current?.requestSubmit();
    },
  });

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent): void {
      if (isDirty) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const utils = trpc.useUtils();

  const createMutation = trpc.templates.create.useMutation({
    onSuccess: () => {
      utils.templates.list.invalidate();
      toast("Template created successfully", { variant: "success" });
      router.push("/templates");
    },
    onError: (error) => {
      toast(error.message, { variant: "danger" });
    },
  });

  const updateMutation = trpc.templates.update.useMutation({
    onSuccess: () => {
      utils.templates.list.invalidate();
      toast("Template updated successfully", { variant: "success" });
      router.push("/templates");
    },
    onError: (error) => {
      toast(error.message, { variant: "danger" });
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const selectedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const fw of frameworkList) {
      counts[fw.id] = fw.domains.reduce(
        (sum, d) =>
          sum + d.controls.filter((c) => selectedKeys.has(controlKey(fw.id, c.id))).length,
        0,
      );
    }
    return counts;
  }, [selectedKeys]);

  const handleToggle = useCallback((key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const handleToggleDomain = useCallback(
    (frameworkId: string, domain: FrameworkDomain, selectAll: boolean) => {
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        for (const control of domain.controls) {
          const key = controlKey(frameworkId, control.id);
          if (selectAll) {
            next.add(key);
          } else {
            next.delete(key);
          }
        }
        return next;
      });
    },
    [],
  );

  function resolveSelectedControls(): Array<{
    framework: FrameworkId;
    domain: string;
    controlId: string;
    controlName: string;
    description: string;
  }> {
    const result: Array<{
      framework: FrameworkId;
      domain: string;
      controlId: string;
      controlName: string;
      description: string;
    }> = [];
    for (const fw of frameworkList) {
      for (const domain of fw.domains) {
        for (const control of domain.controls) {
          if (selectedKeys.has(controlKey(fw.id, control.id))) {
            result.push({
              framework: fw.id,
              domain: control.domain,
              controlId: control.id,
              controlName: control.name,
              description: control.description,
            });
          }
        }
      }
    }
    return result;
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();

    if (!name.trim()) {
      toast("Template name is required", { variant: "warning" });
      return;
    }
    if (selectedKeys.size === 0) {
      toast("Select at least one control", { variant: "warning" });
      return;
    }

    const controls = resolveSelectedControls();

    if (initialData) {
      updateMutation.mutate({
        id: initialData.id,
        name: name.trim(),
        description: description.trim() || undefined,
        controls,
      });
    } else {
      createMutation.mutate({
        name: name.trim(),
        description: description.trim() || undefined,
        controls,
      });
    }
  }

  const activeFw = frameworks[activeFramework];
  const frameworksWithSelections = Object.values(selectedCounts).filter((c) => c > 0).length;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <div>
          <label
            htmlFor="template-name"
            className="block text-xs font-medium uppercase tracking-label text-ink-subtle mb-1.5"
          >
            Template Name
          </label>
          <Input
            id="template-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Annual ISO 27001 Audit"
            required
          />
        </div>
        <div>
          <label
            htmlFor="template-description"
            className="block text-xs font-medium uppercase tracking-label text-ink-subtle mb-1.5"
          >
            Description
          </label>
          <Input
            id="template-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row gap-0 border border-border rounded-md bg-surface overflow-hidden min-h-[480px]">
        <div className="sm:w-[240px] shrink-0 border-b sm:border-b-0 sm:border-r border-border bg-surface p-3 overflow-x-auto sm:overflow-y-auto">
          <div className="text-xs font-medium uppercase tracking-label text-ink-subtle mb-3 px-3">
            Frameworks
          </div>
          <FrameworkPicker
            activeFramework={activeFramework}
            onFrameworkChange={setActiveFramework}
            selectedCounts={selectedCounts}
          />
        </div>

        <div className="flex-1 p-4 overflow-hidden flex flex-col min-w-0">
          <ControlSelector
            framework={activeFw}
            selectedKeys={selectedKeys}
            onToggle={handleToggle}
            onToggleDomain={handleToggleDomain}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-muted">
        <p className="text-sm text-ink-muted">
          {selectedKeys.size} {selectedKeys.size === 1 ? "control" : "controls"} selected
          {frameworksWithSelections > 0 && (
            <> across {frameworksWithSelections} framework{frameworksWithSelections !== 1 ? "s" : ""}</>
          )}
        </p>
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" onClick={() => router.push("/templates")}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !name.trim() || selectedKeys.size === 0}
          >
            {isSubmitting
              ? "Saving..."
              : initialData
                ? "Update Template"
                : `Save Template (${selectedKeys.size})`}
          </Button>
        </div>
      </div>
    </form>
  );
}

export { TemplateForm, type TemplateFormProps };
