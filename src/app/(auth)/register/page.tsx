"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      if (!supabase) {
        setError("Authentication is not configured. Set Supabase environment variables to enable registration.");
        return;
      }
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp(): Promise<void> {
    setError("");
    const supabase = createClient();
    if (!supabase) {
      setError("Authentication is not configured. Set Supabase environment variables to enable registration.");
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

  if (success) {
    return (
      <div className="rounded-md border border-border bg-surface p-8">
        <div className="mb-4">
          <h1 className="font-serif text-2xl tracking-[-0.03em] text-ink">
            Check your email
          </h1>
        </div>
        <p className="text-sm text-ink-muted">
          We sent a confirmation link to{" "}
          <span className="font-medium text-ink">{email}</span>. Click the link
          to activate your account.
        </p>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="mt-6 text-sm font-medium text-accent hover:text-accent-hover"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-surface p-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl tracking-[-0.03em] text-ink">
          Create account
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Set up your compliance workspace
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded border border-danger/30 bg-danger-bg px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="flex flex-col gap-4">
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
            placeholder="At least 8 characters"
            required
            autoComplete="new-password"
            minLength={8}
          />
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="mb-1 block text-xs font-medium uppercase tracking-label text-ink-subtle"
          >
            Confirm password
          </label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your password"
            required
            autoComplete="new-password"
            minLength={8}
          />
        </div>

        <Button type="submit" disabled={loading} className="mt-2 w-full">
          {loading ? "Creating account..." : "Create account"}
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
        onClick={handleGoogleSignUp}
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
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-accent hover:text-accent-hover"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
