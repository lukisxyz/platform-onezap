import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Zap, ArrowLeft, Calendar, Lock, Crown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAccount, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi'
import { mantleSepoliaTestnet } from 'wagmi/chains'
import { subscribeToCreator, getCreatorOnChain, approveUSDTForSubscription, checkUSDTAllowance } from '@/lib/contracts'
import { toast } from 'sonner'
import React from 'react'

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
  hasAccess: boolean
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
  const [isSubscribing, setIsSubscribing] = React.useState(false)
  const [txHash, setTxHash] = React.useState<`0x${string}` | null>(null)
  const [isApproval, setIsApproval] = React.useState(false)

  const { data, isLoading, error, refetch } = useQuery<ContentItem>({
    queryKey: ['content', contentId],
    queryFn: async () => {
      const response = await fetch(`/api/content/${contentId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch content')
      }
      return response.json()
    },
    enabled: !!contentId,
  })

  const isCorrectNetwork = chainId === mantleSepoliaTestnet.id

  // Wait for transaction confirmation
  useWaitForTransactionReceipt({
    hash: txHash || undefined,
    onSuccess: () => {
      if (isApproval) {
        // Approval confirmed, now subscribe
        toast.success('Approval confirmed! Starting subscription...')
        setIsApproval(false)

        // Proceed with subscription if we have creator address
        if (data?.creator?.walletAddress) {
          const creatorWalletAddress = data.creator.walletAddress as `0x${string}`
          subscribeToCreator(creatorWalletAddress)
            .then((hash) => {
              setTxHash(hash)
              toast.success('Subscription transaction submitted!')
            })
            .catch((error) => {
              toast.error(`Subscription failed: ${error.message}`)
              setIsSubscribing(false)
            })
        }
      } else {
        // Subscription confirmed
        toast.success('Successfully subscribed! Refreshing content...')
        setTxHash(null)
        setIsSubscribing(false)
        refetch() // Refetch content to check access
      }
    },
    onError: (error) => {
      if (isApproval) {
        toast.error(`Approval failed: ${error.message}`)
        setIsApproval(false)
      } else {
        toast.error(`Subscription failed: ${error.message}`)
      }
      setTxHash(null)
      setIsSubscribing(false)
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
      // Check USDT allowance
      const allowance = await checkUSDTAllowance(address)
      const requiredAmount = BigInt(100 * 10 ** 6) // 100 USDT with 6 decimals

      if (allowance < requiredAmount) {
        // Need to approve USDT first
        setIsApproval(true)
        toast.info('Approving 100 USDT for subscription...')
        const approveHash = await approveUSDTForSubscription(requiredAmount)
        setTxHash(approveHash)
        toast.success('Approval transaction submitted!')
        return
      }

      // Allowance is sufficient, proceed with subscription
      const hash = await subscribeToCreator(creatorWalletAddress)
      setTxHash(hash)
      toast.success('Subscription transaction submitted! Please wait for confirmation.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to subscribe. Please try again.')
      setIsSubscribing(false)
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

  const { title, excerpt, content, isPremium, creator, hasAccess, createdAt } = data

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
              {hasAccess ? (
                // Full content access (Free content or Creator)
                <div className="prose prose-gray max-w-none">
                  {content ? (
                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                      {content}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No content available.</p>
                  )}
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
