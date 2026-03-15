import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

// Extiende los tipos de NextAuth para incluir id, accountType y role
// en Session, User y JWT token

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      accountType: "STAFF" | "MEMBER";
      role: "ADMIN" | "EDITOR" | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    accountType: "STAFF" | "MEMBER";
    role: "ADMIN" | "EDITOR" | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    accountType: "STAFF" | "MEMBER";
    role: "ADMIN" | "EDITOR" | null;
  }
}
