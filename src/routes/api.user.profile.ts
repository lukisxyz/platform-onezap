import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/schema'
import { authMiddleware } from '@/middleware/auth'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/user/profile')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: async ({ request, context }) => {
        try {
          // Fetch fresh user data from database
          const userData = await db
            .select({
              id: user.id,
              name: user.name,
              email: user.email,
              fullname: user.fullname,
              username: user.username,
              bio: user.bio,
            })
            .from(user)
            .where(eq(user.id, context.user.id))
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

          const profile = userData[0]

          return new Response(
            JSON.stringify({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              fullname: profile.fullname || '',
              username: profile.username || '',
              bio: profile.bio || '',
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        } catch (error) {
          return new Response(
            JSON.stringify({ error: 'Failed to fetch profile' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }
      },

      PUT: async ({ request, context }) => {
        try {
          const body = await request.json()
          const { fullname, username, bio } = body

          if (!fullname || !username) {
            return new Response(
              JSON.stringify({ error: 'Full name and username are required' }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          if (username.length < 3) {
            return new Response(
              JSON.stringify({ error: 'Username must be at least 3 characters' }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          if (bio && bio.length > 500) {
            return new Response(
              JSON.stringify({ error: 'Bio must be less than 500 characters' }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          // Check if username is already taken by another user
          const existingUser = await db
            .select()
            .from(user)
            .where(eq(user.username, username))
            .limit(1)

          if (existingUser.length > 0 && existingUser[0].id !== context.user.id) {
            return new Response(
              JSON.stringify({ error: 'Username is already taken' }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          // Update user profile
          await db
            .update(user)
            .set({
              fullname,
              username,
              bio,
              updatedAt: new Date(),
            })
            .where(eq(user.id, context.user.id))

          // Get updated user data
          const updatedUser = await db
            .select({
              id: user.id,
              name: user.name,
              email: user.email,
              fullname: user.fullname,
              username: user.username,
              bio: user.bio,
            })
            .from(user)
            .where(eq(user.id, context.user.id))
            .limit(1)

          return new Response(
            JSON.stringify({
              success: true,
              user: updatedUser[0],
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        } catch (error) {
          return new Response(
            JSON.stringify({ error: 'Failed to update profile' }),
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
