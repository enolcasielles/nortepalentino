import { ValidationError, type CollectionBeforeValidateHook } from 'payload'

// Las fichas [DEMO] son fixtures de desarrollo y nunca llegan a producción (CLAUDE.md §1.1)
export function rejectDemoInProduction(titleField: string): CollectionBeforeValidateHook {
  return ({ data, collection }) => {
    if (process.env.VERCEL_ENV !== 'production') return data
    const title = data?.[titleField]
    if (typeof title === 'string' && title.trimStart().startsWith('[DEMO]')) {
      throw new ValidationError({
        collection: collection.slug,
        errors: [{ path: titleField, message: 'Los registros [DEMO] no se pueden crear en producción.' }],
      })
    }
    return data
  }
}
