import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Zap, ArrowLeft, Calendar, Lock, Crown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAccount, useWaitForTransactionReceipt, useSwitchChain, useWalletClient } from 'wagmi'
import { mantleSepoliaTestnet } from 'wagmi/chains'
import { subscribeToCreator, getCreatorOnChain, approveUSDTForSubscription, checkUSDTAllowance } from '@/lib/contracts'
import { toast } from 'sonner'
import React from 'react'
import { parseUnits } from 'viem'

interface Creator {
  id: string
  username: string
  fullname: string | null
  image: string | null
  walletAddress?: string | null
}

interface ContentItem {
  id: string
  title: string
  excerpt?: string | null
  content?: string | null
  isPremium: boolean
  userId: string
  creator: Creator
  createdAt: string
  updatedAt: string
  requiresSubscription?: boolean
}

export const Route = createFileRoute('/p/$username/$contentId')({
  component: () => <ContentPage />,
})

function ContentPage() {
  const navigate = useNavigate()
  const { username, contentId } = Route.useParams()
  const { address, isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  const { data: walletClient } = useWalletClient()
  const [isSubscribing, setIsSubscribing] = React.useState(false)
  const [txHash, setTxHash] = React.useState<`0x${string}` | null>(null)
  const [isApproval, setIsApproval] = React.useState(false)
  const [approvalTimeout, setApprovalTimeout] = React.useState<NodeJS.Timeout | null>(null)

  const { data, isLoading, error, refetch } = useQuery<ContentItem>({
    queryKey: ['content', contentId, address],
    queryFn: async () => {
      const headers: Record<string, string> = {}
      if (address) {
        headers['x-wallet-address'] = address
      }
      const response = await fetch(`/api/content/${contentId}`, { headers })
      if (!response.ok) {
        throw new Error('Failed to fetch content')
      }
      return response.json()
    },
    enabled: !!contentId,
    // Always refetch when query key changes (address changes)
    staleTime: 0, // Consider data always stale
  })

  const isCorrectNetwork = chainId === mantleSepoliaTestnet.id

  // Refetch when wallet connection state changes
  React.useEffect(() => {
    if (isConnected && address) {
      refetch()
    }
  }, [isConnected, address, refetch])

  // Listen for wallet account changes (when user switches accounts in MetaMask, etc.)
  React.useEffect(() => {
    if (!walletClient) return

    const unwatch = walletClient.watchAsset
    // This ensures the component will re-render when wallet state changes
    // Combined with the isConnected/address dependency above, this will trigger refetch

    return () => {
      // Cleanup if needed
    }
  }, [walletClient])

  // Wait for transaction confirmation
  useWaitForTransactionReceipt({
    hash: txHash || undefined,
    onSuccess: (receipt) => {
      // Clear timeout on success
      if (approvalTimeout) {
        clearTimeout(approvalTimeout)
        setApprovalTimeout(null)
      }

      if (isApproval) {
        // Approval confirmed, now subscribe
        toast.success('✅ USDT Approved! Starting subscription...')
        setIsApproval(false)

        // Proceed with subscription if we have creator address
        if (data?.creator?.walletAddress) {
          const creatorWalletAddress = data.creator.walletAddress as `0x${string}`
          subscribeToCreator(creatorWalletAddress)
            .then((hash) => {
              setTxHash(hash)
              toast.success('🚀 Subscription transaction submitted!')
            })
            .catch((error) => {
              toast.error(`❌ Subscription failed: ${error.message || 'Transaction reverted - check if creator is registered'}`)
              setIsSubscribing(false)
            })
        }
      } else {
        // Subscription confirmed
        toast.success('🎉 Successfully subscribed! Refreshing content...')
        setTxHash(null)
        setIsSubscribing(false)
        refetch() // Refetch content to check access

        // Force refetch multiple times to ensure we get the latest state
        setTimeout(() => refetch(), 2000)
        setTimeout(() => refetch(), 5000)
      }
    },
    onError: (error) => {
      // Clear timeout on error
      if (approvalTimeout) {
        clearTimeout(approvalTimeout)
        setApprovalTimeout(null)
      }

      if (isApproval) {
        const message = error.message || 'Transaction failed'
        let displayMessage = '❌ Approval failed'
        if (message.includes('insufficient allowance')) {
          displayMessage = '❌ Approval failed: Insufficient allowance - please try again'
        } else if (message.includes('revert')) {
          displayMessage = '❌ Approval failed: Transaction reverted - please check wallet and try again'
        } else if (message.includes('User rejected')) {
          displayMessage = '❌ Approval rejected - please try again'
          setIsApproval(false)
          setTxHash(null)
          setIsSubscribing(false)
          toast.error(displayMessage)
          return
        } else {
          displayMessage = `❌ Approval failed: ${message}`
        }
        setIsApproval(false)
        setTxHash(null)
        setIsSubscribing(false)
        toast.error(displayMessage)
      } else {
        const message = error.message || 'Transaction failed'
        if (message.includes('CreatorNotRegistered')) {
          toast.error('❌ Subscription failed: Creator is not registered')
        } else if (message.includes('InsufficientAllowance')) {
          toast.error('❌ Subscription failed: Insufficient USDT allowance')
        } else if (message.includes('CannotSubscribeToSelf')) {
          toast.error('❌ Subscription failed: Cannot subscribe to yourself')
        } else if (message.includes('revert')) {
          toast.error('❌ Subscription failed: Transaction reverted - check wallet balance and creator registration')
        } else {
          toast.error(`❌ Subscription failed: ${message}`)
        }
        setTxHash(null)
        setIsSubscribing(false)
      }
    },
  })

  const handleSubscribe = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!isCorrectNetwork) {
      switchChain({ chainId: mantleSepoliaTestnet.id })
      toast.error(`Wrong network. Please switch to ${mantleSepoliaTestnet.name}`)
      return
    }

    if (!data?.creator?.walletAddress) {
      toast.error('Creator wallet address not available')
      return
    }

    // Use the creator's wallet address from the database
    const creatorWalletAddress = data.creator.walletAddress as `0x${string}`

    // Validate wallet address format
    if (!creatorWalletAddress || !creatorWalletAddress.startsWith('0x')) {
      toast.error('Invalid creator wallet address')
      return
    }

    // Check if user is trying to subscribe to themselves
    if (creatorWalletAddress.toLowerCase() === address.toLowerCase()) {
      toast.error('You cannot subscribe to yourself')
      return
    }

    setIsSubscribing(true)
    try {
      // Pre-flight check: Verify creator is registered on-chain
      try {
        const creatorData = await getCreatorOnChain(creatorWalletAddress)
        if (!creatorData.exists) {
          toast.error('❌ Creator is not registered on-chain. Please ask the creator to register their wallet.')
          setIsSubscribing(false)
          return
        }
      } catch (error) {
        toast.error('❌ Failed to verify creator registration. Please try again.')
        setIsSubscribing(false)
        return
      }

      // Check USDT allowance
      const allowance = await checkUSDTAllowance(address)
      const requiredAmount = BigInt(100 * 10 ** 6) // 100 USDT with 6 decimals

      // Submit approval transaction if needed
      if (allowance < requiredAmount) {
        setIsApproval(true)
        toast.info('Submitting approval transaction...')
        const approveHash = await approveUSDTForSubscription(requiredAmount)
        toast.success('✅ Approval transaction submitted!')
      }

      // Immediately submit subscription transaction
      toast.info('Submitting subscription transaction...')
      const subscriptionHash = await subscribeToCreator(creatorWalletAddress)
      setTxHash(subscriptionHash)
      setIsApproval(false)
      setIsSubscribing(false)
      toast.success('🚀 Subscription transaction submitted!')
      toast.info('💡 Click "Check Access" button below to verify your subscription status.')
    } catch (error: any) {
      const message = error.message || 'Failed to subscribe'
      if (message.includes('CreatorNotRegistered')) {
        toast.error('❌ Creator is not registered on-chain')
      } else if (message.includes('InsufficientAllowance')) {
        toast.error('❌ Insufficient USDT allowance. Please try approving again.')
      } else if (message.includes('execution reverted')) {
        toast.error('❌ Transaction reverted. Please check: 1) Creator is registered, 2) You have enough USDT balance')
      } else {
        toast.error(`❌ Failed to subscribe: ${message}`)
      }
      setIsSubscribing(false)
      setIsApproval(false)
      setTxHash(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">OneZap</span>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">OneZap</span>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/' })}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-red-600">
                Content not found. Please check the link and try again.
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const { title, excerpt, content, isPremium, creator, createdAt } = data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">OneZap</span>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate({ to: `/p/${username}` })}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Creator Info */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={creator.image || undefined} alt={creator.fullname || creator.username} />
                  <AvatarFallback className="text-xl">
                    {(creator.fullname || creator.username)
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {creator.fullname || creator.username}
                  </h2>
                  <p className="text-gray-600">@{creator.username}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <Badge variant={isPremium ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                  {isPremium ? (
                    <>
                      <Crown className="h-4 w-4 mr-1" />
                      Premium
                    </>
                  ) : (
                    'Free'
                  )}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-gray-900">{title}</CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
              {content ? (
                // Full content access
                <div className="prose prose-gray max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {content}
                  </div>
                </div>
              ) : (
                // No access - show excerpt and subscribe prompt
                <div className="space-y-6">
                  {/* Excerpt */}
                  {excerpt && (
                    <div className="text-gray-700 leading-relaxed">
                      {excerpt}
                    </div>
                  )}

                  {/* Locked content indicator */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gray-50 text-gray-500">
                        <Lock className="h-4 w-4 inline mr-1" />
                        Premium Content
                      </span>
                    </div>
                  </div>

                  {/* Subscribe CTA */}
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <div className="flex justify-center">
                          <div className="rounded-full bg-blue-100 p-3">
                            <Crown className="h-8 w-8 text-blue-600" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          Subscribe to {creator.fullname || creator.username}
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                          Get access to this exclusive premium content and support your favorite creator.
                        </p>

                        {/* Transaction Status */}
                        {txHash && (
                          <div className="bg-white rounded-lg border border-blue-200 p-4 space-y-2">
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <span className="text-sm font-medium text-gray-700">
                                Transaction submitted! Verifying on blockchain...
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 break-all">
                              TX: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                            </div>
                            <div className="flex gap-3 justify-center">
                              <a
                                href={`https://sepolia.mantlescan.info/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                              >
                                View on explorer →
                              </a>
                              <button
                                onClick={() => {
                                  setTxHash(null)
                                  setIsApproval(false)
                                  setIsSubscribing(false)
                                  toast.info('Transaction cancelled')
                                }}
                                className="text-xs text-gray-600 hover:text-gray-800 underline"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="pt-2">
                          <Button
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8"
                            onClick={handleSubscribe}
                            disabled={isSubscribing}
                          >
                            <Crown className="h-5 w-5 mr-2" />
                            {isSubscribing
                              ? (isApproval ? 'Approving USDT...' : 'Subscribing...')
                              : 'Subscribe to Read'}
                          </Button>
                          {!txHash && (
                            <p className="text-xs text-gray-500 mt-2">
                              Subscription cost: 100 USDT (one-time)
                            </p>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => {
                              toast.info('Refreshing content...')
                              refetch()
                            }}
                          >
                            Refresh Content Access
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>


          {/* Info Section */}
          <Card className="mt-6 bg-gray-50 border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-100 p-2 mt-1">
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Secure Subscription</h4>
                  <p className="text-sm text-gray-600">
                    Subscribe securely using blockchain technology. You'll get:
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
                    <li>Instant access to premium content after confirmation</li>
                    <li>Transparent transaction history on the blockchain</li>
                    <li>No recurring fees - one-time payment</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
