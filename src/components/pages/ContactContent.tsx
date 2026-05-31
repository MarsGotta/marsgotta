'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Content } from '@/data/content';
import { Starfield } from '../cosmic/Starfield';

type Props = {
  content: Content;
};

export function ContactContent({ content }: Props) {
  const t = useTranslations('contact');
  const c = content.contact;
  const [sent, setSent] = useState(false);

  // NOTE: the legacy design wired this form to a hosted LLM (`window.claude.complete`).
  // For the production rebuild we stub the AI panel and rely on mailto for the form.
  // F3 / F4 will wire a server action that posts to a contact endpoint.

  return (
    <div className="page-contact variant-cosmic">
      <Starfield />
      <div className="page-inner">
        <div className="page-overline">{t('overline')}</div>
        <h1 className="page-title">{c.title}</h1>
        <p className="page-lede">{c.sub}</p>

        <div className="contact-grid">
          <form
            className="contact-form"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <input
              className="contact-input"
              placeholder={c.placeholders.name}
              required
              aria-label={c.placeholders.name}
            />
            <input
              className="contact-input"
              type="email"
              placeholder={c.placeholders.email}
              required
              aria-label={c.placeholders.email}
            />
            <textarea
              className="contact-input"
              rows={5}
              placeholder={c.placeholders.message}
              required
              aria-label={c.placeholders.message}
            />
            {!sent ? (
              <button type="submit" className="cosmic-cta primary" data-hover>
                <span>{c.send}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12h14m-6-6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : (
              <div className="contact-sent">✓ {c.sent}</div>
            )}
          </form>

          <div className="contact-ai">
            <div className="contact-ai-badge">
              <div className="cosmic-ai-pulse" />
              <span>{c.ai}</span>
            </div>
            <div className="contact-direct">
              <div>{t('or')}</div>
              <a href={`mailto:${c.email}`} data-hover>
                {c.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
