import { useState } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import {
  useCreatorSubscriptions,
  useMySubscriptions,
  useAllSubscriptions,
  useWithdrawalRequests,
  useWithdrawalsProcessed,
} from '@/hooks/use-contract-events'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

/**
 * Example Component: Creator Dashboard
 * Shows how to listen to subscriptions for a specific creator
 *
 * @example
 * ```tsx
 * <CreatorDashboardView creatorAddress="0x..." />
 * ```
 */
export function CreatorDashboardView({ creatorAddress }: { creatorAddress: Address }) {
  const { subscriptions, isListening } = useCreatorSubscriptions(creatorAddress)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Creator Dashboard</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={isListening ? 'default' : 'secondary'}>
            {isListening ? '🟢 Live' : '⏸️ Paused'}
          </Badge>
          <span className="text-sm text-gray-500">
            {subscriptions.length} recent subscriptions
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subscriptions.length === 0 ? (
            <p className="text-gray-500">No subscriptions yet</p>
          ) : (
            subscriptions.map((sub, index) => (
              <div
                key={`${sub.subscriptionId}-${index}`}
                className="border rounded p-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">New Subscriber!</p>
                    <p className="text-sm text-gray-600">
                      Address: {sub.subscriber}
                    </p>
                    <p className="text-sm text-gray-600">
                      Amount: {sub.amount.toString()} USDT
                    </p>
                  </div>
                  <Badge>ID: {sub.subscriptionId.toString()}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Example Component: User's Subscription Activity
 * Shows subscriptions made by the current user
 *
 * @example
 * ```tsx
 * <MySubscriptionActivity />
 * ```
 */
export function MySubscriptionActivity() {
  const { address } = useAccount()
  const { subscriptions, isListening } = useMySubscriptions(address)

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Subscription Activity</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={isListening ? 'default' : 'secondary'}>
            {isListening ? '🟢 Live' : '⏸️ Paused'}
          </Badge>
          <span className="text-sm text-gray-500">
            {subscriptions.length} subscriptions made
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subscriptions.length === 0 ? (
            <p className="text-gray-500">No subscriptions yet</p>
          ) : (
            subscriptions.map((sub, index) => (
              <div
                key={`${sub.subscriptionId}-${index}`}
                className="border rounded p-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Subscribed to Creator</p>
                    <p className="text-sm text-gray-600">
                      Creator: {sub.creator}
                    </p>
                    <p className="text-sm text-gray-600">
                      Amount: {sub.amount.toString()} USDT
                    </p>
                  </div>
                  <Badge variant="outline">
                    ID: {sub.subscriptionId.toString()}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Example Component: Platform Activity Feed
 * Shows all subscription activity across the platform
 *
 * @example
 * ```tsx
 * <PlatformActivityFeed />
 * ```
 */
export function PlatformActivityFeed() {
  const { subscriptions, isListening } = useAllSubscriptions()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Activity Feed</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={isListening ? 'default' : 'secondary'}>
            {isListening ? '🟢 Live' : '⏸️ Paused'}
          </Badge>
          <span className="text-sm text-gray-500">
            {subscriptions.length} recent activities
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subscriptions.length === 0 ? (
            <p className="text-gray-500">No recent activity</p>
          ) : (
            subscriptions.map((sub, index) => (
              <div
                key={`${sub.subscriptionId}-${index}`}
                className="border-l-4 border-blue-500 pl-3 py-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">New Subscription</p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">From:</span> {sub.subscriber}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">To:</span> {sub.creator}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Amount:</span>{' '}
                      {sub.amount.toString()} USDT
                    </p>
                  </div>
                  <Badge variant="outline">
                    #{sub.subscriptionId.toString()}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Example Component: Withdrawal Monitor
 * Monitors withdrawal requests and processed withdrawals
 *
 * @example
 * ```tsx
 * <WithdrawalMonitor />
 * ```
 */
export function WithdrawalMonitor() {
  const { withdrawals, isListening: isListeningRequests } = useWithdrawalRequests()
  const {
    withdrawals: processedWithdrawals,
    isListening: isListeningProcessed,
  } = useWithdrawalsProcessed()

  const isListening = isListeningRequests && isListeningProcessed

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isListeningRequests ? 'default' : 'secondary'}>
              {isListeningRequests ? '🟢 Live' : '⏸️ Paused'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {withdrawals.length === 0 ? (
              <p className="text-gray-500">No withdrawal requests</p>
            ) : (
              withdrawals.map((wd, index) => (
                <div
                  key={`${wd.subscriptionId}-${index}`}
                  className="border rounded p-3 bg-yellow-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-yellow-800">
                        Withdrawal Requested
                      </p>
                      <p className="text-sm text-gray-600">
                        Subscription: {wd.subscriptionId.toString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Subscriber: {wd.subscriber}
                      </p>
                      <p className="text-sm text-gray-600">
                        Penalty: {wd.penalty.toString()} USDT
                      </p>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Processed Withdrawals</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isListeningProcessed ? 'default' : 'secondary'}>
              {isListeningProcessed ? '🟢 Live' : '⏸️ Paused'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {processedWithdrawals.length === 0 ? (
              <p className="text-gray-500">No processed withdrawals</p>
            ) : (
              processedWithdrawals.map((wd, index) => (
                <div
                  key={`${wd.subscriptionId}-${index}`}
                  className="border rounded p-3 bg-green-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-green-800">
                        Withdrawal Processed
                      </p>
                      <p className="text-sm text-gray-600">
                        Subscription: {wd.subscriptionId.toString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Subscriber: {wd.subscriber}
                      </p>
                      <p className="text-sm text-gray-600">
                        Amount Returned: {wd.amountReturned.toString()} USDT
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-100">
                      Completed
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Main Demo Component
 * Shows all event listeners in action
 *
 * @example
 * ```tsx
 * <SubscriptionEventsDemo />
 * ```
 */
export default function SubscriptionEventsDemo() {
  const [activeTab, setActiveTab] = useState<'creator' | 'user' | 'platform' | 'withdrawals'>('platform')
  const { address } = useAccount()

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Subscription Events Demo</h1>

      <div className="flex gap-2">
        <Button
          variant={activeTab === 'platform' ? 'default' : 'outline'}
          onClick={() => setActiveTab('platform')}
        >
          Platform Activity
        </Button>
        <Button
          variant={activeTab === 'creator' ? 'default' : 'outline'}
          onClick={() => setActiveTab('creator')}
        >
          Creator Dashboard
        </Button>
        <Button
          variant={activeTab === 'user' ? 'default' : 'outline'}
          onClick={() => setActiveTab('user')}
        >
          My Activity
        </Button>
        <Button
          variant={activeTab === 'withdrawals' ? 'default' : 'outline'}
          onClick={() => setActiveTab('withdrawals')}
        >
          Withdrawals
        </Button>
      </div>

      <div className="mt-6">
        {activeTab === 'platform' && <PlatformActivityFeed />}
        {activeTab === 'creator' && address && (
          <CreatorDashboardView creatorAddress={address} />
        )}
        {activeTab === 'user' && <MySubscriptionActivity />}
        {activeTab === 'withdrawals' && <WithdrawalMonitor />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Event Listeners</h3>
            <p className="text-sm text-gray-600">
              These components use React hooks that listen to blockchain events in real-time.
              When a subscription is created, the UI automatically updates without page refresh.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Available Events</h3>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li><code>Subscribed</code> - New subscription created</li>
              <li><code>WithdrawalRequested</code> - User requested withdrawal</li>
              <li><code>WithdrawalProcessed</code> - Withdrawal completed</li>
              <li><code>PenaltyDistributed</code> - Penalty paid to creator</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Important Notes</h3>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Event listeners are automatically cleaned up when components unmount</li>
              <li>Each listener maintains its own state and doesn't interfere with others</li>
              <li>You can watch all events or filter by specific addresses</li>
              <li>Event listeners work in real-time as transactions are confirmed</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
