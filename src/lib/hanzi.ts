const HAN = /\p{Script=Han}/u;

export const isHan = (c: string) => HAN.test(c);

/** Distinct hanzi in a string, in order of first appearance. */
export function hanziIn(text: string): string[] {
  return [...new Set([...text].filter(isHan))];
}

/** Hanzi in `text` that aren't in `known`. */
export function unknownHanzi(text: string, known: ReadonlySet<string>): string[] {
  return hanziIn(text).filter((c) => !known.has(c));
}
