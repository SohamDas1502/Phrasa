"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/session";

export type AuthState = { error?: string; values?: { name?: string; email?: string } } | undefined;

/** Only allow redirects back into this app. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/learn";
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signup(_: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const values = { name, email };

  if (!name || name.length > 40) return { error: "Please enter a name (up to 40 characters).", values };
  if (!EMAIL.test(email)) return { error: "Please enter a valid email address.", values };
  if (password.length < 8) return { error: "Password must be at least 8 characters.", values };

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return { error: "An account with that email already exists. Try logging in.", values };

  const user = await db.user.create({
    data: { name, email, passwordHash: await hashPassword(password) },
    select: { id: true },
  });
  await createSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await db.user.findUnique({ where: { email }, select: { id: true, passwordHash: true } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Email or password is incorrect.", values: { email } };
  }
  await createSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
