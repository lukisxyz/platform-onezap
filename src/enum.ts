// Contract addresses for OneZap platform on Mantle Sepolia (Chain ID: 5003)
export enum ContractAddresses {
  // Token contracts
  MockUSDT = '0x7F36F9e0c204483DC0655b805a3a7AbbfA8b32D1',

  // Core contracts
  ContentCreatorRegistry = '0x834c337c430066341F9B7cdf0a939AFd8DC54d33',
  Subscription = '0x9F48FE79885150794BccF4e82Ae872e6c771C4b1',
}

// Export all contract addresses as a record for easy access
export const CONTRACTS = {
  SUBSCRIPTION: ContractAddresses.Subscription,
  CONTENT_CREATOR_REGISTRY: ContractAddresses.ContentCreatorRegistry,
  MOCK_USDT: ContractAddresses.MockUSDT,
} as const;
