"use client";

import { trpc } from "@/lib/trpc/client";
import type { UserRole } from "@prisma/generated";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

interface UseUserReturn {
  user: UserData | null;
  loading: boolean;
}

export function useUser(): UseUserReturn {
  const { data, isLoading } = trpc.account.getProfile.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const user: UserData | null = data
    ? { id: data.id, email: data.email, name: data.name, role: data.role }
    : null;

  return { user, loading: isLoading };
}
