// Validación de campos que son opcionales en borrador pero obligatorios para
// publicar (fichas con datos verificados, CLAUDE.md §7.4 y §10).
export function requiredWhenPublished() {
  return (value: unknown, { siblingData }: { siblingData: unknown }): true | string => {
    const estado = (siblingData as { estado?: string } | undefined)?.estado
    if (estado !== 'publicado') return true
    const empty =
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    return empty ? 'Obligatorio para publicar.' : true
  }
}

// Cifras de ruta: siempre verificadas, nunca estimadas; positivas y obligatorias para publicar
export function positiveNumberWhenPublished() {
  const required = requiredWhenPublished()
  return (value: unknown, options: { siblingData: unknown }): true | string => {
    if (typeof value === 'number' && value <= 0) return 'Debe ser mayor que 0.'
    return required(value, options)
  }
}
