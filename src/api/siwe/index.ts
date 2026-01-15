import { useMutation, useQuery } from '@tanstack/react-query';

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
      const response = await fetch(`/api/siwe/nonce?walletAddress=${walletAddress}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to get nonce');
      }

      const result = await response.json();
      return {
        nonce: result.nonce,
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
      walletAddress: string;
      chainId?: number;
    }): Promise<SiweVerifyResponse> => {
      const response = await fetch('/api/siwe/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const result = await response.json();

      if (!response.ok || !result.verified) {
        throw new Error(result.error || 'Verification failed');
      }

      return result;
    },
  });
};

// Logout via SIWE
export const useSiweLogout = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/siwe/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to logout');
      }

      return response.json();
    },
  });
};
