import { auth } from '@/lib/auth'

export const authMiddleware = async (request: Request) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
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

    return null
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized',
        message: 'Authentication failed',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
