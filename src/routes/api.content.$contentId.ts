import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/lib/db'
import { content, user } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export const Route = createFileRoute('/api/content/$contentId')({
  server: {
    handlers: {
      GET: async ({ request, params, context }) => {
        try {
          const contentId = params.contentId

          if (!contentId) {
            return new Response(
              JSON.stringify({ error: 'Content ID is required' }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          // Get the current session to check if user is authenticated
          const session = await auth.api.getSession({
            headers: request.headers,
          })

          // Fetch content with user information
          const contentData = await db
            .select({
              id: content.id,
              title: content.title,
              excerpt: content.excerpt,
              content: content.content,
              isPremium: content.isPremium,
              userId: content.userId,
              createdAt: content.createdAt,
              updatedAt: content.updatedAt,
              creator: {
                id: user.id,
                username: user.username,
                fullname: user.fullname,
                image: user.image,
              },
            })
            .from(content)
            .leftJoin(user, eq(content.userId, user.id))
            .where(eq(content.id, contentId))
            .limit(1)

          if (!contentData || contentData.length === 0) {
            return new Response(
              JSON.stringify({ error: 'Content not found' }),
              {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          const contentItem = contentData[0]

          // Check if content is premium
          if (contentItem.isPremium) {
            // If premium, check if user is the creator
            const isCreator = session?.user?.id === contentItem.userId

            if (!isCreator) {
              // Not the creator - return only excerpt
              return new Response(
                JSON.stringify({
                  id: contentItem.id,
                  title: contentItem.title,
                  excerpt: contentItem.excerpt,
                  isPremium: true,
                  userId: contentItem.userId,
                  creator: contentItem.creator,
                  createdAt: contentItem.createdAt,
                  updatedAt: contentItem.updatedAt,
                  hasAccess: false,
                  requiresSubscription: true,
                }),
                {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
                }
              )
            }
          }

          // Free content or creator accessing premium content - return full content
          return new Response(
            JSON.stringify({
              id: contentItem.id,
              title: contentItem.title,
              excerpt: contentItem.excerpt,
              content: contentItem.content,
              isPremium: contentItem.isPremium,
              userId: contentItem.userId,
              creator: contentItem.creator,
              createdAt: contentItem.createdAt,
              updatedAt: contentItem.updatedAt,
              hasAccess: true,
              requiresSubscription: false,
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        } catch (error) {
          return new Response(
            JSON.stringify({ error: 'Failed to fetch content' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }
      },
    },
  },
})
