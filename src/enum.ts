// Contract addresses for OneZap platform on Mantle Sepolia (Chain ID: 5003)
export enum ContractAddresses {
  // Token contracts
  MockUSDT = '0x7F36F9e0c204483DC0655b805a3a7AbbfA8b32D1',
  MockUSDY = '0x32a7E8d63bA5Ed81068fF634afaa909A24C0f6Fe',

  // Core contracts
  ContentCreatorRegistry = '0x834c337c430066341F9B7cdf0a939AFd8DC54d33',
  Subscription = '0x731456C84352C7319B6AAc461230816F64c806a1',
}

// Export all contract addresses as a record for easy access
export const CONTRACTS = {
  SUBSCRIPTION: ContractAddresses.Subscription,
  CONTENT_CREATOR_REGISTRY: ContractAddresses.ContentCreatorRegistry,
  MOCK_USDT: ContractAddresses.MockUSDT,
  MOCK_USDY: ContractAddresses.MockUSDY,
} as const;
