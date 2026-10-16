import { revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { cacheTags } from '@/lib/cache/tags'

export function safeRevalidate(tags: string[]): void {
  for (const tag of tags) {
    try {
      revalidateTag(tag, 'max')
    } catch {
      // Fuera de Next (CLI, seed) no hay caché que invalidar
    }
  }
}

// Invalida la colección (listados), el documento (ficha), el sitemap y
// llms-full.txt. Las consultas de datos usan estos mismos tags (lib/cache/tags.ts).
export function revalidateCollection(slug: string, extraTags: string[] = [cacheTags.sitemap, cacheTags.llms]) {
  const tagsFor = (id: string | number) => [cacheTags.collection(slug), cacheTags.doc(slug, id), ...extraTags]

  const afterChange: CollectionAfterChangeHook = ({ doc, context }) => {
    if (!context.disableRevalidate) safeRevalidate(tagsFor(doc.id))
    return doc
  }

  const afterDelete: CollectionAfterDeleteHook = ({ doc, context }) => {
    if (!context.disableRevalidate) safeRevalidate(tagsFor(doc.id))
    return doc
  }

  return { afterChange: [afterChange], afterDelete: [afterDelete] }
}
