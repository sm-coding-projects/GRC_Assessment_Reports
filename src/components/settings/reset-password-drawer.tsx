"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
} from "@/components/ui/drawer";
import { useToast } from "@/components/ui/toast";
import { trpc } from "@/lib/trpc/client";

interface ResetPasswordDrawerProps {
  userId: string | null;
  onClose: () => void;
}

export function ResetPasswordDrawer({
  userId,
  onClose,
}: ResetPasswordDrawerProps): React.ReactNode {
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");

  const resetPassword = trpc.users.resetPassword.useMutation({
    onSuccess: () => {
      toast("Password has been reset.", { variant: "success" });
      setNewPassword("");
      onClose();
    },
    onError: (err) => toast(err.message, { variant: "danger" }),
  });

  function handleSubmit(e: FormEvent): void {
    e.preventDefault();
    if (!userId) return;
    resetPassword.mutate({ id: userId, newPassword });
  }

  function handleClose(): void {
    setNewPassword("");
    onClose();
  }

  return (
    <Drawer open={!!userId} onOpenChange={(o) => !o && handleClose()}>
      <DrawerContent width="sm">
        <DrawerHeader>
          <DrawerTitle>Reset Password</DrawerTitle>
          <DrawerDescription>
            Set a new temporary password for this user.
          </DrawerDescription>
        </DrawerHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <DrawerBody>
            <div>
              <label
                htmlFor="reset-new-password"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                New password
              </label>
              <Input
                id="reset-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
              />
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={resetPassword.isPending}>
              {resetPassword.isPending ? "Resetting..." : "Reset password"}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
