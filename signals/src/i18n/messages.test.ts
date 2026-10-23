import { describe, expect, it } from 'vitest';
import { getMessages } from './index';

/** Every key path of the copy, arrays included by index, so a missing translation shows up. */
function keyPaths(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe('the blog copy', () => {
  it('has the same keys in Spanish and English', () => {
    expect(keyPaths(getMessages('en'))).toEqual(keyPaths(getMessages('es')));
  });
});
