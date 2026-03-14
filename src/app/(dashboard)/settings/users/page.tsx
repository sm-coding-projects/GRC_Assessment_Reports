"use client";

import { useState } from "react";
import {
  Plus,
  MoreHorizontal,
  KeyRound,
  Trash2,
  Shield,
  ShieldCheck,
  Eye,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useUser } from "@/hooks/use-user";
import { AddUserDrawer } from "@/components/settings/add-user-drawer";
import { ResetPasswordDrawer } from "@/components/settings/reset-password-drawer";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  READ_WRITE: "Read & Write",
  READ_ONLY: "Read Only",
};

const ROLE_ICONS: Record<string, React.ElementType> = {
  ADMIN: ShieldCheck,
  READ_WRITE: Shield,
  READ_ONLY: Eye,
};

function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function UsersPage(): React.ReactNode {
  const { toast } = useToast();
  const { user: currentUser } = useUser();
  const [showAddUser, setShowAddUser] = useState(false);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const usersQuery = trpc.users.list.useQuery();
  const utils = trpc.useUtils();

  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      toast("Role updated.", { variant: "success" });
    },
    onError: (err) => toast(err.message, { variant: "danger" }),
  });

  const deleteMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      setDeletingId(null);
      toast("User deleted.", { variant: "success" });
    },
    onError: (err) => {
      setDeletingId(null);
      toast(err.message, { variant: "danger" });
    },
  });

  function handleDelete(id: string, email: string): void {
    if (window.confirm(`Delete user "${email}"? All their data will be permanently removed.`)) {
      setDeletingId(id);
      deleteMutation.mutate({ id });
    }
  }

  if (currentUser && currentUser.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-lg font-serif text-ink">Access denied</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Only administrators can manage users.
        </p>
      </div>
    );
  }

  const users = usersQuery.data;
  const isLoading = usersQuery.isLoading;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl tracking-tight text-ink">
            User Management
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Create, edit, and manage user accounts and roles.
          </p>
        </div>
        <Button onClick={() => setShowAddUser(true)}>
          <Plus size={16} className="mr-2" />
          Add User
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {!isLoading && users && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const RoleIcon = ROLE_ICONS[u.role] ?? Shield;
              const isSelf = u.id === currentUser?.id;

              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <span className="font-medium text-ink">
                      {u.name ?? u.email}
                    </span>
                    <p className="text-xs text-ink-muted mt-0.5">{u.email}</p>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                      <RoleIcon size={14} />
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-ink-muted">
                      {formatDate(u.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <UserActions
                      userId={u.id}
                      userEmail={u.email}
                      currentRole={u.role}
                      isSelf={isSelf}
                      deletingId={deletingId}
                      onChangeRole={(role) =>
                        updateRoleMutation.mutate({ id: u.id, role })
                      }
                      onResetPassword={() => setResetUserId(u.id)}
                      onDelete={() => handleDelete(u.id, u.email)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <AddUserDrawer
        open={showAddUser}
        onClose={() => setShowAddUser(false)}
      />

      <ResetPasswordDrawer
        userId={resetUserId}
        onClose={() => setResetUserId(null)}
      />
    </div>
  );
}

function UserActions({
  userId,
  userEmail,
  currentRole,
  isSelf,
  deletingId,
  onChangeRole,
  onResetPassword,
  onDelete,
}: {
  userId: string;
  userEmail: string;
  currentRole: string;
  isSelf: boolean;
  deletingId: string | null;
  onChangeRole: (role: "ADMIN" | "READ_WRITE" | "READ_ONLY") => void;
  onResetPassword: () => void;
  onDelete: () => void;
}): React.ReactNode {
  const roles = ["ADMIN", "READ_WRITE", "READ_ONLY"] as const;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="rounded p-1.5 text-ink-subtle hover:bg-surface-alt hover:text-ink transition-colors"
          aria-label={`Actions for ${userEmail}`}
        >
          <MoreHorizontal size={16} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[200px] rounded-md border border-border bg-surface p-1 shadow-md"
          align="end"
          sideOffset={4}
        >
          <DropdownMenu.Label className="px-2 py-1 text-xs text-ink-subtle">
            Change role
          </DropdownMenu.Label>
          {roles.map((role) => (
            <DropdownMenu.Item
              key={role}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-ink outline-none data-[highlighted]:bg-surface-alt"
              onSelect={() => onChangeRole(role)}
              disabled={role === currentRole}
            >
              {ROLE_LABELS[role]}
              {role === currentRole && (
                <span className="ml-auto text-xs text-ink-subtle">current</span>
              )}
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className="my-1 h-px bg-border-muted" />
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-ink outline-none data-[highlighted]:bg-surface-alt"
            onSelect={onResetPassword}
          >
            <KeyRound size={14} />
            Reset password
          </DropdownMenu.Item>
          {!isSelf && (
            <>
              <DropdownMenu.Separator className="my-1 h-px bg-border-muted" />
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-danger outline-none data-[highlighted]:bg-danger-bg"
                onSelect={onDelete}
                disabled={deletingId === userId}
              >
                <Trash2 size={14} />
                {deletingId === userId ? "Deleting..." : "Delete user"}
              </DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
