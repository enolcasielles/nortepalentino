import type { Dictionary } from '@/lib/i18n'

// El aviso de portal independiente aparece en todas las páginas (CLAUDE.md §1.2)
export function SiteFooter({ dict }: { dict: Dictionary }) {
  return (
    <footer className="mt-16 bg-surface-alt">
      <div className="container-page py-8 text-sm text-text-muted">
        <p>{dict.site.disclaimer}</p>
      </div>
    </footer>
  )
}
