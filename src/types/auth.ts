import type { UserRole } from "@prisma/generated";

export type { UserRole };

export function canWrite(role: UserRole): boolean {
  return role === "ADMIN" || role === "READ_WRITE";
}

export function isAdmin(role: UserRole): boolean {
  return role === "ADMIN";
}
