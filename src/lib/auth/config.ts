import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db/mongoose";
import {
  loginUserWithPassword,
  loginAdmin,
  serializeUser,
  serializeAdmin,
} from "@/lib/services/auth.service";
import type { UserRole } from "@/types";

declare module "next-auth" {
  interface User {
    role: UserRole;
    profileComplete?: boolean;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      profileComplete: boolean;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    profileComplete: boolean;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    Credentials({
      id: "user-credentials",
      name: "User Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectDB();
        try {
          const user = await loginUserWithPassword(
            String(credentials.email),
            String(credentials.password)
          );
          return serializeUser(user);
        } catch {
          return null;
        }
      },
    }),
    Credentials({
      id: "admin-credentials",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectDB();
        try {
          const admin = await loginAdmin(
            String(credentials.email),
            String(credentials.password)
          );
          return serializeAdmin(admin);
        } catch {
          return null;
        }
      },
    }),
    Credentials({
      id: "otp-verified",
      name: "OTP Verified",
      credentials: {
        id: { type: "text" },
        email: { type: "text" },
        name: { type: "text" },
        role: { type: "text" },
        profileComplete: { type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.id || !credentials?.email) return null;
        return {
          id: String(credentials.id),
          email: String(credentials.email),
          name: String(credentials.name || ""),
          role: (credentials.role as UserRole) || "user",
          profileComplete: credentials.profileComplete === "true",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.profileComplete = user.profileComplete ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.profileComplete = token.profileComplete;
      }
      return session;
    },
  },
});
