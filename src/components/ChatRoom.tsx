"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { sendChatMessage, type AvatarReply, type ChatTurn, type LearnerFeedback } from "@/app/actions/chat";
import { burstCoins } from "@/lib/coinBurst";
import { speak } from "@/lib/speech";
import { Avatar } from "./Avatar";
import { CoinIcon } from "./Coins";
import { SpeakButton } from "./SpeakButton";

type Message =
  | { id: number; role: "avatar"; reply: AvatarReply; coins?: number }
  | { id: number; role: "learner"; text: string; feedback?: LearnerFeedback };

const GREETING: AvatarReply = {
  zh: "你好！",
  pinyin: "nǐ hǎo!",
  en: "Hello! Say something to me in Chinese, or ask how to say something.",
  unknown: [],
};

/** Hanzi with any not-yet-learned characters underlined. */
function Hanzi({ text, unknown }: { text: string; unknown: string[] }) {
  if (unknown.length === 0) return <>{text}</>;
  return (
    <>
      {[...text].map((c, i) =>
        unknown.includes(c) ? (
          <span key={i} title="A character you haven’t learned yet" className="underline decoration-dotted decoration-2 underline-offset-4">
            {c}
          </span>
        ) : (
          c
        ),
      )}
    </>
  );
}

/** Chat with your avatar in Chinese, using only characters you know. */
export function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([{ id: 0, role: "avatar", reply: GREETING }]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPinyin, setShowPinyin] = useState(true);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [pending, startSending] = useTransition();
  const nextId = useRef(1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const coinRefs = useRef(new Map<number, HTMLElement>());
  const burstFor = useRef(new Set<number>());

  // Keep the newest message in view.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  // Fly coins from a rewarded reply into the header counter, once per reply.
  useEffect(() => {
    for (const m of messages) {
      if (m.role !== "avatar" || !m.coins || burstFor.current.has(m.id)) continue;
      const el = coinRefs.current.get(m.id);
      if (!el) continue;
      burstFor.current.add(m.id);
      burstCoins(el, m.coins);
    }
  }, [messages]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || pending) return;

    const history: ChatTurn[] = messages.map((m) =>
      m.role === "avatar" ? { role: "avatar", text: m.reply.zh } : { role: "learner", text: m.text },
    );
    const learnerId = nextId.current++;
    setMessages((ms) => [...ms, { id: learnerId, role: "learner", text }]);
    setDraft("");
    setError(null);

    startSending(async () => {
      try {
        const result = await sendChatMessage(history, text);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        const avatarId = nextId.current++;
        setMessages((ms) => [
          ...ms.map((m) => (m.id === learnerId && m.role === "learner" ? { ...m, feedback: result.feedback } : m)),
          { id: avatarId, role: "avatar", reply: result.reply, coins: result.coinsEarned || undefined },
        ]);
        speak(result.reply.zh);
      } catch {
        setError("Something went wrong. Try sending that again.");
      }
    });
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14">
            <Avatar pose="idle" className="h-auto w-full" />
          </div>
          <div>
            <h1 className="font-semibold">Chat with your buddy</h1>
            <p className="text-sm text-muted">Only uses characters you’ve learned</p>
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={showPinyin} onChange={(e) => setShowPinyin(e.target.checked)} className="accent-ink" />
          Pinyin
        </label>
      </div>

      <ol className="flex flex-1 flex-col gap-4 pb-4" aria-live="polite">
        {messages.map((m) =>
          m.role === "avatar" ? (
            <li key={m.id} className="flex max-w-[85%] flex-col gap-1 self-start">
              <div className="rounded-2xl rounded-bl-md border-2 border-ink bg-surface px-4 py-3 shadow-[3px_3px_0_var(--ink)]">
                <div className="flex items-start justify-between gap-3">
                  <p className="hanzi text-2xl leading-snug">
                    <Hanzi text={m.reply.zh} unknown={m.reply.unknown} />
                  </p>
                  <SpeakButton text={m.reply.zh} />
                </div>
                {showPinyin && <p className="text-sm text-muted">{m.reply.pinyin}</p>}
                {revealed.has(m.id) ? (
                  <p className="mt-1 text-sm">{m.reply.en}</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRevealed((r) => new Set(r).add(m.id))}
                    className="mt-1 text-sm font-medium underline underline-offset-4"
                  >
                    Show English
                  </button>
                )}
              </div>
              {m.coins && (
                <span
                  ref={(el) => {
                    if (el) coinRefs.current.set(m.id, el);
                  }}
                  className="coin-pop inline-flex items-center gap-1 self-start rounded-full border-2 border-ink px-3 py-0.5 text-sm font-bold"
                >
                  <CoinIcon size={14} />+{m.coins} for chatting in Chinese
                </span>
              )}
            </li>
          ) : (
            <li key={m.id} className="flex max-w-[85%] flex-col items-end gap-1 self-end">
              <p className="hanzi rounded-2xl rounded-br-md bg-accent px-4 py-3 text-lg text-on-accent">{m.text}</p>
              {m.feedback && m.feedback.status !== "none" && (
                <p
                  className={`rounded-xl border-2 px-3 py-1.5 text-right text-sm ${
                    m.feedback.status === "great" ? "border-good bg-good/10 text-good" : "border-bad bg-bad/10 text-bad"
                  }`}
                >
                  {m.feedback.status === "fix" && m.feedback.correctedZh && (
                    <span className="hanzi mr-1 font-semibold">{m.feedback.correctedZh}</span>
                  )}
                  {m.feedback.noteEn}
                </p>
              )}
              {m.feedback?.status === "none" && (m.feedback.correctedZh || m.feedback.noteEn) && (
                <p className="rounded-xl border-2 border-line px-3 py-1.5 text-right text-sm text-muted">
                  {m.feedback.correctedZh && <span className="hanzi mr-1 font-semibold text-ink">{m.feedback.correctedZh}</span>}
                  {m.feedback.noteEn}
                </p>
              )}
            </li>
          ),
        )}
        {pending && (
          <li className="self-start rounded-2xl rounded-bl-md border-2 border-line px-4 py-3 text-muted" aria-label="Your buddy is typing">
            <span className="typing-dots">
              <span>•</span>
              <span>•</span>
              <span>•</span>
            </span>
          </li>
        )}
      </ol>
      <div ref={bottomRef} />

      {error && (
        <p role="alert" className="mb-3 rounded-xl border-2 border-bad bg-bad/10 px-4 py-2 text-sm font-medium text-bad">
          {error}
        </p>
      )}

      <form onSubmit={send} className="sticky bottom-0 flex gap-2 bg-bg pt-2 pb-4">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={200}
          placeholder="Type in Chinese, pinyin or English…"
          aria-label="Your message"
          className="hanzi min-w-0 flex-1 rounded-2xl border-2 border-line bg-surface px-4 py-3 text-base outline-none transition focus:border-ink"
        />
        <button
          type="submit"
          disabled={!draft.trim() || pending}
          className="rounded-2xl bg-accent px-5 py-3 font-semibold text-on-accent transition hover:opacity-90 disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
