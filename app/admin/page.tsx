import Link from "next/link";
import {
  arenas,
  getArenaBadge,
  getArenaStats,
  initialComments,
  statusMeta,
} from "@/lib/arena-data";

const queueItems = arenas
  .filter((arena) => arena.status === "upcoming")
  .slice(0, 5);

const liveItems = arenas
  .filter((arena) => statusMeta[arena.status].canJoin)
  .sort(
    (a, b) =>
      getArenaStats(b, initialComments).heatScore -
      getArenaStats(a, initialComments).heatScore
  )
  .slice(0, 6);

const flaggedComments = initialComments
  .filter((comment) => comment.text.length > 75 || comment.likes > 80)
  .slice(0, 5);

export default function AdminPage() {
  const reportCount = flaggedComments.length;
  const liveCount = arenas.filter((arena) => statusMeta[arena.status].canJoin).length;
  const lockedCount = arenas.length - liveCount;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#08090d] text-zinc-100">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-5 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300 sm:text-xs sm:tracking-[0.24em]"
              >
                VS ARENA Lobby
              </Link>
              <Link
                href="/admin/logout"
                className="border border-white/10 px-2 py-1 text-xs font-black text-zinc-500 transition hover:border-rose-300 hover:text-rose-200"
              >
                로그아웃
              </Link>
            </div>
            <h1 className="mt-3 text-4xl font-black text-white sm:text-6xl">
              운영 콘솔
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
              오늘 판 깔고, 과열 감지하고, 이상한 손놀림은 여기서 잡는다는
              컨셉의 MVP 콘솔.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center md:min-w-[420px]">
            <div className="border border-cyan-300/30 bg-cyan-300/10 px-3 py-3">
              <div className="text-xl font-black text-cyan-200">{liveCount}</div>
              <div className="text-xs text-zinc-500">열린 경기</div>
            </div>
            <div className="border border-amber-300/30 bg-amber-300/10 px-3 py-3">
              <div className="text-xl font-black text-amber-200">
                {reportCount}
              </div>
              <div className="text-xs text-zinc-500">검토 대기</div>
            </div>
            <div className="border border-white/10 bg-white/[0.04] px-3 py-3">
              <div className="text-xl font-black text-white">{lockedCount}</div>
              <div className="text-xs text-zinc-500">잠긴 경기</div>
            </div>
          </div>
        </header>

        <section className="grid min-w-0 gap-4 py-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
          <div className="min-w-0 space-y-4">
            <div className="border border-white/10 bg-white/[0.04] p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h2 className="text-sm font-black text-white">
                    오늘의 편성판
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    메인으로 올릴 경기, 닫을 경기, 예열할 경기를 한눈에.
                  </p>
                </div>
                <button className="w-full border border-cyan-300 bg-cyan-300 px-4 py-2 text-xs font-black text-black sm:w-auto">
                  새 주제 편성
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {liveItems.map((arena) => {
                  const stats = getArenaStats(arena, initialComments);

                  return (
                    <div
                      key={arena.id}
                      className="grid min-w-0 gap-3 border border-white/10 bg-black/25 p-4 md:grid-cols-[minmax(0,1fr)_220px]"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`border px-2 py-1 text-xs font-black ${statusMeta[arena.status].tone}`}
                          >
                            {arena.status === "main"
                              ? "메인 노출"
                              : statusMeta[arena.status].label}
                          </span>
                          <span className="border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs font-black text-amber-200">
                            {getArenaBadge(arena, initialComments)}
                          </span>
                          <span className="text-xs font-bold text-zinc-500">
                            #{arena.category}
                          </span>
                        </div>
                        <div className="mt-2 break-keep text-base font-black leading-snug text-white sm:text-lg">
                          {arena.title}
                        </div>
                        <div className="mt-2 text-xs font-bold text-zinc-500">
                          댓글 {stats.commentCount} · 관전 점수{" "}
                          {Math.round(stats.heatScore)} · 여론{" "}
                          {stats.aPercent}:{stats.bPercent}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs font-black md:min-h-16">
                        <button className="min-h-10 border border-amber-300/40 bg-amber-300/10 text-amber-200">
                          메인
                        </button>
                        <button className="min-h-10 border border-white/10 bg-white/[0.04] text-zinc-300">
                          마감
                        </button>
                        <Link
                          href={`/arena/${arena.id}`}
                          className="grid min-h-10 place-items-center border border-cyan-300/40 bg-cyan-300/10 text-cyan-200"
                        >
                          보기
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.04] p-4 sm:p-5">
              <h2 className="text-sm font-black text-white">편성 대기열</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {queueItems.map((arena) => (
                  <div
                    key={arena.id}
                    className="border border-white/10 bg-black/25 p-4"
                  >
                    <div className="text-xs font-black text-violet-200">
                      {arena.scheduledAt}
                    </div>
                    <div className="mt-2 break-keep text-base font-black leading-snug text-white">
                      {arena.title}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-black">
                      <button className="border border-cyan-300/40 px-3 py-2 text-cyan-200">
                        당겨오기
                      </button>
                      <button className="border border-white/10 px-3 py-2 text-zinc-400">
                        수정
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="min-w-0 space-y-4">
            <div className="border border-rose-300/30 bg-rose-400/10 p-4 sm:p-5">
              <h2 className="text-sm font-black text-rose-100">어뷰징 레이더</h2>
              <div className="mt-4 space-y-2 text-sm font-bold text-zinc-300">
                <div className="flex flex-wrap justify-between gap-2 border border-white/10 bg-black/25 px-3 py-3">
                  <span>10초 내 연속 댓글</span>
                  <span className="text-amber-200">차단 예정</span>
                </div>
                <div className="flex flex-wrap justify-between gap-2 border border-white/10 bg-black/25 px-3 py-3">
                  <span>동일 댓글 복붙</span>
                  <span className="text-amber-200">차단 예정</span>
                </div>
                <div className="flex flex-wrap justify-between gap-2 border border-white/10 bg-black/25 px-3 py-3">
                  <span>추천/반응 중복</span>
                  <span className="text-cyan-200">프론트 적용</span>
                </div>
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.04] p-4 sm:p-5">
              <h2 className="text-sm font-black text-white">검토 대기 댓글</h2>
              <div className="mt-4 space-y-3">
                {flaggedComments.map((comment) => {
                  const arena = arenas.find((item) => item.id === comment.arenaId);

                  return (
                    <div
                      key={comment.id}
                      className="border border-white/10 bg-black/25 p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-cyan-300">
                          {comment.nickname}
                        </span>
                        <span className="text-xs font-bold text-zinc-600">
                          추천 {comment.likes}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-300">
                        {comment.text}
                      </p>
                      <div className="mt-3 text-xs text-zinc-600">
                        {arena?.title}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-black">
                        <button className="border border-white/10 py-2 text-zinc-300">
                          숨김
                        </button>
                        <button className="border border-cyan-300/40 py-2 text-cyan-200">
                          통과
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
