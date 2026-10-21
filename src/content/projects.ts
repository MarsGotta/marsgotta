/** The three pieces, in the order they appear everywhere: what it shows you, remembers, and where it lives. */
export const projectKeys = ['kimen', 'jezero', 'orbit'] as const;
export type ProjectKey = (typeof projectKeys)[number];
