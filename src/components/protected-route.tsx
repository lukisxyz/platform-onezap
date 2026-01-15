import { useEffect, ReactNode, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAccount } from 'wagmi'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { isConnected } = useAccount()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated && !isConnected) {
      navigate({ to: '/sign-in' })
    }
  }, [hydrated, isConnected, navigate])

  // Show nothing during SSR and initial render to prevent hydration mismatch
  if (!hydrated || !isConnected) {
    return null
  }

  return <>{children}</>
}
