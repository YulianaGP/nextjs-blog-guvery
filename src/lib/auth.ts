import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Al hacer login, el objeto `user` está presente — guardamos el rol en el token
      // Los tipos extendidos en src/types/next-auth.d.ts garantizan que token.role y token.id existen
      if (user) {
        token.id = user.id;
        token.role = user.role; // user.role tipado correctamente por la extensión
      }
      return token;
    },
    async session({ session, token }) {
      // Propagamos id y role del token JWT a la sesión del cliente
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },

  secret: process.env.NEXTAUTH_SECRET,
};
