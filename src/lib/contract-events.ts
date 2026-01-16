import { watchContractEvent } from '@wagmi/core'
import { Address } from 'viem'
import { config } from './wagmi'
import { Subscription as SubscriptionAbi } from '@/abis'
import { CONTRACTS } from '../enum'

/**
 * Types for event logs
 */
export interface SubscribedEvent {
  subscriptionId: bigint
  subscriber: Address
  creator: Address
  amount: bigint
}

export interface WithdrawalRequestedEvent {
  subscriptionId: bigint
  subscriber: Address
  withdrawalType: number
  penalty: bigint
}

export interface WithdrawalProcessedEvent {
  subscriptionId: bigint
  subscriber: Address
  amountReturned: bigint
}

export interface PenaltyDistributedEvent {
  creator: Address
  amount: bigint
  withdrawalType: number
}

/**
 * Watch for new subscriptions to a specific creator
 * This function sets up a real-time listener for Subscribed events
 *
 * @param creatorAddress - The creator's wallet address to watch for subscriptions
 * @param onEvent - Callback function that receives the event data
 * @returns Unwatch function to stop listening
 *
 * @example
 * ```typescript
 * // Watch for subscriptions to a specific creator
 * const unwatch = watchNewSubscription(
 *   '0xCreatorAddress...',
 *   (event) => {
 *     // Handle new subscription event
 *     console.log('New subscription:', event)
 *   }
 * )
 *
 * // To stop listening
 * unwatch()
 * ```
 */
export function watchNewSubscription(
  creatorAddress: Address,
  onEvent: (event: SubscribedEvent) => void
) {
  return watchContractEvent(config, {
    address: CONTRACTS.SUBSCRIPTION,
    abi: SubscriptionAbi,
    eventName: 'Subscribed',
    onLogs: (logs) => {
      for (const log of logs) {
        const { args } = log as unknown as {
          args: {
            subscriptionId?: bigint
            subscriber?: Address
            creator?: Address
            amount?: bigint
          }
        }

        // Only emit events for the specific creator
        if (args.creator?.toLowerCase() === creatorAddress.toLowerCase()) {
          onEvent({
            subscriptionId: args.subscriptionId!,
            subscriber: args.subscriber!,
            creator: args.creator!,
            amount: args.amount!,
          })
        }
      }
    },
  })
}

/**
 * Watch for subscriptions from a specific subscriber
 * This function sets up a real-time listener for Subscribed events filtered by subscriber
 *
 * @param subscriberAddress - The subscriber's wallet address
 * @param onEvent - Callback function that receives the event data
 * @returns Unwatch function to stop listening
 *
 * @example
 * ```typescript
 * // Watch for subscriptions made by a specific wallet
 * const unwatch = watchUserSubscriptions(
 *   '0xSubscriberAddress...',
 *   (event) => {
 *     // Handle subscription event
 *     console.log('New subscription:', event)
 *   }
 * )
 * ```
 */
export function watchUserSubscriptions(
  subscriberAddress: Address,
  onEvent: (event: SubscribedEvent) => void
) {
  return watchContractEvent(config, {
    address: CONTRACTS.SUBSCRIPTION,
    abi: SubscriptionAbi,
    eventName: 'Subscribed',
    onLogs: (logs) => {
      for (const log of logs) {
        const { args } = log as unknown as {
          args: {
            subscriptionId?: bigint
            subscriber?: Address
            creator?: Address
            amount?: bigint
          }
        }

        // Only emit events for the specific subscriber
        if (args.subscriber?.toLowerCase() === subscriberAddress.toLowerCase()) {
          onEvent({
            subscriptionId: args.subscriptionId!,
            subscriber: args.subscriber!,
            creator: args.creator!,
            amount: args.amount!,
          })
        }
      }
    },
  })
}

/**
 * Watch for all subscription events (no filter)
 * This listens to all Subscribed events on the contract
 *
 * @param onEvent - Callback function that receives the event data
 * @returns Unwatch function to stop listening
 *
 * @example
 * ```typescript
 * // Watch all subscriptions
 * const unwatch = watchAllSubscriptions((event) => {
 *   // Handle subscription event
 *   console.log('New subscription:', event)
 * })
 * ```
 */
export function watchAllSubscriptions(
  onEvent: (event: SubscribedEvent) => void
) {
  return watchContractEvent(config, {
    address: CONTRACTS.SUBSCRIPTION,
    abi: SubscriptionAbi,
    eventName: 'Subscribed',
    onLogs: (logs) => {
      for (const log of logs) {
        const { args } = log as unknown as {
          args: {
            subscriptionId?: bigint
            subscriber?: Address
            creator?: Address
            amount?: bigint
          }
        }

        onEvent({
          subscriptionId: args.subscriptionId!,
          subscriber: args.subscriber!,
          creator: args.creator!,
          amount: args.amount!,
        })
      }
    },
  })
}

/**
 * Watch for withdrawal requests on subscriptions
 *
 * @param onEvent - Callback function that receives the event data
 * @returns Unwatch function to stop listening
 *
 * @example
 * ```typescript
 * // Watch for withdrawal requests
 * const unwatch = watchWithdrawalRequests((event) => {
 *   // Handle withdrawal request event
 *   console.log('Withdrawal requested:', event)
 * })
 * ```
 */
export function watchWithdrawalRequests(
  onEvent: (event: WithdrawalRequestedEvent) => void
) {
  return watchContractEvent(config, {
    address: CONTRACTS.SUBSCRIPTION,
    abi: SubscriptionAbi,
    eventName: 'WithdrawalRequested',
    onLogs: (logs) => {
      for (const log of logs) {
        const { args } = log as unknown as {
          args: {
            subscriptionId?: bigint
            subscriber?: Address
            withdrawalType?: number
            penalty?: bigint
          }
        }

        onEvent({
          subscriptionId: args.subscriptionId!,
          subscriber: args.subscriber!,
          withdrawalType: args.withdrawalType!,
          penalty: args.penalty!,
        })
      }
    },
  })
}

/**
 * Watch for processed withdrawals
 *
 * @param onEvent - Callback function that receives the event data
 * @returns Unwatch function to stop listening
 *
 * @example
 * ```typescript
 * // Watch for processed withdrawals
 * const unwatch = watchWithdrawalsProcessed((event) => {
 *   // Handle withdrawal processed event
 *   console.log('Withdrawal processed:', event)
 * })
 * ```
 */
export function watchWithdrawalsProcessed(
  onEvent: (event: WithdrawalProcessedEvent) => void
) {
  return watchContractEvent(config, {
    address: CONTRACTS.SUBSCRIPTION,
    abi: SubscriptionAbi,
    eventName: 'WithdrawalProcessed',
    onLogs: (logs) => {
      for (const log of logs) {
        const { args } = log as unknown as {
          args: {
            subscriptionId?: bigint
            subscriber?: Address
            amountReturned?: bigint
          }
        }

        onEvent({
          subscriptionId: args.subscriptionId!,
          subscriber: args.subscriber!,
          amountReturned: args.amountReturned!,
        })
      }
    },
  })
}

/**
 * Watch for penalty distributions to creators
 *
 * @param onEvent - Callback function that receives the event data
 * @returns Unwatch function to stop listening
 *
 * @example
 * ```typescript
 * // Watch for penalty distributions
 * const unwatch = watchPenaltyDistributed((event) => {
 *   // Handle penalty distributed event
 *   console.log('Penalty distributed:', event)
 * })
 * ```
 */
export function watchPenaltyDistributed(
  onEvent: (event: PenaltyDistributedEvent) => void
) {
  return watchContractEvent(config, {
    address: CONTRACTS.SUBSCRIPTION,
    abi: SubscriptionAbi,
    eventName: 'PenaltyDistributed',
    onLogs: (logs) => {
      for (const log of logs) {
        const { args } = log as unknown as {
          args: {
            creator?: Address
            amount?: bigint
            withdrawalType?: number
          }
        }

        onEvent({
          creator: args.creator!,
          amount: args.amount!,
          withdrawalType: args.withdrawalType!,
        })
      }
    },
  })
}
