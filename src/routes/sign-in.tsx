import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, ArrowLeft } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

export const Route = createFileRoute('/sign-in')({
  component: SignIn,
})

function SignIn() {
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()
  const { connect, isPending, error } = useConnect({
    connector: injected(),
  })
  const { disconnect } = useDisconnect()

  const handleSignIn = async () => {
    try {
      if (!isConnected) {
        connect()
      } else {
        // TODO: Implement SIWE sign-in with better-auth
        // For now, just redirect to dashboard
        navigate({ to: '/dashboard' })
      }
    } catch (error) {
      console.error('Sign in failed:', error)
    }
  }

  const handleDisconnect = () => {
    disconnect()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/' })}
              className="p-0 h-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold">OneZap</span>
          </div>
          <CardTitle className="text-2xl mt-4">Sign In</CardTitle>
          <CardDescription>
            Connect your wallet to continue to OneZap
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected && address ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium mb-1">Wallet Connected</p>
                <p className="text-xs text-green-700 font-mono">{address}</p>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={handleSignIn}
              >
                Continue to Dashboard
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleDisconnect}
              >
                Disconnect Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={handleSignIn}
                disabled={isPending}
              >
                {isPending ? 'Connecting...' : 'Connect Wallet'}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                By connecting, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error.message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
