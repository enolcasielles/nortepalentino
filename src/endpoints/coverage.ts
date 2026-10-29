import type { Endpoint } from 'payload'

import { buildCoverage } from '@/lib/data/coverage'

// Cobertura del contenido para planificar el trabajo editorial (skill
// `plan-editorial`, herramienta `cobertura` de la extensión de Claude Desktop).
export const coverageEndpoint: Endpoint = {
  path: '/cms/cobertura',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'No autorizado' }, { status: 401 })
    return Response.json(await buildCoverage(req.payload))
  },
}
