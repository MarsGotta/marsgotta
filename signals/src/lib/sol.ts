import { marsClock } from '@portfolio/lib/mars-clock';

/** The sol at Jezero on the day a signal is published, read at 10:00 UTC as in the prototype. */
export function solOf(publishedAt: Date): number {
  const day = publishedAt.toISOString().slice(0, 10);
  return marsClock(Date.parse(`${day}T10:00:00Z`)).sol;
}
