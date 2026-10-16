// Resolución de redirects en tiempo de petición. Sigue cadenas (exactos y de
// prefijo) hasta un máximo de saltos y devuelve el destino final, para servir
// un único 301. La tabla se mantiene colapsada al guardar, pero las cadenas
// que mezclan prefijos solo se pueden resolver aquí.

export type RedirectRule = {
  desde: string
  hacia: string
  tipo: 'exacto' | 'prefijo'
}

const MAX_HOPS = 10

function applyOnce(path: string, rules: RedirectRule[]): string | null {
  const exact = rules.find((r) => r.tipo === 'exacto' && r.desde === path)
  if (exact) return exact.hacia
  // El prefijo más largo gana
  let best: RedirectRule | null = null
  for (const r of rules) {
    if (r.tipo !== 'prefijo') continue
    if (path !== r.desde && !path.startsWith(`${r.desde}/`)) continue
    if (!best || r.desde.length > best.desde.length) best = r
  }
  return best ? `${best.hacia}${path.slice(best.desde.length)}` : null
}

export function resolveRedirect(path: string, rules: RedirectRule[]): string | null {
  const seen = new Set([path])
  let current = path
  for (let i = 0; i < MAX_HOPS; i++) {
    const next = applyOnce(current, rules)
    if (!next) break
    // Bucle: mejor un 404 que redirigir en círculo
    if (seen.has(next)) return null
    seen.add(next)
    current = next
  }
  return current === path ? null : current
}
