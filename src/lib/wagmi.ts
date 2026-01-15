import { createConfig, http } from 'wagmi'
import { mantleSepoliaTestnet } from 'wagmi/chains'
import { metaMask, walletConnect } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || ''

export const config = createConfig({
  chains: [mantleSepoliaTestnet],
  connectors: [
    walletConnect({ projectId }),
    metaMask(),
  ],
  transports: {
    [mantleSepoliaTestnet.id]: http(),
  },
})
