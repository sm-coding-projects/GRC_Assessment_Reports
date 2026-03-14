"use client";

import { useState, type FormEvent } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
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

const ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "READ_WRITE", label: "Read & Write" },
  { value: "READ_ONLY", label: "Read Only" },
] as const;

type RoleValue = (typeof ROLES)[number]["value"];

interface AddUserDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function AddUserDrawer({ open, onClose }: AddUserDrawerProps): React.ReactNode {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleValue>("READ_WRITE");

  const createUser = trpc.users.create.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      toast("User created.", { variant: "success" });
      resetAndClose();
    },
    onError: (err) => toast(err.message, { variant: "danger" }),
  });

  function resetAndClose(): void {
    setEmail("");
    setName("");
    setPassword("");
    setRole("READ_WRITE");
    onClose();
  }

  function handleSubmit(e: FormEvent): void {
    e.preventDefault();
    createUser.mutate({ email, name, password, role });
  }

  return (
    <Drawer open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <DrawerContent width="sm">
        <DrawerHeader>
          <DrawerTitle>Add User</DrawerTitle>
          <DrawerDescription>
            Create a new user account with a temporary password.
          </DrawerDescription>
        </DrawerHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <DrawerBody className="space-y-4">
            <div>
              <label
                htmlFor="add-user-email"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Email
              </label>
              <Input
                id="add-user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@company.com"
                required
              />
            </div>
            <div>
              <label
                htmlFor="add-user-name"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Display name
              </label>
              <Input
                id="add-user-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
              />
            </div>
            <div>
              <label
                htmlFor="add-user-password"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Temporary password
              </label>
              <Input
                id="add-user-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Role
              </label>
              <SelectPrimitive.Root value={role} onValueChange={(v) => setRole(v as RoleValue)}>
                <SelectPrimitive.Trigger
                  className="flex h-9 w-full items-center justify-between rounded border border-border bg-surface px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                >
                  <SelectPrimitive.Value />
                  <SelectPrimitive.Icon>
                    <ChevronDown size={14} className="text-ink-subtle" />
                  </SelectPrimitive.Icon>
                </SelectPrimitive.Trigger>
                <SelectPrimitive.Portal>
                  <SelectPrimitive.Content
                    className="rounded-md border border-border bg-surface shadow-md"
                    position="popper"
                    sideOffset={4}
                  >
                    <SelectPrimitive.Viewport className="p-1">
                      {ROLES.map((r) => (
                        <SelectPrimitive.Item
                          key={r.value}
                          value={r.value}
                          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-ink outline-none data-[highlighted]:bg-surface-alt"
                        >
                          <SelectPrimitive.ItemIndicator>
                            <Check size={14} />
                          </SelectPrimitive.ItemIndicator>
                          <SelectPrimitive.ItemText>
                            {r.label}
                          </SelectPrimitive.ItemText>
                        </SelectPrimitive.Item>
                      ))}
                    </SelectPrimitive.Viewport>
                  </SelectPrimitive.Content>
                </SelectPrimitive.Portal>
              </SelectPrimitive.Root>
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button type="button" variant="ghost" onClick={resetAndClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending ? "Creating..." : "Create user"}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
