import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { indexNowKey } from './indexnow';

describe('IndexNow key', () => {
  it('is published at the site root, as the protocol requires', () => {
    const file = new URL(`../../public/${indexNowKey}.txt`, import.meta.url);
    expect(readFileSync(file, 'utf8')).toBe(indexNowKey);
    expect(indexNowKey).toMatch(/^[a-f0-9]{32}$/);
  });
});
