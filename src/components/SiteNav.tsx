import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { CoinCounter } from "./CoinCounter";

/** Top-right nav. Reads the session, so render it inside a <Suspense> boundary. */
export async function SiteNav() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <nav className="flex items-center gap-4 text-sm font-medium">
        <Link href="/login" className="underline-offset-4 hover:underline">
          Log in
        </Link>
        <Link href="/signup" className="rounded-full bg-accent px-4 py-2 text-on-accent transition hover:opacity-90">
          Sign up
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-3 text-sm font-medium">
      <CoinCounter key={user.coins} coins={user.coins} />
      <Link
        href="/profile"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-bold text-on-accent"
        title="Your profile"
      >
        {user.name.slice(0, 1).toUpperCase()}
        <span className="sr-only">Your profile</span>
      </Link>
    </nav>
  );
}
