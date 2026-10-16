import { llmsTxt } from '@/lib/seo/llms'

export async function GET() {
  return new Response(await llmsTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, s-maxage=3600' },
  })
}
