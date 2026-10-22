import type { Lang } from '../i18n';

// The other languages of Spain: their speakers read Spanish before English.
const READS_SPANISH = new Set(['es', 'ca', 'gl', 'eu']);

/**
 * The site language a browser asks for in its Accept-Language header: Spanish or English, whichever
 * it ranks first, and English for any other language. Null when the header says nothing, as with
 * most crawlers.
 */
export function negotiateLanguage(header: string | null): Lang | null {
  const ranges = (header ?? '')
    .split(',')
    .map((part) => {
      const [tag = '', ...params] = part.trim().split(';');
      const q = params.find((param) => param.trim().startsWith('q='));
      return {
        primary: tag.trim().split('-')[0].toLowerCase(),
        q: q ? Number(q.split('=')[1]) : 1,
      };
    })
    .filter(({ primary, q }) => primary !== '' && primary !== '*' && q > 0)
    .sort((a, b) => b.q - a.q);
  if (ranges.length === 0) return null;
  const known = ranges.find(({ primary }) => READS_SPANISH.has(primary) || primary === 'en');
  return known && READS_SPANISH.has(known.primary) ? 'es' : 'en';
}
