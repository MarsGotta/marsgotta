// The JSON itself, not the i18n module: astro.config loads this plugin before the @portfolio alias exists.
import en from '../../i18n/en.json';
import es from '../../i18n/es.json';
import { signalLang, type HastPlugin } from './satteri';

const MARK = '[!TIP]';

/** What a paragraph says after the [!TIP] mark of an Obsidian callout, or nothing if it has none. */
export function afterTipMark(text: string): string | undefined {
  const opening = text.trimStart();
  return opening.startsWith(MARK) ? opening.slice(MARK.length).replace(/^\s+/, '') : undefined;
}

/**
 * `> [!TIP]` quotes become the «Consejo práctico» aside of the design, labelled for screen
 * readers in the language of the signal. Any other quote stays a quote.
 */
export const rehypeTip: HastPlugin = {
  name: 'signals-tip',
  element: {
    filter: ['blockquote'],
    visit(quote, ctx) {
      const content = quote.children.filter((child) => child.type === 'element');
      const [paragraph, ...rest] = content;
      if (paragraph?.type !== 'element' || paragraph.tagName !== 'p') return;
      const [first, ...inline] = paragraph.children;
      const remaining = first?.type === 'text' ? afterTipMark(first.value) : undefined;
      if (remaining === undefined) return;

      const label = (signalLang(ctx.data) === 'en' ? en : es).post.tip;
      const opening = remaining || inline.length > 0;
      ctx.replaceNode(quote, {
        type: 'element',
        tagName: 'aside',
        properties: { className: ['callout'], ariaLabel: label },
        children: [
          {
            type: 'element',
            tagName: 'p',
            properties: { className: ['callout-label'], ariaHidden: 'true' },
            children: [
              {
                type: 'element',
                tagName: 'svg',
                properties: {
                  viewBox: '0 0 16 16',
                  fill: 'none',
                  stroke: 'currentColor',
                  strokeWidth: '1.4',
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                },
                children: [
                  {
                    type: 'element',
                    tagName: 'circle',
                    properties: { cx: '8', cy: '8', r: '2.4' },
                    children: [],
                  },
                  {
                    type: 'element',
                    tagName: 'path',
                    properties: { d: 'M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2' },
                    children: [],
                  },
                ],
              },
              { type: 'text', value: label },
            ],
          },
          ...(opening
            ? [
                {
                  type: 'element' as const,
                  tagName: 'p',
                  properties: {},
                  children: [{ type: 'text' as const, value: remaining }, ...inline],
                },
              ]
            : []),
          ...rest,
        ],
      });
    },
  },
};
