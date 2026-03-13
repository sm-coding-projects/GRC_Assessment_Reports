"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { safeRedirectPath } from "@/lib/safe-redirect";

const ERROR_MESSAGES: Record<string, string> = {
  missing_code: "Authentication failed. Please try again.",
  auth_failed: "Authentication failed. Please try again.",
  invalid_credentials: "Invalid email or password.",
};

function LoginForm(): React.ReactNode {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    searchParams.get("error")
      ? ERROR_MESSAGES[searchParams.get("error")!] ?? "An error occurred."
      : "",
  );
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      if (!supabase) {
        setError("Authentication is not configured. Set Supabase environment variables to enable login.");
        return;
      }
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(
          authError.message === "Invalid login credentials"
            ? "Invalid email or password."
            : authError.message,
        );
        return;
      }

      const next = safeRedirectPath(searchParams.get("next"));
      router.push(next);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(): Promise<void> {
    setError("");
    const supabase = createClient();
    if (!supabase) {
      setError("Authentication is not configured. Set Supabase environment variables to enable login.");
      return;
    }
    const redirectTo = `${window.location.origin}/api/auth/callback`;

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        scopes: "email profile",
      },
    });

    if (authError) {
      setError(authError.message);
    }
  }

  return (
    <div className="rounded-md border border-border bg-surface p-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl tracking-[-0.03em] text-ink">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Access your compliance workspace
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded border border-danger/30 bg-danger-bg px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-xs font-medium uppercase tracking-label text-ink-subtle"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            autoComplete="email"
            autoFocus
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-xs font-medium uppercase tracking-label text-ink-subtle"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" disabled={loading} className="mt-2 w-full">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-muted" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-surface px-3 text-xs text-ink-subtle">or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="flex w-full items-center justify-center gap-2 rounded border border-border bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors duration-150 hover:bg-surface-alt"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-accent hover:text-accent-hover"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

function LoginFallback(): React.ReactNode {
  return (
    <div className="rounded-md border border-border bg-surface p-8">
      <div className="mb-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-4 w-48" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}

export default function LoginPage(): React.ReactNode {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
