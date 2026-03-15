import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// Validar variables de entorno críticas al arrancar el servidor
if (!process.env.NEXTAUTH_SECRET) throw new Error("NEXTAUTH_SECRET must be set");
if (!process.env.GOOGLE_CLIENT_ID) throw new Error("GOOGLE_CLIENT_ID must be set");
if (!process.env.GOOGLE_CLIENT_SECRET) throw new Error("GOOGLE_CLIENT_SECRET must be set");

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    // ── Credentials: solo para STAFF (ADMIN / EDITOR) ─────────────────────
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

        // Solo STAFF puede iniciar sesión con credenciales
        if (!user || !user.password || user.accountType !== "STAFF") {
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
          role: user.role ?? null,
          accountType: user.accountType,
        };
      },
    }),

    // ── Google OAuth: para MEMBER (usuarios de la plataforma Guvery) ───────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Al crear usuario nuevo vía Google, se asigna accountType MEMBER
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          accountType: "MEMBER" as const,
          role: null,
        };
      },
    }),
  ],

  callbacks: {
    // signIn: permite o bloquea el inicio de sesión
    async signIn({ user, account }) {
      // Para Google OAuth: si el usuario ya existe como STAFF, bloqueamos
      // para evitar que un editor acceda al dashboard via Google
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        if (existingUser && existingUser.accountType === "STAFF") {
          // STAFF no puede autenticarse por Google — debe usar email + password
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account, trigger }) {
      // Al hacer login, el objeto `user` está presente
      if (user) {
        token.id = user.id;
        token.accountType = user.accountType;
        token.role = user.role ?? null;
      }

      // Si es primer login con Google, leemos accountType desde la DB
      // porque el adapter crea el usuario y necesitamos los datos frescos
      if (account?.provider === "google" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, accountType: true, role: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.accountType = dbUser.accountType;
          token.role = dbUser.role ?? null;
        }
      }

      // Refresco de sesión (trigger === "update"): releer de DB
      if (trigger === "update" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, accountType: true, role: true },
        });
        if (dbUser) {
          token.accountType = dbUser.accountType;
          token.role = dbUser.role ?? null;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.accountType = token.accountType;
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

// Helper centralizado — evita repetir getServerSession(authOptions) en cada Server Component
export const auth = () => getServerSession(authOptions);
