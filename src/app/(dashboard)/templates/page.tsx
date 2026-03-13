"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Copy,
  ClipboardCheck,
  Trash2,
  FileStack,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { trpc } from "@/lib/trpc/client";

const FRAMEWORK_SHORT_NAMES: Record<string, string> = {
  iso27001: "ISO 27001",
  soc2: "SOC 2",
  nist_csf: "NIST CSF",
  pci_dss: "PCI DSS",
  hipaa: "HIPAA",
  gdpr: "GDPR",
};

function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function getFrameworkBadges(
  controls: Array<{ framework: string }>,
): Array<{ id: string; count: number }> {
  const map = new Map<string, number>();
  for (const c of controls) {
    map.set(c.framework, (map.get(c.framework) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([id, count]) => ({ id, count }));
}

export default function TemplatesPage(): React.ReactNode {
  const router = useRouter();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const templatesQuery = trpc.templates.list.useQuery();
  const utils = trpc.useUtils();

  const duplicateMutation = trpc.templates.duplicate.useMutation({
    onSuccess: () => {
      utils.templates.list.invalidate();
      toast("Template duplicated", { variant: "success" });
    },
    onError: (err) => toast(err.message, { variant: "danger" }),
  });

  const deleteMutation = trpc.templates.delete.useMutation({
    onSuccess: () => {
      utils.templates.list.invalidate();
      setDeletingId(null);
      toast("Template deleted", { variant: "success" });
    },
    onError: (err) => {
      setDeletingId(null);
      toast(err.message, { variant: "danger" });
    },
  });

  function handleDelete(id: string, name: string): void {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      setDeletingId(id);
      deleteMutation.mutate({ id });
    }
  }

  const templates = templatesQuery.data;
  const isLoading = templatesQuery.isLoading;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl tracking-tight text-ink">Templates</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Compliance checklists built from framework controls.
          </p>
        </div>
        <Button asChild>
          <Link href="/templates/new">
            <Plus size={16} className="mr-2" />
            New Template
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {!isLoading && templates && templates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-surface-inset text-ink-subtle mb-4">
            <FileStack size={24} />
          </div>
          <h2 className="text-lg font-serif text-ink">No templates yet</h2>
          <p className="mt-1 text-sm text-ink-muted max-w-sm">
            Create your first compliance template by selecting controls from one or more
            governance frameworks.
          </p>
          <Button asChild className="mt-4">
            <Link href="/templates/new">
              <Plus size={16} className="mr-2" />
              Create Template
            </Link>
          </Button>
        </div>
      )}

      {!isLoading && templates && templates.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Frameworks</TableHead>
                  <TableHead>Controls</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => {
                  const badges = getFrameworkBadges(template.controls);
                  return (
                    <TableRow key={template.id}>
                      <TableCell>
                        <span className="font-medium text-ink">{template.name}</span>
                        {template.description && (
                          <p className="text-xs text-ink-muted mt-0.5 truncate max-w-xs">
                            {template.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {badges.map((b) => (
                            <span
                              key={b.id}
                              className="inline-flex items-center rounded bg-surface-inset px-2 py-0.5 text-xs font-medium text-ink-muted"
                            >
                              {FRAMEWORK_SHORT_NAMES[b.id] ?? b.id}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-ink-muted">
                          {template.controls.length}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-ink-muted">
                          {formatDate(template.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <TemplateActions
                          template={template}
                          deletingId={deletingId}
                          onEdit={() => router.push(`/templates/${template.id}/edit`)}
                          onDuplicate={() => duplicateMutation.mutate({ id: template.id })}
                          onAssess={() => router.push(`/assessments/new?templateId=${template.id}`)}
                          onDelete={() => handleDelete(template.id, template.name)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile card list */}
          <div className="flex flex-col gap-3 sm:hidden">
            {templates.map((template) => {
              const badges = getFrameworkBadges(template.controls);
              return (
                <div
                  key={template.id}
                  className="rounded-md border border-border-muted bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-ink truncate">{template.name}</h3>
                      {template.description && (
                        <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                    </div>
                    <TemplateActions
                      template={template}
                      deletingId={deletingId}
                      onEdit={() => router.push(`/templates/${template.id}/edit`)}
                      onDuplicate={() => duplicateMutation.mutate({ id: template.id })}
                      onAssess={() => router.push(`/assessments/new?templateId=${template.id}`)}
                      onDelete={() => handleDelete(template.id, template.name)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {badges.map((b) => (
                      <span
                        key={b.id}
                        className="inline-flex items-center rounded bg-surface-inset px-2 py-0.5 text-xs font-medium text-ink-muted"
                      >
                        {FRAMEWORK_SHORT_NAMES[b.id] ?? b.id}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-ink-subtle">
                    <span>
                      <span className="font-mono">{template.controls.length}</span> controls
                    </span>
                    <span>{formatDate(template.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function TemplateActions({
  template,
  deletingId,
  onEdit,
  onDuplicate,
  onAssess,
  onDelete,
}: {
  template: { id: string; name: string };
  deletingId: string | null;
  onEdit: () => void;
  onDuplicate: () => void;
  onAssess: () => void;
  onDelete: () => void;
}): React.ReactNode {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="rounded p-1.5 text-ink-subtle hover:bg-surface-alt hover:text-ink transition-colors"
          aria-label="Template actions"
        >
          <MoreHorizontal size={16} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[180px] rounded-md border border-border bg-surface p-1 shadow-md"
          align="end"
          sideOffset={4}
        >
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-ink outline-none data-[highlighted]:bg-surface-alt"
            onSelect={onEdit}
          >
            <Pencil size={14} />
            Edit
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-ink outline-none data-[highlighted]:bg-surface-alt"
            onSelect={onDuplicate}
          >
            <Copy size={14} />
            Duplicate
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-ink outline-none data-[highlighted]:bg-surface-alt"
            onSelect={onAssess}
          >
            <ClipboardCheck size={14} />
            Start Assessment
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-border-muted" />
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-danger outline-none data-[highlighted]:bg-danger-bg"
            onSelect={onDelete}
            disabled={deletingId === template.id}
          >
            <Trash2 size={14} />
            {deletingId === template.id ? "Deleting..." : "Delete"}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
