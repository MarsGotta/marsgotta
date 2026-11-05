import { describe, expect, it } from 'vitest';
import { asksToSubscribe } from './newsletter';

describe('asksToSubscribe', () => {
  it('offers the newsletter on every page, the 404 included', () => {
    expect(asksToSubscribe({ kind: 'home' })).toBe(true);
    expect(asksToSubscribe({ kind: 'signal', slug: 'dale-memoria' })).toBe(true);
    expect(asksToSubscribe(null)).toBe(true);
  });

  it('does not offer it to a reader who has just confirmed', () => {
    expect(asksToSubscribe({ kind: 'subscribed' })).toBe(false);
  });
});
