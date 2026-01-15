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
export async function hasPremiumAccess(subscriberAddress: Address, creatorAddress: Address): Promise<boolean> {
  try {
    // Get all subscription IDs for the subscriber
    const subscriptionIds = await readContract(config, {
      address: CONTRACTS.SUBSCRIPTION,
      abi: SubscriptionAbi,
      functionName: 'getActiveSubscriptions',
      args: [subscriberAddress],
    })

    // If no subscriptions, return false
    if (!subscriptionIds || subscriptionIds.length === 0) {
      return false
    }

    // Check each subscription to see if it's for this creator and still active
    for (const subscriptionId of subscriptionIds) {
      const subscriptionData = await readContract(config, {
        address: CONTRACTS.SUBSCRIPTION,
        abi: SubscriptionAbi,
        functionName: 'getSubscription',
        args: [subscriptionId],
      })

      // subscriptionData is a tuple with fields:
      // [id, subscriber, creator, amount, usdyAmount, startTime, lastYieldAccrual, status, withdrawalType, withdrawalRequestTime]
      const [, , creator, , , , , status] = subscriptionData as [
        bigint,
        Address,
        Address,
        bigint,
        bigint,
        bigint,
        bigint,
        number
      ]

      // Check if this subscription is for the creator and status is ACTIVE (0)
      // ACTIVE = 0, WITHDRAWAL_REQUESTED = 1, WITHDRAWAL_PROCESSED = 2
      if (creator.toLowerCase() === creatorAddress.toLowerCase() && status === SUBSCRIPTION_STATUS.ACTIVE) {
        return true
      }
    }

    return false
  } catch (error) {
    return false
  }
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
