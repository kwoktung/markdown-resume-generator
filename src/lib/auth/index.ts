import NextAuth from "next-auth";

import { D1Adapter } from "@auth/d1-adapter";
import Google from "next-auth/providers/google";

export const createAuthFactory = (env: CloudflareEnv) => {
  return NextAuth({
    secret: env.AUTH_SECRET,
    providers: [
      Google({
        clientId: env.AUTH_GOOGLE_ID,
        clientSecret: env.AUTH_GOOGLE_SECRET,
      }),
    ],
    adapter: D1Adapter(env.DB),
  });
};
