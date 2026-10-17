import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { en } from '@payloadcms/translations/languages/en'
import { es } from '@payloadcms/translations/languages/es'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { ArchivosGpx } from './collections/ArchivosGpx'
import { Articulos } from './collections/Articulos'
import { Autores } from './collections/Autores'
import { CategoriasNegocio } from './collections/CategoriasNegocio'
import { Landings } from './collections/Landings'
import { Media } from './collections/Media'
import { Municipios } from './collections/Municipios'
import { Negocios } from './collections/Negocios'
import { Nucleos } from './collections/Nucleos'
import { Recursos } from './collections/Recursos'
import { Redirects } from './collections/Redirects'
import { Rutas } from './collections/Rutas'
import { TiposRecurso } from './collections/TiposRecurso'
import { Users } from './collections/Users'
import { articleAuditEndpoint } from './endpoints/articleAudit'
import { schemaEndpoint } from './endpoints/schema'
import { defaultLocale, locales } from './lib/i18n/config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    supportedLanguages: { es, en },
    fallbackLanguage: 'es',
  },
  localization: {
    locales: [
      { code: 'es', label: 'Español' },
      { code: 'en', label: 'English' },
    ] satisfies { code: (typeof locales)[number]; label: string }[],
    defaultLocale,
    // Sin fallback: si falta el texto EN, la página no existe en EN (CLAUDE.md §7.4)
    fallback: false,
  },
  collections: [
    Municipios,
    Nucleos,
    Negocios,
    CategoriasNegocio,
    Recursos,
    TiposRecurso,
    Rutas,
    ArchivosGpx,
    Articulos,
    Landings,
    Autores,
    Media,
    Redirects,
    Users,
  ],
  endpoints: [schemaEndpoint, articleAuditEndpoint],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      // Las migraciones van por conexión directa (Neon: DATABASE_URL_UNPOOLED);
      // el resto, por el pooler. En local ambas son la misma.
      connectionString:
        (process.env.PAYLOAD_MIGRATING === 'true' && process.env.DATABASE_URL_UNPOOLED) ||
        process.env.DATABASE_URL ||
        '',
    },
    // El esquema se gestiona siempre con migraciones, también en local (CLAUDE.md §3)
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      // Sin token (local) los uploads se guardan en disco
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      // Los campos del plugin existen siempre, haya token o no: el esquema (y
      // las migraciones generadas en local) debe ser igual en todos los entornos
      alwaysInsertFields: true,
      collections: { media: true, archivos_gpx: true },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
      // Subida directa del navegador a Blob: las funciones de Vercel no aceptan cuerpos > 4,5 MB
      clientUploads: true,
    }),
  ],
})
