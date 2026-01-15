import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/lib/db'
import { content } from '@/lib/schema'
import { authMiddleware } from '@/middleware/auth'

export const Route = createFileRoute('/api/content/')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: async () => {
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

      POST: async ({ request, context }) => {
        try {
          const body = await request.json()
          const { title, excerpt, content: contentText, isPremium } = body

          if (!title) {
            return new Response(JSON.stringify({ error: 'Title is required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          if (!contentText) {
            return new Response(JSON.stringify({ error: 'Content is required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const userId = context.user.id

          const newContent = await db
            .insert(content)
            .values({
              id: crypto.randomUUID(),
              title,
              excerpt,
              content: contentText,
              isPremium: isPremium || false,
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
