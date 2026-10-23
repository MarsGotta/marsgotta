import type { HastPlugin } from './satteri';

const SITE = 'signals.marsgotta.com';

export function isExternal(href: unknown): boolean {
  if (typeof href !== 'string' || !/^https?:\/\//.test(href)) return false;
  return new URL(href).hostname !== SITE;
}

/**
 * Links that leave the blog get rel="noopener noreferrer". They open in the same tab: only the
 * share buttons open a new one, and they say so (design/signals/LEEME.md §3).
 */
export const rehypeLinks: HastPlugin = {
  name: 'signals-links',
  element: {
    filter: ['a'],
    visit(link, ctx) {
      if (isExternal(link.properties.href))
        ctx.setProperty(link, 'rel', ['noopener', 'noreferrer']);
    },
  },
};
