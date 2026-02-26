import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect these routes
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/schools");

  if (!isProtected) return NextResponse.next();

  const accessToken = req.cookies.get("access_token")?.value;

  if (!accessToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// IMPORTANT: matcher must include /schools
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/onboarding/:path*", "/schools/:path*"],
};