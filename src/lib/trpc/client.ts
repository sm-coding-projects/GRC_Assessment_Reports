"use client";

import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "./router";

export const trpc = createTRPCReact<AppRouter>();

export function getTRPCClientConfig(): Parameters<typeof trpc.createClient>[0] {
  return {
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
      }),
    ],
  };
}

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  return "http://localhost:3000";
}
