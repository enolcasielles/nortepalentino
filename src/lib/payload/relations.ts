// Un campo de relación llega como id o como documento poblado según `depth`
export function relId(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value !== '') return Number(value)
  if (value && typeof value === 'object' && 'id' in value) return relId((value as { id: unknown }).id)
  return null
}
