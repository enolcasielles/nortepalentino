import type { MetadataRoute } from 'next'

import { segments } from '@/lib/i18n'

// Bots de IA permitidos explícitamente (CLAUDE.md §7.3)
const aiBots = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'Bingbot',
]

// Mientras SITE_INDEXABLE=false, el noindex lo aplican la cabecera
// X-Robots-Tag y la meta robots; robots.txt no bloquea para que se lean.
export default function robots(): MetadataRoute.Robots {
  const disallow = [
    '/admin',
    '/api',
    ...Object.entries(segments.buscar).map(([locale, slug]) => `/${locale}/${slug}`),
  ]

  return {
    rules: [
      { userAgent: aiBots, allow: '/', disallow },
      { userAgent: '*', allow: '/', disallow },
    ],
    // sitemap: se añade cuando exista app/sitemap.ts
  }
}
