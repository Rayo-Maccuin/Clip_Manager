import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("cm_access_token")?.value;
  const isLogin = pathname === "/login";

  if (!token && isLogin) return NextResponse.next();

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  let user: { role?: string } | null = null;
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Cookie: `cm_access_token=${token}`,
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok) {
      const body = (await response.json()) as { user?: { role?: string } };
      user = body.user ?? null;
    }
  } catch {
    user = null;
  }

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("cm_access_token");
    return response;
  }

  if (isLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if ((pathname === "/usuarios" || pathname.startsWith("/usuarios/")) && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/access-denied", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|brand/|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)"],
};