import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import { type JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "jsmith@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("--- AUTHORIZE FUNCTION TRIGGERED ---");
        console.log("Credentials received:", credentials);

        if (!credentials?.email || !credentials.password) {
          console.log("Missing email or password.");
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        console.log("User found in DB:", user);

        if (!user || !user.password) {
          console.log("User not found or user has no password.");
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        console.log("Password comparison result (isValid):", isValid);

        if (isValid) {
          console.log("Login successful, returning user.");
          return user;
        }

        console.log("Invalid password, returning null.");
        return null;
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    jwt: ({ token, user }) => {
      console.log("--- JWT CALLBACK ---");
      console.log("Token received:", token);
      console.log("User object received:", user);
      if (user) {
        token.sub = user.id;
        token.role = (user as any).role;
      }
      console.log("Token being returned:", token);
      return token;
    },
    session({ session, token }) {
      console.log("--- SESSION CALLBACK ---");
      console.log("Session object received:", session);
      console.log("Token received:", token);
      // The `sub` property is the user's ID
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      // The `role` property was added in the jwt callback
      if (token.role && session.user) {
        session.user.role = token.role;
      }
      console.log("Session being returned:", session);
      return session;
    },
  },
} satisfies NextAuthConfig;
