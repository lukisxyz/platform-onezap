import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/user/')({
  GET: async () => {
    try {
      // TODO: Implement user retrieval using better-auth
      // For now, return null to indicate no active user
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
