import { authClient } from '@/lib/auth.client';
import { config } from '@/lib/wagmi';
import { mantleSepoliaTestnet } from 'wagmi/chains';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

// Validate that we're configured for Mantle Sepolia
if (config.getClient().chain.id !== mantleSepoliaTestnet.id) {
  throw new Error(`Invalid chain configuration. Expected chainId: ${mantleSepoliaTestnet.id}, got: ${config.getClient().chain.id}`);
}

export interface SiweNonceResponse {
  nonce: string;
}

export interface SiweVerifyResponse {
  success: boolean;
  verified: boolean;
  data?: any;
  error?: any;
}

// Get nonce for SIWE authentication (via API)
export const useSiweNonce = (walletAddress: string | undefined) => {
  return useQuery({
    queryKey: ['siwe-nonce', walletAddress],
    queryFn: async (): Promise<SiweNonceResponse> => {
      const { data, error } = await authClient.siwe.nonce({
        walletAddress: walletAddress as Address,
        chainId: config.getClient().chain.id,
      })

      if (error) {
        throw new Error('Failed to get nonce');
      }

      return {
        nonce: data.nonce,
      };
    },
    enabled: false,
  });
};

// Verify SIWE signature (via API)
export const useSiweVerify = () => {
  return useMutation({
    mutationFn: async (params: {
      message: string;
      signature: string;
      walletAddress: Address;
    }): Promise<SiweVerifyResponse> => {
      const { data, error } = await authClient.siwe.verify({
        message: params.message,
        signature: params.signature,
        walletAddress: params.walletAddress as Address,
        chainId: config.getClient().chain.id,
      });

      if (error) {
        throw new Error(error.message || 'Verification failed');
      }

      return {
        verified: true,
        success: true,
        data
      };
    },
  });
};

export const useSiweLogout = () => {
  return useMutation({
    mutationFn: async () => {
      await authClient.signOut();
    },
  });
};
