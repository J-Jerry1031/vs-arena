import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "vs_arena_admin";

const getAdminCode = () => process.env.ADMIN_ACCESS_CODE ?? "vs-arena-admin";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const adminCookie = request.cookies.get(ADMIN_COOKIE)?.value;

  if (adminCookie === getAdminCode()) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
