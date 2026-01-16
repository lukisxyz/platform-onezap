import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/lib/db'
import { user, content, walletAddress } from '@/lib/schema'
import { eq, and, or, lt, gt } from 'drizzle-orm'

export const Route = createFileRoute('/api/user/$username')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          const username = params.username
          const url = new URL(request.url)
          const cursor = url.searchParams.get('cursor')
          const limit = parseInt(url.searchParams.get('limit') || '12')

          if (!username) {
            return new Response(
              JSON.stringify({ error: 'Username is required' }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          // Fetch user by username with wallet address
          const userData = await db
            .select({
              id: user.id,
              name: user.name,
              email: user.email,
              fullname: user.fullname,
              username: user.username,
              bio: user.bio,
              image: user.image,
              walletAddress: walletAddress.address,
            })
            .from(user)
            .leftJoin(walletAddress, eq(user.id, walletAddress.userId))
            .where(eq(user.username, username))
            .limit(1)

          if (!userData || userData.length === 0) {
            return new Response(
              JSON.stringify({ error: 'User not found' }),
              {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          const userProfile = userData[0]

          // Build the query for user's content with cursor pagination
          let contentQuery = db
            .select({
              id: content.id,
              title: content.title,
              excerpt: content.excerpt,
              isPremium: content.isPremium,
              createdAt: content.createdAt,
              updatedAt: content.updatedAt,
            })
            .from(content)
            .where(eq(content.userId, userProfile.id))
            .orderBy(content.createdAt) // Order by createdAt descending for pagination

          // Apply cursor pagination
          if (cursor) {
            // Assuming cursor is the last item's ID from previous page
            contentQuery = contentQuery.where(lt(content.id, cursor))
          }

          // Add limit
          contentQuery = contentQuery.limit(limit + 1) // Fetch one extra to determine if there are more

          const contentData = await contentQuery

          const hasMore = contentData.length > limit
          const items = hasMore ? contentData.slice(0, limit) : contentData

          // Generate next cursor from the last item
          const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null

          return new Response(
            JSON.stringify({
              user: userProfile,
              content: items,
              pagination: {
                cursor: nextCursor,
                hasMore,
                limit,
              },
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        } catch (error) {
          return new Response(
            JSON.stringify({ error: 'Failed to fetch user data' }),
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
