"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login, signup, type AuthState } from "@/app/actions/auth";

const FIELD =
  "w-full rounded-xl border-2 border-line bg-surface px-4 py-3 text-base outline-none transition focus:border-ink";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? login : signup, undefined);
  const next = useSearchParams().get("next") ?? "";
  const otherHref = `/${mode === "login" ? "signup" : "login"}${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <form action={action} className="flex w-full flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      {mode === "signup" && (
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Name
          <input name="name" required maxLength={40} autoComplete="given-name" defaultValue={state?.values?.name} className={FIELD} />
        </label>
      )}
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Email
        <input name="email" type="email" required autoComplete="email" defaultValue={state?.values?.email} className={FIELD} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={mode === "signup" ? 8 : undefined}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className={FIELD}
        />
        {mode === "signup" && <span className="font-normal text-muted">At least 8 characters.</span>}
      </label>

      {state?.error && (
        <p role="alert" className="rounded-xl border-2 border-bad bg-bad/10 px-4 py-3 text-sm font-medium text-bad">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-2xl bg-accent px-6 py-4 text-lg font-semibold text-on-accent transition hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "One moment…" : mode === "login" ? "Log in" : "Create account"}
      </button>

      <p className="text-center text-sm text-muted">
        {mode === "login" ? "New to Phrasa? " : "Already have an account? "}
        <Link href={otherHref} className="font-semibold text-ink underline underline-offset-4">
          {mode === "login" ? "Create an account" : "Log in"}
        </Link>
      </p>
    </form>
  );
}
