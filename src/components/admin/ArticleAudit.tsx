'use client'

import { useDocumentInfo, useLocale } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

import type { AuditCheck } from '@/lib/seo/articleAudit'

type Result = Record<string, { existe: boolean; comprobaciones: AuditCheck[] }>

// Revisión SEO del artículo guardado en el idioma que se edita (solo panel de
// administración; no llega al frontend). Avisa, no bloquea.
export function ArticleAudit() {
  const { id, lastUpdateTime } = useDocumentInfo()
  const locale = useLocale()
  const [state, setState] = useState<{ checks: AuditCheck[]; exists: boolean } | { error: string } | null>(null)

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    fetch(`/api/cms/auditoria/${id}?locale=${locale.code}`, { credentials: 'include', signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: Result) => {
        const entry = data[locale.code]
        if (entry) setState({ checks: entry.comprobaciones, exists: entry.existe })
      })
      .catch((error: Error) => {
        if (error.name !== 'AbortError') setState({ error: 'No se pudo calcular la revisión.' })
      })
    return () => controller.abort()
  }, [id, locale.code, lastUpdateTime])

  const box: React.CSSProperties = {
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: 'var(--style-radius-m)',
    padding: '1rem 1.25rem',
    marginBottom: '1.5rem',
  }

  if (!id) return <div style={box}>Revisión SEO: guarda el artículo para verla.</div>
  if (!state) return <div style={box}>Revisión SEO: calculando…</div>
  if ('error' in state) return <div style={box}>{state.error}</div>

  const pending = state.checks.filter((c) => !c.ok)
  const errors = pending.filter((c) => c.level === 'error').length
  return (
    <div style={box}>
      <h4 style={{ margin: '0 0 0.25rem' }}>
        Revisión SEO ({locale.code.toUpperCase()}): {errors ? `${errors} por resolver` : pending.length ? 'mejorable' : 'todo en orden'}
      </h4>
      <p style={{ margin: '0 0 0.75rem', color: 'var(--theme-elevation-500)' }}>
        Del último guardado. {state.exists ? 'La página está publicada en este idioma.' : 'La página aún no existe en este idioma.'}
      </p>
      <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'grid', gap: '0.35rem' }}>
        {state.checks.map((c) => (
          <li key={c.id} style={{ display: 'flex', gap: '0.5rem' }}>
            <span aria-hidden="true">{c.ok ? '✅' : c.level === 'error' ? '❌' : '⚠️'}</span>
            <span>
              <span className="sr-only">{c.ok ? 'Correcto: ' : c.level === 'error' ? 'Error: ' : 'Aviso: '}</span>
              {c.message}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
