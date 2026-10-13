import { Suspense } from "react";
import { AvatarGreeting } from "@/components/AvatarGreeting";
import { StartLink, StartLinkFallback } from "@/components/StartLink";

export default function Home() {
  return (
    // Clips the avatar while it walks in from off-screen.
    <div className="flex w-full flex-1 overflow-x-clip">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-10 px-4 py-16">
        <div className="flex items-end gap-3 sm:gap-10">
          <div className="pb-4">
            <h1 className="text-5xl font-bold tracking-tight sm:text-8xl">Phrasa</h1>
            <p className="mt-2 text-sm text-muted sm:mt-3 sm:text-xl">AI powered Chinese learning app</p>
          </div>

          <AvatarGreeting />
        </div>

        <Suspense fallback={<StartLinkFallback />}>
          <StartLink />
        </Suspense>
      </main>
    </div>
  );
}
