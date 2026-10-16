import type { PayloadRequest } from 'payload'

// Una operación local con `locale` y un `req` existente SOBRESCRIBE req.locale
// para el resto de la petición: un hook que consulte otro idioma haría que la
// escritura del documento acabe en ese idioma. Todo acceso a otro idioma
// dentro de un hook pasa por aquí, que restaura el idioma original.
export async function withLocale<T>(req: PayloadRequest, fn: () => Promise<T>): Promise<T> {
  const { locale, fallbackLocale } = req
  try {
    return await fn()
  } finally {
    req.locale = locale
    req.fallbackLocale = fallbackLocale
  }
}
