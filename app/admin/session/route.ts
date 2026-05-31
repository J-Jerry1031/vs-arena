import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "vs_arena_admin";
const ADMIN_SESSION = "staff-session";

const getAdminCode = () => process.env.ADMIN_ACCESS_CODE ?? "vs-arena-admin";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const code = String(formData.get("code") ?? "").trim();
  const nextPath = String(formData.get("next") ?? "/admin");
  const safeNextPath = nextPath.startsWith("/admin") ? nextPath : "/admin";

  if (code !== getAdminCode()) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("error", "1");
    loginUrl.searchParams.set("next", safeNextPath);

    return NextResponse.redirect(loginUrl);
  }

  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE, ADMIN_SESSION, {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return NextResponse.redirect(new URL(safeNextPath, request.url));
}
