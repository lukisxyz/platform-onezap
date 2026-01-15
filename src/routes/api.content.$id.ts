import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/lib/db'
import { content } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export const Route = createFileRoute('/api/content/$id')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
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
          const { id } = params
          const result = await db.select().from(content).where(eq(content.id, id))

          if (result.length === 0) {
            return new Response(JSON.stringify({ error: 'Content not found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          return new Response(JSON.stringify(result[0]), {
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

      PUT: async ({ params, request }) => {
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
          const { id } = params
          const body = await request.json()

          const updateData: any = {}
          if (body.title !== undefined) updateData.title = body.title
          if (body.description !== undefined) updateData.description = body.description
          updateData.updatedAt = new Date()

          const result = await db
            .update(content)
            .set(updateData)
            .where(eq(content.id, id))
            .returning()

          if (result.length === 0) {
            return new Response(JSON.stringify({ error: 'Content not found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          return new Response(JSON.stringify(result[0]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Failed to update content' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },

      DELETE: async ({ params, request }) => {
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
          const { id } = params

          const result = await db.delete(content).where(eq(content.id, id)).returning()

          if (result.length === 0) {
            return new Response(JSON.stringify({ error: 'Content not found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          return new Response(null, {
            status: 204,
          })
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Failed to delete content' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
