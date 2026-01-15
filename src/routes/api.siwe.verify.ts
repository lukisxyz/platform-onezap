import { authClient } from '@/lib/auth'
import { config } from '@/lib/wagmi'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/siwe/verify')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const body = await request.json()
        const { message, signature, walletAddress } = body

        if (!message || !signature || !walletAddress) {
          return new Response(JSON.stringify({
            error: 'message, signature, and walletAddress are required'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          })
        }

        try {
          const { data, error } = await authClient.siwe.verify({
            message,
            signature,
            walletAddress,
            chainId: config.getClient().chain.id,
          })

          if (error) {
            return new Response(JSON.stringify({
              success: false,
              verified: false,
              error: error.message || 'Verification failed'
            }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' }
            })
          }

          return new Response(JSON.stringify({
            success: true,
            verified: !!data,
            data,
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        } catch (error: any) {
          return new Response(JSON.stringify({
            success: false,
            verified: false,
            error: error.message || 'Verification failed'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          })
        }
      },
    },
  },
})
