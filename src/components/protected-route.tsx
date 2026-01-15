import { useEffect, ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAccount } from 'wagmi'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { isConnected } = useAccount()

  useEffect(() => {
    if (!isConnected) {
      navigate({ to: '/sign-in' })
    }
  }, [isConnected, navigate])

  if (!isConnected) {
    return null
  }

  return <>{children}</>
}
