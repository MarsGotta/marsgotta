import type { ShikiTransformer } from './satteri';

type HastRoot = Parameters<NonNullable<ShikiTransformer['root']>>[0];
type HastElement = Extract<HastRoot['children'][number], { type: 'element' }>;
type HastChild = HastElement['children'][number];

function h(
  tagName: string,
  properties: HastElement['properties'] = {},
  children: HastChild[] = [],
): HastElement {
  return { type: 'element', tagName, properties, children };
}

/** «schema.sql» from the meta of ```sql title="schema.sql". */
export function codeTitle(meta: string | undefined): string | undefined {
  return /title=(?:"([^"]*)"|'([^']*)')/
    .exec(meta ?? '')
    ?.slice(1)
    .find(Boolean);
}

const copyIcon = () =>
  h(
    'svg',
    {
      viewBox: '0 0 16 16',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '1.3',
      ariaHidden: 'true',
    },
    [
      h('rect', { x: '5', y: '5', width: '8.5', height: '8.5', rx: '1.6' }),
      h('path', {
        d: 'M10.5 5V3.6A1.6 1.6 0 0 0 8.9 2H3.6A1.6 1.6 0 0 0 2 3.6v5.3a1.6 1.6 0 0 0 1.6 1.6H5',
      }),
    ],
  );

/**
 * A Shiki transformer: each code block becomes a figure with a file bar (a dot, the file name from
 * the meta, or the language without one) and a «Copy» button. The button stays hidden until the
 * script gives it its label, so without JS there is no button that does nothing.
 */
export function codeFigure(): ShikiTransformer {
  return {
    name: 'signals-code-figure',
    pre(node) {
      // The figure carries the theme's background: --code-bg changes with the blog's theme.
      // (Astro already makes the block reachable with the keyboard: tabindex="0".)
      delete node.properties.style;
    },
    root(root) {
      const pre = root.children.find(
        (child): child is HastElement => child.type === 'element' && child.tagName === 'pre',
      );
      if (!pre) return root;
      const name = codeTitle(this.options.meta?.__raw) ?? this.options.lang;
      const bar = h('figcaption', { className: ['code-bar'] }, [
        h('span', {}, [h('i', { ariaHidden: 'true' }), { type: 'text', value: name }]),
        h('button', { type: 'button', className: ['code-copy'], dataCopyCode: '', hidden: true }, [
          copyIcon(),
          h('span'),
        ]),
      ]);
      return { ...root, children: [h('figure', { className: ['code'] }, [bar, pre])] };
    },
  };
}
