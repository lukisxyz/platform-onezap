import { createConfig, http } from 'wagmi'
import { mantleSepoliaTestnet } from 'wagmi/chains'
import { metaMask, walletConnect } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || ''

// Ensure we only use Mantle Sepolia
if (mantleSepoliaTestnet.id !== 5003) {
  throw new Error('Invalid chain configuration. Only Mantle Sepolia (chainId: 5003) is allowed');
}

export const config = createConfig({
  chains: [mantleSepoliaTestnet],
  connectors: [
    walletConnect({
      projectId,
      // Restrict WalletConnect to only Mantle Sepolia
      metadata: {
        name: 'OneZap',
        description: 'OneZap - Content Creator Platform',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://onezap.com',
        icons: ['https://onezap.com/icon.png'],
      },
      showQrModal: true,
      // Optional: Enable if you want to restrict networks
      // This requires your WalletConnect Cloud project to be configured properly
    }),
    metaMask({
      // Ensure MetaMask only connects to Mantle Sepolia
      dappMetadata: {
        name: 'OneZap',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://onezap.com',
      },
      // Only allow Mantle Sepolia
      preferAddChain: true,
    }),
  ],
  transports: {
    [mantleSepoliaTestnet.id]: http(),
  },
  // Additional configuration to ensure only Mantle Sepolia is used
  // This will make the app reject connections to other networks
}) as const
