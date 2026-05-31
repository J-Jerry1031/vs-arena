import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE = "vs_arena_admin";
const ADMIN_SESSION = "staff-session";

type AdminLoginPageProps = {
  searchParams?: Promise<{ error?: string; next?: string }>;
};

const getAdminCode = () => process.env.ADMIN_ACCESS_CODE ?? "vs-arena-admin";

async function loginAdmin(formData: FormData) {
  "use server";

  const code = String(formData.get("code") ?? "").trim();
  const nextPath = String(formData.get("next") ?? "/admin");
  const safeNextPath = nextPath.startsWith("/admin") ? nextPath : "/admin";

  if (code !== getAdminCode()) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(safeNextPath)}`);
  }

  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE, ADMIN_SESSION, {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect(safeNextPath);
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params = await searchParams;
  const nextPath = params?.next ?? "/admin";
  const hasError = params?.error === "1";

  return (
    <main className="grid min-h-screen place-items-center overflow-x-hidden bg-[#08090d] px-3 py-8 text-zinc-100">
      <section className="w-full max-w-md border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-cyan-950/20 sm:p-6">
        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">
          VS ARENA Staff Only
        </div>
        <h1 className="mt-3 text-4xl font-black text-white">운영자 입장</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-500">
          공개 로비에서는 안 보이는 문. 편성, 신고, 어뷰징 관리는 여기서만
          들어간다.
        </p>

        <form action={loginAdmin} className="mt-6 space-y-3">
          <input type="hidden" name="next" value={nextPath} />
          <label className="block">
            <span className="text-xs font-black text-zinc-400">운영자 코드</span>
            <input
              name="code"
              type="password"
              autoComplete="current-password"
              className="mt-2 w-full border border-white/10 bg-black/40 px-4 py-3 text-base font-bold text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-300"
              placeholder="코드 입력"
            />
          </label>

          {hasError ? (
            <div className="border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-xs font-bold text-rose-100">
              코드가 안 맞음. 운영진 전용 문은 호락호락하지 않음.
            </div>
          ) : null}

          <button className="w-full border border-cyan-300 bg-cyan-300 px-5 py-3 text-sm font-black text-black transition hover:bg-cyan-200">
            콘솔 입장
          </button>
        </form>
      </section>
    </main>
  );
}
