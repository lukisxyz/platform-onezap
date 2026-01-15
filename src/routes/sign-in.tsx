import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, ArrowLeft } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useAccount, useConnect, useDisconnect, useConnectors, type Connector, useSignMessage } from 'wagmi'
import { useSiweNonce, useSiweVerify } from '@/api/siwe'
import { config } from '@/lib/wagmi'
import { toast } from 'sonner'
import { createSiweMessage } from 'viem/siwe'
import * as React from 'react'

export const Route = createFileRoute('/sign-in')({
  component: SignIn,
})

function SignIn() {
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  const connectors = useConnectors()
  const nonceQuery = useSiweNonce(address)
  const verifyMutation = useSiweVerify()

  const [isAuthenticating, setIsAuthenticating] = React.useState(false)
  const [hydrated, setHydrated] = React.useState(false)

  // Prevent hydration mismatch by only rendering wallet UI after client mount
  React.useEffect(() => {
    setHydrated(true)
  }, [])

  const handleConnect = async (connector: Connector) => {
    try {
      connect({ connector })
    } catch (error) {
      toast.error('Failed to connect wallet')
    }
  }

  const handleDisconnect = () => {
    disconnect()
  }

  const handleSignIn = async () => {
    if (!address) return

    try {
      setIsAuthenticating(true)

      // Step 1: Get nonce from server
      const nonceResponse = await nonceQuery.refetch();

      // Step 2: Create SIWE message with ToS agreement
      const uri = window.location.origin
      const chainId = config.getClient().chain.id

      const message = createSiweMessage({
        address,
        chainId,
        domain: window.location.hostname,
        nonce: nonceResponse.data?.nonce || '',
        uri,
        version: '1',
        statement: 'By signing this message, you agree to the Terms of Service and Privacy Policy of OneZap platform.',
        issuedAt: new Date().toISOString(),
      })

      // Step 3: Sign the message with wallet
      const signature = await signMessageAsync({ message })

      // Step 4: Verify signature via API
      const result = await verifyMutation.mutateAsync({
        message,
        signature,
        walletAddress: address,
      })

      if (result.verified) {
        toast.success('Successfully signed in!')
        navigate({ to: '/dashboard' })
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in. Please try again.')
    } finally {
      setIsAuthenticating(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
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
            <Zap className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">OneZap</span>
          </div>
          <CardTitle className="text-2xl mt-4">Sign In</CardTitle>
          <CardDescription>
            Connect your wallet to continue to OneZap
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hydrated ? (
            // Show loading during SSR and initial client render to prevent hydration mismatch
            <div className="space-y-3">
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded mb-3"></div>
                <div className="h-10 bg-gray-200 rounded mb-3"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : isConnected && address ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium mb-1">Wallet Connected</p>
                <p className="text-xs text-green-700 font-mono">{address}</p>
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleSignIn}
                disabled={isAuthenticating || verifyMutation.isPending}
              >
                {isAuthenticating || verifyMutation.isPending
                  ? 'Authenticating...'
                  : 'Sign In with Ethereum'}
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
            <div className="space-y-3">
              <p className="text-sm text-gray-600 font-medium">Select a wallet:</p>
              {connectors.map((connector) => (
                <WalletOption key={connector.uid} connector={connector} onClick={handleConnect} />
              ))}
              <p className="text-xs text-gray-500 text-center pt-2">
                By connecting, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function WalletOption({
  connector,
  onClick,
}: {
  connector: Connector
  onClick: (connector: Connector) => void
}) {
  const [ready, setReady] = React.useState(false)
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (hydrated) {
      ; (async () => {
        const provider = await connector.getProvider()
        setReady(!!provider)
      })()
    }
  }, [connector, hydrated])

  return (
    <Button
      variant="outline"
      className="w-full justify-start"
      disabled={!ready || !hydrated}
      onClick={() => onClick(connector)}
    >
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-blue-600 rounded" />
        <span className="font-medium">{connector.name}</span>
      </div>
    </Button>
  )
}
