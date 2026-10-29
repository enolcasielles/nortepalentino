import type { Endpoint } from 'payload'

import { runLinkCheck } from '@/lib/maintenance/links'
import { buildMaintenance } from '@/lib/maintenance/report'

// Incidencias de mantenimiento (skill `plan-editorial`, herramienta
// `mantenimiento` de la extensión de Claude Desktop).
export const maintenanceEndpoint: Endpoint = {
  path: '/cms/mantenimiento',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'No autorizado' }, { status: 401 })
    return Response.json(await buildMaintenance(req.payload))
  },
}

// Comprobación de enlaces. La lanza el cron semanal de Vercel (vercel.json),
// que envía `Authorization: Bearer $CRON_SECRET`; un usuario con sesión
// también puede lanzarla a mano.
export const linkCheckEndpoint: Endpoint = {
  path: '/cms/mantenimiento/enlaces',
  method: 'get',
  handler: async (req) => {
    const secret = process.env.CRON_SECRET
    const fromCron = Boolean(secret) && req.headers.get('authorization') === `Bearer ${secret}`
    if (!fromCron && !req.user) return Response.json({ error: 'No autorizado' }, { status: 401 })
    return Response.json(await runLinkCheck(req.payload))
  },
}
