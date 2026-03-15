import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin/login es pública — no proteger para evitar loop de redirección
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Sin sesión → redirigir al login
  if (!token) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // MEMBER intenta acceder al dashboard → redirigir al blog
  // Solo STAFF (ADMIN / EDITOR) puede acceder a /admin
  if (token.accountType !== "STAFF") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Solo aplicar el middleware a rutas del panel admin
export const config = {
  matcher: ["/admin/:path*"],
};
