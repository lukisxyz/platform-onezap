import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/lib/db'
import { content } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/content/')({
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

  POST: async ({ request }) => {
    try {
      const body = await request.json()
      const { title, description } = body

      if (!title) {
        return new Response(JSON.stringify({ error: 'Title is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // TODO: Get userId from session
      const userId = 'temp-user-id'

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
})
