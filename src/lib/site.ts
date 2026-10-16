// Configuración global del sitio leída del entorno (CLAUDE.md §11)

// URL canónica base. En Vercel, si NEXT_PUBLIC_SITE_URL no está definida, se
// usa la URL de producción del proyecto (o la del propio despliegue en preview).
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/$/, '')
  const vercelHost =
    process.env.VERCEL_ENV === 'production'
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL
  return vercelHost ? `https://${vercelHost}` : 'http://localhost:3000'
}

export const siteUrl = resolveSiteUrl()

export const siteName = 'Norte Palentino'
