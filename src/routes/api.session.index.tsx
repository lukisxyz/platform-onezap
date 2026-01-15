import { createAPIFileRoute } from '@tanstack/start/api'
import { auth } from '@/lib/auth'

export const APIRoute = createAPIFileRoute('/api/session')({
  GET: async ({ request }) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      })

      return new Response(JSON.stringify(session), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      return new Response(JSON.stringify(null), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  },
})
