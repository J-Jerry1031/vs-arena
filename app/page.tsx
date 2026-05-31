import Link from "next/link";
import {
  type Arena,
  arenas,
  getArenaBadge,
  getArenaHotComment,
  getArenaStats,
  initialComments,
  statusMeta,
} from "@/lib/arena-data";

type HomeProps = {
  searchParams?: Promise<{ category?: string }>;
};

const getArenaPulse = (arena: Arena) => {
  const stats = getArenaStats(arena, initialComments);
  const gap = Math.abs(stats.aPercent - stats.bPercent);
  const hotComment = getArenaHotComment(arena.id, initialComments);

  if (arena.status === "upcoming") return "곧 판 깔림";
  if (arena.status === "closed") return "명경기 박제";
  if (gap <= 8 && stats.commentCount >= 2) return "역전각";
  if (stats.heatScore > 600) return "댓글 터짐";
  if (hotComment && hotComment.likes > 90) return "한 방 나옴";
  if (gap >= 30) return "한쪽 개맞는중";

  return "슬슬 달아오름";
};

const getTrendCopy = (arena: Arena) => {
  const stats = getArenaStats(arena, initialComments);

  if (arena.status === "upcoming") {
    return `${arena.scheduledAt} 오픈 대기`;
  }

  if (arena.status === "closed") {
    return `최종 ${stats.aPercent}:${stats.bPercent}`;
  }

  if (stats.aPercent === stats.bPercent) {
    return "반반이라 아무 말이나 해도 불 붙음";
  }

  const leadingSide = stats.aPercent > stats.bPercent ? arena.optionA : arena.optionB;
  const trailingSide = stats.aPercent > stats.bPercent ? arena.optionB : arena.optionA;

  return `${leadingSide} 우세, ${trailingSide} 반격 대기`;
};

export default async function Home({ searchParams }: HomeProps) {
  const selectedCategory = (await searchParams)?.category ?? "전체";
  const liveArenas = arenas.filter((arena) => statusMeta[arena.status].canJoin);
  const totalSpectators = liveArenas.reduce(
    (sum, arena) => sum + arena.spectators,
    0
  );
  const categories = ["전체", ...new Set(arenas.map((arena) => arena.category))];
  const filteredArenas =
    selectedCategory === "전체"
      ? arenas
      : arenas.filter((arena) => arena.category === selectedCategory);
  const rankedArenas = [...filteredArenas].sort(
    (a, b) =>
      getArenaStats(b, initialComments).heatScore -
      getArenaStats(a, initialComments).heatScore
  );
  const allRankedArenas = [...arenas].sort(
    (a, b) =>
      getArenaStats(b, initialComments).heatScore -
      getArenaStats(a, initialComments).heatScore
  );
  const topArenas = rankedArenas
    .filter((arena) => statusMeta[arena.status].canJoin)
    .slice(0, 3);
  const fallbackTopArenas = allRankedArenas
    .filter((arena) => statusMeta[arena.status].canJoin)
    .slice(0, 3);
  const visibleTopArenas = topArenas.length > 0 ? topArenas : fallbackTopArenas;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#08090d] text-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-3 py-4 sm:px-6 sm:py-5 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300 sm:text-xs sm:tracking-[0.32em]">
              Editorial Battle Arena
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-normal text-white sm:text-6xl">
              VS ARENA
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
              지금 어디가 제일 불타는지만 보고 들어가면 됨. 입 터는 건
              상세 링에서 제대로.
            </p>
          </div>

          <div className="space-y-2 md:min-w-[420px]">
            <div className="grid grid-cols-3 gap-2 text-center">
            <div className="border border-white/10 bg-white/[0.04] px-3 py-2">
              <div className="text-base font-black text-white sm:text-lg">
                {totalSpectators.toLocaleString()}
              </div>
              <div className="text-xs text-zinc-500">실시간 관전</div>
            </div>
            <div className="border border-white/10 bg-white/[0.04] px-3 py-2">
              <div className="text-base font-black text-white sm:text-lg">
                {liveArenas.length}
              </div>
              <div className="text-xs text-zinc-500">열린 경기</div>
            </div>
            <div className="border border-white/10 bg-white/[0.04] px-3 py-2">
              <div className="text-base font-black text-amber-300 sm:text-lg">
                {initialComments.length}
              </div>
              <div className="text-xs text-zinc-500">샘플 댓글</div>
            </div>
            </div>
            <Link
              href="/admin"
              className="block border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-xs font-black text-zinc-300 transition hover:border-amber-300/60 hover:text-amber-200 md:hidden"
            >
              운영 콘솔
            </Link>
          </div>
        </header>

        <section className="border-b border-white/10 py-5">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-sm font-black text-white">
                지금 불타는 아레나 TOP 3
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                한 줄 HOT만 보고 바로 링 입장. 긴 댓글은 상세에서 펼쳐짐.
              </p>
            </div>
            <span className="w-fit border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-black text-amber-200">
              LIVE HEAT
            </span>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {visibleTopArenas.map((arena, index) => {
              const stats = getArenaStats(arena, initialComments);
              const preview = getArenaHotComment(arena.id, initialComments);
              const badge = getArenaBadge(arena, initialComments);

              return (
                <Link
                  key={arena.id}
                  href={`/arena/${arena.id}`}
                  className={`min-w-0 border p-4 text-left transition hover:-translate-y-0.5 ${
                    index === 0
                      ? "border-amber-300/50 bg-amber-300/10"
                      : "border-white/10 bg-white/[0.04] hover:border-cyan-300/40"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-cyan-300">
                      #{index + 1}
                    </span>
                    <span
                      className={`border px-2 py-1 text-xs font-black ${
                        index === 0
                          ? "border-amber-300 bg-amber-300 text-black"
                          : "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                      }`}
                    >
                      {badge}
                    </span>
                  </div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="bg-amber-300 px-2 py-1 text-xs font-black text-black">
                      {getArenaPulse(arena)}
                    </span>
                    <span className="border border-white/10 px-2 py-1 text-xs font-bold text-zinc-400">
                      {getTrendCopy(arena)}
                    </span>
                  </div>
                  <div className="text-lg font-black leading-snug text-white">
                    {arena.title}
                  </div>
                  <div className="mt-3 h-2 overflow-hidden bg-white/10">
                    <div
                      className="inline-block h-full bg-rose-400"
                      style={{ width: `${stats.aPercent}%` }}
                    />
                    <div
                      className="inline-block h-full bg-sky-400"
                      style={{ width: `${stats.bPercent}%` }}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-zinc-500">
                    <span>{stats.aPercent}%</span>
                    <span>
                      댓글 {stats.commentCount} · 점수{" "}
                      {Math.round(stats.heatScore)}
                    </span>
                    <span>{stats.bPercent}%</span>
                  </div>
                  {preview ? (
                    <p className="mt-3 line-clamp-2 border-l border-amber-300/40 pl-3 text-sm leading-relaxed text-zinc-300">
                      HOT: &ldquo;{preview.text}&rdquo;
                    </p>
                  ) : null}
                  <div className="mt-3 text-xs font-black text-amber-200">
                    링 입장하기
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid flex-1 gap-5 py-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="min-w-0 space-y-4">
            <Link
              href="/admin"
              className="hidden border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-black text-amber-200 transition hover:bg-amber-300 hover:text-black lg:block"
            >
              운영 콘솔 열기
            </Link>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible">
              {categories.map((item) => (
                <Link
                  key={item}
                  href={item === "전체" ? "/" : `/?category=${encodeURIComponent(item)}`}
                  className={`shrink-0 border px-3 py-2 text-sm font-bold transition ${
                    selectedCategory === item
                      ? "border-cyan-300 bg-cyan-300 text-black"
                      : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-cyan-300/50"
                  }`}
                >
                  {item}
                </Link>
              ))}
            </div>
          </aside>

          <div className="min-w-0 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-400">핫 랭킹</h2>
              <span className="text-xs text-zinc-600">{selectedCategory}</span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {rankedArenas.map((arena, index) => {
                const stats = getArenaStats(arena, initialComments);
                const preview = getArenaHotComment(arena.id, initialComments);
                const badge = getArenaBadge(arena, initialComments);

                return (
                  <Link
                    key={arena.id}
                    href={`/arena/${arena.id}`}
                    className="min-w-0 border border-white/10 bg-white/[0.035] p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/40"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-cyan-300">
                          #{index + 1}
                        </span>
                        <span
                          className={`border px-2 py-1 text-xs font-bold ${statusMeta[arena.status].tone}`}
                        >
                          {arena.status === "main"
                            ? "NOW"
                            : statusMeta[arena.status].label}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {Math.round(stats.heatScore)}
                      </span>
                    </div>
                    <div className="text-base font-black leading-snug text-white">
                      {arena.title}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="bg-cyan-300 px-2 py-1 text-xs font-black text-black">
                        {getArenaPulse(arena)}
                      </span>
                      <span className="text-xs font-bold text-zinc-500">
                        {getTrendCopy(arena)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="border border-amber-300/30 bg-amber-300/10 px-2 py-1 font-black text-amber-200">
                        {badge}
                      </span>
                      <span className="text-zinc-500">
                        {stats.aPercent}:{stats.bPercent} · 댓글{" "}
                        {stats.commentCount}
                      </span>
                    </div>
                    {preview ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-500">
                        HOT: {preview.text}
                      </p>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
