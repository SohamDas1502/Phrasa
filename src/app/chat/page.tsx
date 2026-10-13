import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChatRoom } from "@/components/ChatRoom";
import { SiteNav } from "@/components/SiteNav";
import { requireUser } from "@/lib/auth";
import { AI_UNLOCK_LESSONS } from "@/lib/learner";

export const metadata: Metadata = { title: "Chat · Phrasa" };

export default function ChatPage() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-xl flex-1 flex-col px-4 pt-6 sm:pt-10">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Phrasa <span className="hanzi text-accent">学</span>
        </Link>
        <Suspense>
          <SiteNav />
        </Suspense>
      </header>

      <main className="flex flex-1 flex-col">
        <Suspense fallback={<p className="text-center text-muted">Loading…</p>}>
          <Chat />
        </Suspense>
      </main>
    </div>
  );
}

async function Chat() {
  const user = await requireUser("/chat");
  if (user.lessonIndex < AI_UNLOCK_LESSONS) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-2xl font-semibold">Chat unlocks after Lesson {AI_UNLOCK_LESSONS}</h2>
        <p className="max-w-sm text-muted">
          Your buddy only uses characters you’ve learned, so it needs a few more words (like 吗 for questions) before you can chat.
        </p>
        <Link href="/learn" className="rounded-2xl bg-accent px-6 py-3 font-semibold text-on-accent">
          Continue learning
        </Link>
      </div>
    );
  }
  return <ChatRoom />;
}
