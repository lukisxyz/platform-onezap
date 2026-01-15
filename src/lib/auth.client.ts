import { createAuthClient } from "better-auth/client";
import { siweClient } from "better-auth/client/plugins";
export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_BASE_URL!,
  plugins: [siweClient()],
});
