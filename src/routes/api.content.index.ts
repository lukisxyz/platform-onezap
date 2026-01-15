import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/lib/db'
import { content } from '@/lib/schema'
import { auth, authClient } from '@/lib/auth'

export const Route = createFileRoute('/api/content/')({
  server: {
    handlers: {
      GET: async () => {
        const authResult = await authClient.getSession()

        if (!authResult) {
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

        try {
          const contentList = await db.select().from(content)
          return new Response(JSON.stringify(contentList), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Failed to fetch content' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },

      POST: async ({ request }) => {
        const authResult = await auth.api.getSession({
          headers: request.headers,
        })

        if (!authResult) {
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

        try {
          const body = await request.json()
          const { title, description } = body

          if (!title) {
            return new Response(JSON.stringify({ error: 'Title is required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const userId = authResult.user.id

          const newContent = await db
            .insert(content)
            .values({
              id: crypto.randomUUID(),
              title,
              description,
              userId,
            })
            .returning()

          return new Response(JSON.stringify(newContent[0]), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Failed to create content' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
