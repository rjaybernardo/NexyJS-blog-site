import { compare } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { PrismaAdapter } from "@auth/prisma-adapter";

import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";

// Google sign-in turns on once both the client ID and secret are set
export const isGoogleSignInEnabled = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

const googleProvider = Google({
  // Lets a reader who registered with a password sign in with Google using
  // the same email. Safe because Google verifies email ownership, and the
  // signIn callback rejects unverified ones.
  allowDangerousEmailAccountLinking: true,
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name || profile.email?.split("@")[0] || "NO_NAME",
      email: profile.email,
      image: profile.picture,
      role: "user",
      emailVerified: profile.email_verified ? new Date() : null,
    };
  },
});

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  adapter: PrismaAdapter(prisma),

  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },

      async authorize(credentials) {
        if (
          typeof credentials?.email !== "string" ||
          typeof credentials?.password !== "string"
        ) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user?.password) {
          return null;
        }

        if (!(await compare(credentials.password, user.password))) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
    ...(isGoogleSignInEnabled ? [googleProvider] : []),
  ],

  callbacks: {
    signIn({ account, profile }) {
      if (account?.provider === "google") {
        return profile?.email_verified === true;
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
      }

      if (trigger === "update" && session?.user?.name) {
        token.name = session.user.name;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        if (typeof token.id === "string") {
          session.user.id = token.id;
        }

        session.user.name = typeof token.name === "string" ? token.name : null;

        if (typeof token.role === "string") {
          session.user.role = token.role;
        }
      }

      return session;
    },
  },
} satisfies NextAuthConfig);
