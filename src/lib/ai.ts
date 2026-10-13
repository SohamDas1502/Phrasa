import "server-only";

/**
 * Minimal Groq client (OpenAI-compatible chat completions).
 * Swap providers by changing AI_BASE_URL / AI_MODEL; nothing else depends on Groq.
 */
const BASE_URL = process.env.AI_BASE_URL ?? "https://api.groq.com/openai/v1";
const MODEL = process.env.AI_MODEL ?? "qwen/qwen3.8-27b";

export class AiError extends Error {
  constructor(
    public kind: "not_configured" | "rate_limited" | "failed",
    message: string,
  ) {
    super(message);
  }
}

export const aiConfigured = () => Boolean(process.env.GROQ_API_KEY);

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/** Ask the model for JSON matching `schema` (strict mode), and parse it. */
export async function chatJSON<T>({
  messages,
  name,
  schema,
  temperature = 0.7,
  maxTokens = 900,
}: {
  messages: ChatMessage[];
  name: string;
  schema: Record<string, unknown>;
  temperature?: number;
  maxTokens?: number;
}): Promise<T> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new AiError("not_configured", "GROQ_API_KEY is not set");

  const request = () =>
    fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature,
        max_completion_tokens: maxTokens,
        // Qwen 3.8: skip the thinking step; replies are short and we validate them anyway.
        reasoning_effort: "none",
        response_format: { type: "json_schema", json_schema: { name, strict: true, schema } },
      }),
      signal: AbortSignal.timeout(20_000),
    });

  let res: Response;
  try {
    res = await request();
    // Free tiers have tight per-minute limits; if the wait is short, wait once and retry.
    if (res.status === 429) {
      const wait = Number(res.headers.get("retry-after"));
      if (wait > 0 && wait <= 6) {
        await new Promise((r) => setTimeout(r, wait * 1000));
        res = await request();
      }
    }
  } catch (e) {
    throw new AiError("failed", `AI request failed: ${(e as Error).message}`);
  }

  if (res.status === 429) throw new AiError("rate_limited", "AI provider rate limit reached");
  if (!res.ok) throw new AiError("failed", `AI provider returned ${res.status}: ${(await res.text()).slice(0, 300)}`);

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new AiError("failed", "AI returned an empty reply");
  try {
    return JSON.parse(content) as T;
  } catch {
    throw new AiError("failed", "AI returned invalid JSON");
  }
}
