import "server-only";
import { charsThrough, lessons, type Sentence } from "@/data/lessons";

/** Characters from every lesson the learner has finished. */
export function knownChars(lessonIndex: number): Set<string> {
  return new Set(charsThrough(Math.min(lessonIndex, lessons.length) - 1).map((h) => h.char));
}

/** Sentences from finished lessons: the offline fallback for practice. */
export function lessonSentences(lessonIndex: number): Sentence[] {
  return lessons.slice(0, Math.min(lessonIndex, lessons.length)).flatMap((l) => l.sentences);
}
