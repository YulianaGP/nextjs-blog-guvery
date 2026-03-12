import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
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

  return NextResponse.next();
}

// Solo aplicar el proxy a rutas del panel admin
export const config = {
  matcher: ["/admin/:path*"],
};
