const WORDS_PER_MINUTE = 230;

/**
 * Minutes to read a signal: its words ÷ 230, rounded up. Code counts too, since the reader reads it;
 * Markdown marks on their own (#, -, ```) do not.
 */
export function readingMinutes(markdown: string): number {
  const body = markdown.replace(/^---\n[\s\S]*?\n---\n/, '');
  const words = body.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
