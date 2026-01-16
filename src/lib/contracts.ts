import { Address } from 'viem'
import { readContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { config } from '@/lib/wagmi'
import { ContentCreatorRegistry as ContentCreatorRegistryAbi } from '@/abis'
import { Subscription as SubscriptionAbi } from '@/abis'
import { CONTRACTS } from '../enum'

// ERC20 ABI for approve function
const ERC20_ABI = [
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  }
] as const

// Helper function to register a content creator on-chain
export async function registerCreatorOnChain(
  username: string,
  walletAddress: Address
): Promise<`0x${string}`> {
  const hash = await writeContract(config, {
    address: CONTRACTS.CONTENT_CREATOR_REGISTRY,
    abi: ContentCreatorRegistryAbi,
    functionName: 'registerCreator',
    args: [username, walletAddress],
  })

  return hash
}

// Helper function to check if an address is a registered creator
export async function isCreatorOnChain(address: Address): Promise<boolean> {
  const result = await readContract(config, {
    address: CONTRACTS.CONTENT_CREATOR_REGISTRY,
    abi: ContentCreatorRegistryAbi,
    functionName: 'isCreator',
    args: [address],
  })

  return result as boolean
}

// Helper function to get creator details
export async function getCreatorOnChain(address: Address) {
  const result = await readContract(config, {
    address: CONTRACTS.CONTENT_CREATOR_REGISTRY,
    abi: ContentCreatorRegistryAbi,
    functionName: 'getCreator',
    args: [address],
  })

  // Result is a tuple: [username, wallet, totalEarnings, exists]
  const [username, wallet, totalEarnings, exists] = result as [
    string,
    Address,
    bigint,
    boolean
  ]

  return {
    username,
    wallet,
    totalEarnings,
    exists,
  }
}

// Helper function to update creator info
export async function updateCreatorOnChain(
  newUsername: string,
  newWallet: Address
): Promise<`0x${string}`> {
  const hash = await writeContract(config, {
    address: CONTRACTS.CONTENT_CREATOR_REGISTRY,
    abi: ContentCreatorRegistryAbi,
    functionName: 'updateCreator',
    args: [newUsername, newWallet],
  })

  return hash
}

// Helper function to get total creator count
export async function getCreatorCount(): Promise<bigint> {
  const result = await readContract(config, {
    address: CONTRACTS.CONTENT_CREATOR_REGISTRY,
    abi: ContentCreatorRegistryAbi,
    functionName: 'getCreatorCount',
    args: [],
  })

  return result as bigint
}

// Helper function to wait for transaction confirmation
export async function waitForTxConfirmation(hash: `0x${string}`) {
  const receipt = await waitForTransactionReceipt(config, {
    hash,
  })
  return receipt
}

// Subscription status enum values (from Solidity contract)
const SUBSCRIPTION_STATUS = {
  ACTIVE: 0,
  WITHDRAWAL_REQUESTED: 1,
  WITHDRAWAL_PROCESSED: 2,
} as const

// Helper function to check if a wallet has access to premium content via subscription
// Returns true if the wallet has an active subscription to the creator
// DEPRECATED: Use hasAccessToCreator instead
export async function hasPremiumAccess(subscriberAddress: Address, creatorAddress: Address): Promise<boolean> {
  return hasAccessToCreator(creatorAddress)
}

// Helper function to subscribe to a creator
export async function subscribeToCreator(creatorAddress: Address): Promise<`0x${string}`> {
  const hash = await writeContract(config, {
    address: CONTRACTS.SUBSCRIPTION,
    abi: SubscriptionAbi,
    functionName: 'subscribe',
    args: [creatorAddress],
  })

  return hash
}

// Helper function to approve USDT for subscription
// This must be called before subscribe() to allow the contract to spend 100 USDT
export async function approveUSDTForSubscription(amount: bigint = BigInt(100 * 10**6)): Promise<`0x${string}`> {
  const hash = await writeContract(config, {
    address: CONTRACTS.MOCK_USDT,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [CONTRACTS.SUBSCRIPTION, amount],
  })

  return hash
}

// Helper function to check USDT allowance
export async function checkUSDTAllowance(ownerAddress: Address): Promise<bigint> {
  const allowance = await readContract(config, {
    address: CONTRACTS.MOCK_USDT,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [ownerAddress, CONTRACTS.SUBSCRIPTION],
  })

  return allowance as bigint
}

// Withdrawal type enum (from Solidity contract)
const WITHDRAWAL_TYPE = {
  COMPLETE_EPOCH: 0,
  IMMEDIATE: 1,
} as const

// Helper function to check if user has access to a creator
export async function hasAccessToCreator(creatorAddress: Address): Promise<boolean> {
  const hasAccess = await readContract(config, {
    address: CONTRACTS.SUBSCRIPTION,
    abi: SubscriptionAbi,
    functionName: 'hasAccessToCreator',
    args: [creatorAddress],
  })

  return hasAccess as boolean
}

// Helper function to get user's subscription to a specific creator
export async function getUserSubscription(subscriberAddress: Address, creatorAddress: Address): Promise<{
  subscriptionId?: bigint
  status?: number
  amount?: bigint
  exists: boolean
}> {
  try {
    // First check if user has access using the more efficient function
    const hasAccess = await hasAccessToCreator(creatorAddress)
    if (!hasAccess) {
      return { exists: false }
    }

    // Get active subscription IDs
    const subscriptionIds = await readContract(config, {
      address: CONTRACTS.SUBSCRIPTION,
      abi: SubscriptionAbi,
      functionName: 'getActiveSubscriptions',
      args: [subscriberAddress],
    }) as bigint[]

    if (!subscriptionIds || subscriptionIds.length === 0) {
      return { exists: false }
    }

    // Check each subscription to find one for this creator
    for (const subscriptionId of subscriptionIds) {
      const subscriptionData = await readContract(config, {
        address: CONTRACTS.SUBSCRIPTION,
        abi: SubscriptionAbi,
        functionName: 'getSubscription',
        args: [subscriptionId],
      })

      // Handle both array and object returns
      let subAddr, subCreator, amount, status
      if (Array.isArray(subscriptionData)) {
        [, subAddr, subCreator, amount, , , , , status] = subscriptionData
      } else {
        ({ subscriber: subAddr, creator: subCreator, amount, status } = subscriptionData)
      }

      // Check if this subscription is for the creator and is ACTIVE
      if (subCreator.toLowerCase() === creatorAddress.toLowerCase() && status === SUBSCRIPTION_STATUS.ACTIVE) {
        return {
          subscriptionId,
          status,
          amount,
          exists: true,
        }
      }
    }

    return { exists: false }
  } catch (error) {
    // Silently return false on error - don't log to console
    return { exists: false }
  }
}

// Helper function to request withdrawal (unsubscribe)
export async function requestWithdrawal(subscriptionId: bigint, withdrawalType: number = 0): Promise<`0x${string}`> {
  const hash = await writeContract(config, {
    address: CONTRACTS.SUBSCRIPTION,
    abi: SubscriptionAbi,
    functionName: 'requestWithdrawal',
    args: [subscriptionId, withdrawalType],
  })

  return hash
}
