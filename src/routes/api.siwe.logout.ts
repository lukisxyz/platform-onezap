import { authClient } from '@/lib/auth'

import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute('/api/siwe/logout')({
  server: {
    handlers: {
      POST: async () => {
        authClient.signOut();
        return new Response(JSON.stringify(null), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });

      },
    },
  },
})
