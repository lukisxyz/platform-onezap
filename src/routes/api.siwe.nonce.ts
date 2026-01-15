import { authClient } from '@/lib/auth'
import { config } from '@/lib/wagmi'
import { createFileRoute } from '@tanstack/react-router'
import { Address } from 'viem'


export const Route = createFileRoute('/api/siwe/nonce')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url)
        const walletAddress = url.searchParams.get('walletAddress')

        const data = await authClient.siwe.nonce({
          walletAddress: walletAddress as Address,
          chainId: config.getClient().chain.id,
        })

        if (!data.data) return new Response(JSON.stringify({}), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })

        return new Response(
          JSON.stringify({
            nonce: data.data?.nonce
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      },
    },
  },
})
