import { auth } from '@/lib/auth'
import { createMiddleware } from '@tanstack/react-start'

export const authMiddleware = createMiddleware().server(async ({ next, request }) => {
  const resp = await auth.api.getSession({
    headers: request.headers,
  })

  if (!resp) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized',
        message: 'Please sign in to access this resource',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  return next({
    context: {
      session: resp.session,
      user: resp.user,
    },
  })
})
