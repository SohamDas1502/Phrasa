import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Avatar } from "./Avatar";
import { AuthForm } from "./AuthForm";

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-4 py-12">
      <div className="flex items-end gap-4">
        <div className="w-20 shrink-0">
          <Avatar className="h-auto w-full" />
        </div>
        <div className="pb-2">
          <Link href="/" className="text-sm font-bold tracking-tight text-muted">
            Phrasa
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        </div>
      </div>
      <Suspense>
        <FormUnlessSignedIn mode={mode} />
      </Suspense>
    </main>
  );
}

async function FormUnlessSignedIn({ mode }: { mode: "login" | "signup" }) {
  if (await getCurrentUser()) redirect("/learn");
  return <AuthForm mode={mode} />;
}
