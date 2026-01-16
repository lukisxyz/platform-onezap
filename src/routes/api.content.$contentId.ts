import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/lib/db'
import { content, user, walletAddress } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { Address } from 'viem'
import { hasAccessToCreator } from '@/lib/contracts'

export const Route = createFileRoute('/api/content/$contentId')({
  server: {
    handlers: {
      GET: async ({ request, params, context }) => {
        // Disable caching - always check from blockchain
        const noCacheHeaders = {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
        try {
          const contentId = params.contentId

          if (!contentId) {
            return new Response(
              JSON.stringify({ error: 'Content ID is required' }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...noCacheHeaders },
              }
            )
          }

          // Get wallet address from request headers (sent by wagmi client)
          const walletAddressHeader = request.headers.get('x-wallet-address') as Address | null

          // Fetch content with user information and primary wallet address
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
                walletAddress: walletAddress.address,
              },
            })
            .from(content)
            .leftJoin(user, eq(content.userId, user.id))
            .leftJoin(walletAddress, eq(user.id, walletAddress.userId))
            .where(eq(content.id, contentId))
            .limit(1)

          if (!contentData || contentData.length === 0) {
            return new Response(
              JSON.stringify({ error: 'Content not found' }),
              {
                status: 404,
                headers: { 'Content-Type': 'application/json', ...noCacheHeaders },
              }
            )
          }

          const contentItem = contentData[0]

          // Check if content is premium
          if (contentItem.isPremium) {
            // If premium, check if user is the creator (by wallet address)
            const userWalletAddress = walletAddressHeader as Address | null
            const creatorWalletAddress = contentItem.creator.walletAddress as Address | null

            const isCreator = userWalletAddress &&
              creatorWalletAddress &&
              userWalletAddress.toLowerCase() === creatorWalletAddress.toLowerCase()

            if (!isCreator) {
              // Not the creator - check if user has active subscription
              let hasAccess = false

              if (userWalletAddress && creatorWalletAddress) {
                // Validate wallet address format
                if (!creatorWalletAddress.startsWith('0x')) {
                  return new Response(
                    JSON.stringify({ error: 'Invalid creator wallet address' }),
                    {
                      status: 500,
                      headers: { 'Content-Type': 'application/json', ...noCacheHeaders },
                    }
                  )
                }

                // Check if user has premium access via subscription
                hasAccess = await hasAccessToCreator(creatorWalletAddress)
              }

              if (hasAccess) {
                // Has subscription - return full content
                return new Response(
                  JSON.stringify({
                    id: contentItem.id,
                    title: contentItem.title,
                    excerpt: contentItem.excerpt,
                    content: contentItem.content,
                    isPremium: true,
                    userId: contentItem.userId,
                    creator: contentItem.creator,
                    createdAt: contentItem.createdAt,
                    updatedAt: contentItem.updatedAt,
                    requiresSubscription: false,
                  }),
                  {
                    status: 200,
                    headers: { 'Content-Type': 'application/json', ...noCacheHeaders },
                  }
                )
              } else {
                // No subscription - return only excerpt
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
                    requiresSubscription: true,
                  }),
                  {
                    status: 200,
                    headers: { 'Content-Type': 'application/json', ...noCacheHeaders },
                  }
                )
              }
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
              requiresSubscription: false,
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json', ...noCacheHeaders },
            }
          )
        } catch (error) {
          return new Response(
            JSON.stringify({ error: 'Failed to fetch content' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...noCacheHeaders },
            }
          )
        }
      },
    },
  },
})
