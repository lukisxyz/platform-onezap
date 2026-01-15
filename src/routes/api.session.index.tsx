import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/session/')({
  GET: async () => {
    try {
      // TODO: Implement session retrieval using better-auth
      // For now, return null to indicate no active session
      return new Response(JSON.stringify(null), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      return new Response(JSON.stringify(null), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  },
})
