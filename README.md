# Phrasa: Learn Chinese

**Try it live: [phrasa-xi.vercel.app](https://phrasa-xi.vercel.app)**

An AI-powered Chinese learning app that takes you from HSK 1 to HSK 9, one character at a time. You start with common hanzi and build them into longer and longer sentences.

## How a lesson works

The home page greets you with your block avatar waving hello (你好 / Hello). Sign up, and you go straight into your next lesson.

1. **New characters**: flashcards for 5–6 common hanzi. Tap to reveal the pinyin, meaning, audio, stroke-order animation and a memory hint.
2. **Flashcard round**: a quick quiz (meaning, sound and recognition) that also mixes in characters from earlier lessons. Anything you miss comes back at the end.
3. **Build sentences**: read an English sentence and arrange the hanzi tiles into Chinese. Every sentence uses only characters you've already learned.

Your progress, coins and character stats are saved to your account.

## AI features (Groq + Qwen)

- **Practice** (`/practice`): fresh sentences written by AI using *only* characters you've learned, focused on your iffy ones. Every sentence is checked on the server (known characters only, sensible tiles) before it's used, then stored and reused for all learners, so most rounds need no AI call. Without AI, practice falls back to sentences from your finished lessons.
- **Chat with your buddy** (`/chat`): a conversation in Chinese limited to your vocabulary, with pinyin, English on tap, audio, and gentle corrections of what you type. Replies with unlearned characters are retried automatically.
- Runs on Groq's free tier with `qwen/qwen3.8-27b`. The key stays on the server; AI calls and coin rewards are capped per learner per day. Any OpenAI-compatible provider works via `AI_BASE_URL` / `AI_MODEL`.

## Accounts, coins and your hanzi deck

- **Sign up / log in** with email and password. Passwords are hashed with scrypt; sessions live in the database behind an http-only cookie.
- **Coins** for practice: +1 per correct flashcard answer, +2 per correct sentence (lessons and practice), +10 for finishing a lesson the first time, +5 for every 3 messages you write in Chinese in chat.
- **Profile** (`/profile`): lessons done, characters seen, mastered count, coins, your lesson path, and your **hanzi deck**:
  - **Mastered**: right 3+ times in a row
  - **Iffy**: missed, and not yet back to 3 right in a row
  - **Just introduced**: no misses yet, still settling in

## Current content

Six starter lessons covering 34 high-frequency HSK 1 characters and 36 sentences, from 你好 up to 我的朋友在中国.

## Tech stack

- Next.js (App Router, Cache Components) + TypeScript + Tailwind CSS
- PostgreSQL + Prisma 7
- [Hanzi Writer](https://hanziwriter.org) for stroke-order animation
- Browser speech synthesis (`zh-CN`) for audio

## Getting started

You need PostgreSQL running locally.

```bash
createdb phrasa
cp .env.example .env        # then set DATABASE_URL (and GROQ_API_KEY for AI)
npm install                 # also generates the Prisma client
npm run db:migrate          # creates the tables
npm run dev
```

Then open http://localhost:3000.

## Project structure

```
src/
├── app/                  # Home (/), lessons (/learn), /login, /signup, /profile
│   └── actions/          # Server actions: auth, lesson completion + coins
├── components/
│   ├── Avatar.tsx        # Animated block avatar (layered for future outfits)
│   ├── HelloBubble.tsx   # 你好 / Hello speech bubble
│   ├── LessonPlayer.tsx  # Runs a lesson: cards → quiz → sentences → done
│   ├── Flashcards.tsx    # New-character intro cards
│   ├── CharacterQuiz.tsx # Multiple-choice drill with retry queue
│   ├── SentenceBuilder.tsx
│   └── StrokeAnimation.tsx
├── data/lessons.ts       # Curriculum: characters + sentences per lesson
├── generated/prisma/     # Generated Prisma client (not committed)
└── lib/                  # DB, sessions, password hashing, coin + mastery rules, speech
```

## Roadmap

- Full HSK 1–9 vocabulary
- AI marking of free-typed translations
- A store to spend coins on outfits and accessories for your avatar
- Handwriting practice, listening and typing exercises
