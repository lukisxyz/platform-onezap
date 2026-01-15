import { betterAuth } from "better-auth";
import { siwe } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Address, verifyMessage } from "viem";
import { generateRandomString } from "better-auth/crypto";
import { db } from "@/lib/db";
import { config as wagmiConfig } from "@/lib/wagmi";
import { getEnsAvatar, getEnsName } from "viem/actions";
import { createAuthClient } from "better-auth/client";
import { siweClient } from "better-auth/client/plugins";
import * as schema from "@/lib/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    schema: schema,
    provider: 'pg'
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: "compact"
    }
  },
  plugins: [
    siwe({
      domain: "onezap.com",
      emailDomainName: "onezap",
      anonymous: true,
      getNonce: async () => {
        return generateRandomString(32, "a-z", "A-Z", "0-9");
      },
      verifyMessage: async ({ message, signature, address }) => {
        try {
          const isValid = await verifyMessage({
            address: address as Address,
            message,
            signature: signature as Address,
          });
          return isValid;
        } catch (error) {
          return false;
        }
      },
      ensLookup: async ({ walletAddress }) => {
        try {
          const ensName = await getEnsName(wagmiConfig.getClient(), {
            address: walletAddress as Address
          });
          const ensAvatar = await getEnsAvatar(wagmiConfig.getClient(), {
            name: ensName || walletAddress,
          })
          return {
            name: ensName || walletAddress,
            avatar: ensAvatar || '',
          };
        } catch {
          return {
            name: walletAddress,
            avatar: ''
          };
        }
      },
    }),
  ],
});

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_BASE_URL!,
  plugins: [siweClient()],
});
