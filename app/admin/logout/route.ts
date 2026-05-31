import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE = "vs_arena_admin";

export async function GET() {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
