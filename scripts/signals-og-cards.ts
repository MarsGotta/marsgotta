export interface OgCard {
  /** Where the card goes, as the pages ask for it: /og/en/give-memory.jpg. */
  image: string;
  /** The page the card is drawn from. */
  from: string;
  /** The generic card of a language: the home's headline at night, instead of a signal's. */
  night: boolean;
}

const OG_IMAGE = /<meta property="og:image" content="https?:\/\/[^/"]+(\/og\/[^"]+)"/;
const GENERIC = /^\/og\/signals-(es|en)\.jpg$/;

/**
 * The cards the built pages ask for in their og:image, once each. A signal's card is drawn from
 * the signal itself; a language's generic card, from its home.
 */
export function ogCards(pages: readonly { path: string; html: string }[]): OgCard[] {
  const cards = new Map<string, OgCard>();
  for (const { path, html } of pages) {
    const image = OG_IMAGE.exec(html)?.[1];
    if (!image || cards.has(image)) continue;
    const generic = GENERIC.exec(image);
    cards.set(image, {
      image,
      from: generic ? (generic[1] === 'en' ? '/en' : '/') : path,
      night: Boolean(generic),
    });
  }
  return [...cards.values()];
}
