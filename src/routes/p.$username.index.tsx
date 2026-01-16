import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Zap, ArrowLeft, UserMinus } from 'lucide-react'
import { useUserWithContent, UserContentItem } from '@/api/user/profile'
import { useAccount } from 'wagmi'
import { hasAccessToCreator, getUserSubscription, requestWithdrawal } from '@/lib/contracts'
import { toast } from 'sonner'

export const Route = createFileRoute('/p/$username/')({
  component: () => <UserProfilePage />,
})

function UserProfilePage() {
  const navigate = useNavigate()
  const { username } = Route.useParams()
  const { address, isConnected } = useAccount()

  // Use state to manage cursor for pagination
  const [cursor, setCursor] = React.useState<string | undefined>(undefined)
  const [allContent, setAllContent] = React.useState<UserContentItem[]>([])
  const [hasMore, setHasMore] = React.useState(true)
  const [isSubscribed, setIsSubscribed] = React.useState(false)
  const [subscriptionId, setSubscriptionId] = React.useState<bigint | null>(null)
  const [isUnsubscribing, setIsUnsubscribing] = React.useState(false)

  const { data, isLoading, error } = useUserWithContent(username!, cursor)

  // Check if user is subscribed to this creator
  React.useEffect(() => {
    const checkSubscription = async () => {
      if (!isConnected || !address || !data?.user?.walletAddress) {
        setIsSubscribed(false)
        setSubscriptionId(null)
        return
      }

      try {
        const result = await getUserSubscription(address as `0x${string}`, data.user.walletAddress as `0x${string}`)
        setIsSubscribed(result.exists)
        setSubscriptionId(result.subscriptionId || null)
      } catch (error) {
        // Silently fail - don't log to console
        setIsSubscribed(false)
        setSubscriptionId(null)
      }
    }

    checkSubscription()
  }, [isConnected, address, data?.user?.walletAddress])

  // Handle unsubscribe
  const handleUnsubscribe = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!subscriptionId) {
      toast.error('No subscription found')
      return
    }

    setIsUnsubscribing(true)
    try {
      // 0 = COMPLETE_EPOCH (after lock period), 1 = IMMEDIATE (with penalty)
      const withdrawalType = 1 // Immediate withdrawal
      const hash = await requestWithdrawal(subscriptionId, withdrawalType)

      toast.success('Withdrawal request submitted!')

      // Show info about withdrawal
      toast.info('💡 You can withdraw after the lock period (or immediately with penalty)', {
        duration: 8000,
      })

      // Update UI
      setIsSubscribed(false)
      setSubscriptionId(null)
    } catch (error: any) {
      const message = error.message || 'Failed to request withdrawal'

      if (message.includes('WithdrawalAlreadyRequested')) {
        toast.error('❌ Withdrawal already requested for this subscription')
      } else if (message.includes('NotSubscriptionOwner')) {
        toast.error('❌ You are not the owner of this subscription')
      } else if (message.includes('SubscriptionNotActive')) {
        toast.error('❌ Subscription is not active')
      } else {
        toast.error(`❌ Failed to unsubscribe: ${message}`)
      }
    } finally {
      setIsUnsubscribing(false)
    }
  }

  // Update content when data changes
  React.useEffect(() => {
    if (data) {
      if (cursor) {
        // Append new content for pagination
        setAllContent(prev => [...prev, ...data.content])
      } else {
        // Initial load
        setAllContent(data.content)
      }
      setHasMore(data.pagination.hasMore)
    }
  }, [data, cursor])

  const handleLoadMore = () => {
    if (data?.pagination.cursor && hasMore) {
      setCursor(data.pagination.cursor)
    }
  }

  if (isLoading && !cursor) {
    return (
      <div className="min-h-screen bg-white">
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
      <div className="min-h-screen bg-white">
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
                User not found. Please check the username and try again.
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const { user } = data

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
              onClick={() => navigate({ to: '/' })}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Profile Section */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-24 w-24 md:h-32 md:w-32">
                <AvatarImage src={user.image || undefined} alt={user.fullname || user.username} />
                <AvatarFallback className="text-2xl">
                  {(user.fullname || user.username || user.name)
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user.fullname || user.username || user.name}
                </h1>
                <p className="text-gray-600 mb-2">@{user.username}</p>
                {user.bio && (
                  <p className="text-gray-700 mb-4">{user.bio}</p>
                )}

                {/* Show unsubscribe button if user is subscribed to this creator */}
                {isConnected && address && data?.user?.walletAddress && address.toLowerCase() !== data.user.walletAddress.toLowerCase() && isSubscribed && (
                  <div className="mt-4">
                    <Button
                      variant="destructive"
                      onClick={handleUnsubscribe}
                      disabled={isUnsubscribing}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      {isUnsubscribing ? 'Unsubscribing...' : 'Unsubscribe'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Content by {user.username}
          </h2>

          {allContent.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  No content published yet.
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Grid View */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allContent.map((item) => (
                  <Card
                    key={item.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate({ to: `/p/${username}/${item.id}` })}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                        <Badge variant={item.isPremium ? 'default' : 'secondary'}>
                          {item.isPremium ? 'Premium' : 'Free'}
                        </Badge>
                      </div>
                    </CardHeader>
                    {item.excerpt && (
                      <CardContent>
                        <CardDescription className="line-clamp-3">
                          {item.excerpt}
                        </CardDescription>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    variant="outline"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
