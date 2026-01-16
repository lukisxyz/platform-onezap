import { useEffect, useState } from 'react'
import { Address } from 'viem'
import {
  watchNewSubscription,
  watchUserSubscriptions,
  watchAllSubscriptions,
  watchWithdrawalRequests,
  watchWithdrawalsProcessed,
  watchPenaltyDistributed,
  SubscribedEvent,
  WithdrawalRequestedEvent,
  WithdrawalProcessedEvent,
  PenaltyDistributedEvent,
} from '@/lib/contract-events'

/**
 * Hook to watch for new subscriptions to a specific creator
 *
 * @param creatorAddress - The creator's wallet address
 * @returns Object containing:
 *   - subscriptions: Array of recent subscriptions
 *   - isListening: Boolean indicating if the listener is active
 *   - error: Any error that occurred
 *
 * @example
 * ```tsx
 * function CreatorDashboard({ creatorAddress }: { creatorAddress: Address }) {
 *   const { subscriptions, isListening } = useCreatorSubscriptions(creatorAddress)
 *
 *   return (
 *     <div>
 *       <h2>Active Listeners: {isListening ? 'Yes' : 'No'}</h2>
 *       <h3>Recent Subscriptions ({subscriptions.length}):</h3>
 *       {subscriptions.map((sub, index) => (
 *         <div key={index}>
 *           <p>Subscriber: {sub.subscriber}</p>
 *           <p>Amount: {sub.amount}</p>
 *           <p>Subscription ID: {sub.subscriptionId.toString()}</p>
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useCreatorSubscriptions(creatorAddress: Address | undefined) {
  const [subscriptions, setSubscriptions] = useState<SubscribedEvent[]>([])
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!creatorAddress) return

    setIsListening(true)
    setError(null)

    const unwatch = watchNewSubscription(
      creatorAddress,
      (event) => {
        setSubscriptions((prev) => [event, ...prev.slice(0, 9)]) // Keep last 10
      }
    )

    return () => {
      unwatch()
      setIsListening(false)
    }
  }, [creatorAddress])

  return { subscriptions, isListening, error }
}

/**
 * Hook to watch subscriptions made by the current user
 *
 * @param subscriberAddress - The subscriber's wallet address
 * @returns Object containing subscriptions and listening status
 *
 * @example
 * ```tsx
 * function MySubscriptions({ myAddress }: { myAddress: Address }) {
 *   const { subscriptions, isListening } = useMySubscriptions(myAddress)
 *
 *   return (
 *     <div>
 *       <h2>My Subscriptions:</h2>
 *       {subscriptions.map((sub, index) => (
 *         <div key={index}>
 *           <p>Creator: {sub.creator}</p>
 *           <p>Amount: {sub.amount}</p>
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useMySubscriptions(subscriberAddress: Address | undefined) {
  const [subscriptions, setSubscriptions] = useState<SubscribedEvent[]>([])
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!subscriberAddress) return

    setIsListening(true)
    setError(null)

    const unwatch = watchUserSubscriptions(
      subscriberAddress,
      (event) => {
        setSubscriptions((prev) => [event, ...prev.slice(0, 9)])
      }
    )

    return () => {
      unwatch()
      setIsListening(false)
    }
  }, [subscriberAddress])

  return { subscriptions, isListening, error }
}

/**
 * Hook to watch all subscription activity on the platform
 *
 * @returns Object containing all recent subscriptions and listening status
 *
 * @example
 * ```tsx
 * function PlatformActivity() {
 *   const { subscriptions, isListening } = useAllSubscriptions()
 *
 *   return (
 *     <div>
 *       <h2>Platform Activity:</h2>
 *       {subscriptions.map((sub, index) => (
 *         <div key={index}>
 *           <p>Creator: {sub.creator}</p>
 *           <p>Subscriber: {sub.subscriber}</p>
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useAllSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<SubscribedEvent[]>([])
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsListening(true)
    setError(null)

    const unwatch = watchAllSubscriptions((event) => {
      setSubscriptions((prev) => [event, ...prev.slice(0, 19)]) // Keep last 20
    })

    return () => {
      unwatch()
      setIsListening(false)
    }
  }, [])

  return { subscriptions, isListening, error }
}

/**
 * Hook to watch withdrawal requests
 *
 * @returns Object containing withdrawal requests and listening status
 *
 * @example
 * ```tsx
 * function WithdrawalMonitor() {
 *   const { withdrawals, isListening } = useWithdrawalRequests()
 *
 *   return (
 *     <div>
 *       <h2>Withdrawal Requests:</h2>
 *       {withdrawals.map((wd, index) => (
 *         <div key={index}>
 *           <p>Subscription: {wd.subscriptionId.toString()}</p>
 *           <p>Penalty: {wd.penalty}</p>
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useWithdrawalRequests() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequestedEvent[]>([])
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsListening(true)
    setError(null)

    const unwatch = watchWithdrawalRequests((event) => {
      setWithdrawals((prev) => [event, ...prev.slice(0, 9)])
    })

    return () => {
      unwatch()
      setIsListening(false)
    }
  }, [])

  return { withdrawals, isListening, error }
}

/**
 * Hook to watch processed withdrawals
 *
 * @returns Object containing processed withdrawals and listening status
 *
 * @example
 * ```tsx
 * function ProcessedWithdrawals() {
 *   const { withdrawals, isListening } = useWithdrawalsProcessed()
 *
 *   return (
 *     <div>
 *       <h2>Processed Withdrawals:</h2>
 *       {withdrawals.map((wd, index) => (
 *         <div key={index}>
 *           <p>Subscription: {wd.subscriptionId.toString()}</p>
 *           <p>Amount Returned: {wd.amountReturned}</p>
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useWithdrawalsProcessed() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalProcessedEvent[]>([])
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsListening(true)
    setError(null)

    const unwatch = watchWithdrawalsProcessed((event) => {
      setWithdrawals((prev) => [event, ...prev.slice(0, 9)])
    })

    return () => {
      unwatch()
      setIsListening(false)
    }
  }, [])

  return { withdrawals, isListening, error }
}

/**
 * Hook to watch penalty distributions
 *
 * @returns Object containing penalty distributions and listening status
 *
 * @example
 * ```tsx
 * function PenaltyDistributions() {
 *   const { penalties, isListening } = usePenaltyDistributed()
 *
 *   return (
 *     <div>
 *       <h2>Penalty Distributions:</h2>
 *       {penalties.map((penalty, index) => (
 *         <div key={index}>
 *           <p>Creator: {penalty.creator}</p>
 *           <p>Amount: {penalty.amount}</p>
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function usePenaltyDistributed() {
  const [penalties, setPenalties] = useState<PenaltyDistributedEvent[]>([])
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsListening(true)
    setError(null)

    const unwatch = watchPenaltyDistributed((event) => {
      setPenalties((prev) => [event, ...prev.slice(0, 9)])
    })

    return () => {
      unwatch()
      setIsListening(false)
    }
  }, [])

  return { penalties, isListening, error }
}
