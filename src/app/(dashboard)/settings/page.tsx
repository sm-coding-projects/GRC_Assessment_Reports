"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { trpc } from "@/lib/trpc/client";

function ProfileSection(): React.ReactNode {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const { data: profile, isLoading } = trpc.account.getProfile.useQuery();

  const [displayName, setDisplayName] = useState<string | null>(null);

  const nameValue = displayName ?? profile?.name ?? "";

  const updateProfile = trpc.account.updateProfile.useMutation({
    onSuccess(data) {
      toast("Profile updated.", { variant: "success" });
      setDisplayName(null);
      utils.account.getProfile.setData(undefined, (prev) =>
        prev ? { ...prev, name: data.name } : prev,
      );
    },
    onError(err) {
      toast(err.message, { variant: "danger" });
    },
  });

  function handleSaveProfile(e: FormEvent): void {
    e.preventDefault();
    const trimmed = nameValue.trim();
    if (!trimmed) {
      toast("Display name cannot be empty.", { variant: "warning" });
      return;
    }
    updateProfile.mutate({ name: trimmed });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-full max-w-sm" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-9 w-full max-w-sm" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSaveProfile} className="space-y-5">
      <div className="max-w-sm">
        <label
          htmlFor="settings-display-name"
          className="mb-1.5 block text-sm font-medium text-ink"
        >
          Display name
        </label>
        <Input
          id="settings-display-name"
          value={nameValue}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
        />
      </div>

      <div className="max-w-sm">
        <label
          htmlFor="settings-email"
          className="mb-1.5 block text-sm font-medium text-ink"
        >
          Email
        </label>
        <Input
          id="settings-email"
          value={profile?.email ?? ""}
          disabled
          readOnly
        />
        <p className="mt-1 text-xs text-ink-subtle">
          Email can only be changed by an administrator.
        </p>
      </div>

      <div className="pt-1">
        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function PasswordSection(): React.ReactNode {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleChangePassword(e: FormEvent): Promise<void> {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast("Password must be at least 8 characters.", { variant: "warning" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("Passwords do not match.", { variant: "warning" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to update password.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast("Password updated.", { variant: "success" });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update password.";
      toast(message, { variant: "danger" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleChangePassword} className="space-y-5">
      <div className="max-w-sm">
        <label
          htmlFor="settings-current-password"
          className="mb-1.5 block text-sm font-medium text-ink"
        >
          Current password
        </label>
        <Input
          id="settings-current-password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
          autoComplete="current-password"
          required
        />
      </div>

      <div className="max-w-sm">
        <label
          htmlFor="settings-new-password"
          className="mb-1.5 block text-sm font-medium text-ink"
        >
          New password
        </label>
        <Input
          id="settings-new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          required
        />
      </div>

      <div className="max-w-sm">
        <label
          htmlFor="settings-confirm-password"
          className="mb-1.5 block text-sm font-medium text-ink"
        >
          Confirm password
        </label>
        <Input
          id="settings-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your new password"
          autoComplete="new-password"
          required
        />
      </div>

      <div className="pt-1">
        <Button type="submit" disabled={saving}>
          {saving ? "Updating..." : "Update password"}
        </Button>
      </div>
    </form>
  );
}

function DangerZoneSection(): React.ReactNode {
  const { toast } = useToast();
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const deleteAccount = trpc.account.deleteAccount.useMutation({
    async onSuccess() {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
        // Even if logout fails, redirect to login
      }
      router.push("/login");
      router.refresh();
    },
    onError(err) {
      toast(err.message, { variant: "danger" });
    },
  });

  function handleDeleteAccount(): void {
    if (confirmText !== "DELETE") {
      toast("Type DELETE to confirm account deletion.", {
        variant: "warning",
      });
      return;
    }
    deleteAccount.mutate();
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-muted">
        Permanently delete your account and all associated data including
        templates, assessments, and reports. This action cannot be undone.
      </p>

      {!showConfirm ? (
        <Button variant="danger" onClick={() => setShowConfirm(true)}>
          Delete account
        </Button>
      ) : (
        <div className="max-w-sm space-y-3 rounded-md border border-danger/30 bg-danger-bg p-4">
          <p className="text-sm font-medium text-danger">
            Type <span className="font-mono">DELETE</span> to confirm.
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
          />
          <div className="flex gap-2">
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              disabled={deleteAccount.isPending || confirmText !== "DELETE"}
            >
              {deleteAccount.isPending ? "Deleting..." : "Confirm deletion"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowConfirm(false);
                setConfirmText("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface SettingsSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  variant?: "default" | "danger";
}

function SettingsSection({
  icon,
  title,
  description,
  children,
  variant = "default",
}: SettingsSectionProps): React.ReactNode {
  return (
    <section
      className={
        variant === "danger"
          ? "rounded-md border border-danger/20 bg-surface p-6"
          : "rounded-md border border-border-muted bg-surface p-6"
      }
    >
      <div className="mb-5 flex items-start gap-3">
        <div
          className={
            variant === "danger"
              ? "flex h-8 w-8 shrink-0 items-center justify-center rounded bg-danger-bg text-danger"
              : "flex h-8 w-8 shrink-0 items-center justify-center rounded bg-accent-subtle text-accent"
          }
        >
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-medium text-ink">{title}</h2>
          <p className="mt-0.5 text-sm text-ink-muted">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function SettingsPage(): React.ReactNode {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl tracking-tight text-ink">
          Settings
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Manage your account profile, password, and preferences.
        </p>
      </div>

      <div className="space-y-6">
        <SettingsSection
          icon={<User size={16} />}
          title="Profile"
          description="Update your display name and view your account email."
        >
          <ProfileSection />
        </SettingsSection>

        <SettingsSection
          icon={<Lock size={16} />}
          title="Password"
          description="Change your account password."
        >
          <PasswordSection />
        </SettingsSection>

        <SettingsSection
          icon={<AlertTriangle size={16} />}
          title="Danger zone"
          description="Irreversible actions that affect your account."
          variant="danger"
        >
          <DangerZoneSection />
        </SettingsSection>
      </div>
    </div>
  );
}
