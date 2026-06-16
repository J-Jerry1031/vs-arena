"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  type Arena,
  type ArenaComment,
  type Side,
  arenas,
  getArenaHotComment,
  getArenaStats,
  getCommentScore,
  getReactionTotal,
  initialComments,
  statusMeta,
} from "@/lib/arena-data";

type CategoryTab = {
  id: string;
  label: string;
  categories: string[];
};

type MyParticipation = {
  arenaId: number;
  selectedSide: Side;
  commentIds: number[];
  lastVisitedAt: string;
};

const categoryTabs: CategoryTab[] = [
  { id: "all", label: "전체", categories: [] },
  { id: "relationship", label: "연애/인간관계", categories: ["연애"] },
  { id: "money", label: "돈/현실", categories: ["돈", "선택지옥"] },
  { id: "work", label: "회사/일상", categories: ["직장", "생활"] },
  { id: "fantasy", label: "상상배틀", categories: ["상상배틀"] },
  { id: "debate", label: "철학/논쟁", categories: ["철학", "전통논쟁"] },
  { id: "ai", label: "AI/미래", categories: ["AI"] },
];

const getWarMetrics = (arena: Arena) => {
  const stats = getArenaStats(arena, initialComments);
  const gap = Math.abs(stats.aPercent - stats.bPercent);

  return {
    ...stats,
    gap,
    displayComments: stats.displayCommentCount,
    recentTenComments: stats.recentComments,
    recentHourVotes: stats.recentVotes,
  };
};

const getHotBadges = (arena: Arena) => {
  const metrics = getWarMetrics(arena);
  const reactionScore = initialComments
    .filter((comment) => comment.arenaId === arena.id)
    .reduce((sum, comment) => sum + getReactionTotal(comment), 0);
  const badges: { label: string; tone: string }[] = [];

  if (metrics.displayComments >= 45) {
    badges.push({ label: "HOT", tone: "bg-[#A53A4A] text-white" });
  }

  if (metrics.gap <= 10) {
    badges.push({ label: "박빙", tone: "bg-[#2D6A9F] text-white" });
  }

  if (reactionScore >= 45) {
    badges.push({ label: "논란", tone: "bg-[#E7B933] text-black" });
  }

  if (metrics.recentTenComments >= 9) {
    badges.push({ label: "댓글폭발", tone: "border border-[#E7B933]/45 bg-[#E7B933]/12 text-[#F0D77A]" });
  }

  if (arena.status === "main" || arena.status === "live") {
    badges.push({ label: "급상승", tone: "border border-white/10 bg-white/[0.04] text-zinc-300" });
  }

  if (metrics.heatScore >= 460) {
    badges.push({ label: "인기", tone: "bg-white text-black" });
  }

  return badges.slice(0, 4);
};

const getPopularComments = (arenaId: number, limit = 2): ArenaComment[] =>
  initialComments
    .filter((comment) => comment.arenaId === arenaId)
    .sort((a, b) => getCommentScore(b) - getCommentScore(a))
    .slice(0, limit);

const getArenaShout = (arena: Arena) => {
  const metrics = getWarMetrics(arena);

  if (metrics.aPercent === metrics.bPercent) {
    return "반반이면 제일 먼저 입 턴 사람이 판 흔듦";
  }

  const winningOption = metrics.aPercent > metrics.bPercent ? arena.optionA : arena.optionB;
  const losingOption = metrics.aPercent > metrics.bPercent ? arena.optionB : arena.optionA;

  return `${winningOption} 쪽이 밀어붙이는 중. ${losingOption} 반박 없으면 그대로 묻힘`;
};

const BattleCard = ({
  arena,
  cta,
}: {
  arena: Arena;
  cta: string;
}) => {
  const metrics = getWarMetrics(arena);
  const comments = getPopularComments(arena.id, 2);

  return (
    <Link
      href={`/arena/${arena.id}`}
      className="group block min-w-0 border border-white/10 bg-white/[0.035] p-3 transition hover:-translate-y-0.5 hover:border-[#E7B933]/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {getHotBadges(arena).slice(0, 3).map((badge) => (
            <span
              key={badge.label}
              className={`px-2 py-1 text-[10px] font-black ${badge.tone}`}
            >
              {badge.label}
            </span>
          ))}
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-[#F0D77A]">
            {metrics.displayComments}
          </div>
          <div className="text-[11px] font-black text-zinc-600">댓글</div>
        </div>
      </div>

      <h3 className="mt-3 line-clamp-2 min-h-12 break-keep text-lg font-black leading-snug text-white group-hover:text-[#F0D77A]">
        {arena.title}
      </h3>

      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center text-xs font-black">
        <span className="truncate bg-[#A53A4A]/16 px-2 py-2 text-[#F0A0AA]">
          {arena.optionA}
        </span>
        <span className="text-zinc-500">VS</span>
        <span className="truncate bg-[#2D6A9F]/16 px-2 py-2 text-[#8EC6F2]">
          {arena.optionB}
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden bg-white/10">
        <div
          className="inline-block h-full bg-[#A53A4A]"
          style={{ width: `${metrics.aPercent}%` }}
        />
        <div
          className="inline-block h-full bg-[#2D6A9F]"
          style={{ width: `${metrics.bPercent}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] font-black text-zinc-500">
        <span>{metrics.aPercent}:{metrics.bPercent}</span>
        <span>지금 {arena.spectators}명 구경중</span>
      </div>

      <div className="mt-3 space-y-1">
        {comments.map((comment) => (
          <p
            key={comment.id}
            className="line-clamp-1 border-l-2 border-white/20 pl-2 text-xs font-bold text-zinc-500"
          >
            💬 &ldquo;{comment.text}&rdquo; · 👍 {comment.likes}
          </p>
        ))}
      </div>

      <div className="mt-4 bg-[#E7B933] px-4 py-3 text-center text-sm font-black text-black transition group-hover:bg-[#F0D77A]">
        {cta}
      </div>
      <div className="mt-2 text-center text-[11px] font-black text-zinc-600">
        댓글 {metrics.displayComments} · 최근 10분 {metrics.recentTenComments}개 추가
      </div>
    </Link>
  );
};

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [participations, setParticipations] = useState<MyParticipation[]>([]);
  const activeTab =
    categoryTabs.find((tab) => tab.id === activeCategory) ?? categoryTabs[0];
  const filteredArenas = useMemo(
    () =>
      activeTab.id === "all"
        ? arenas
        : arenas.filter((arena) => activeTab.categories.includes(arena.category)),
    [activeTab]
  );
  const liveArenas = filteredArenas.filter((arena) => statusMeta[arena.status].canJoin);
  const totalSpectators = Math.min(
    900,
    Math.max(300, 300 + liveArenas.reduce((sum, arena) => sum + arena.spectators, 0) % 601)
  );
  const allRankedArenas = [...filteredArenas].sort(
    (a, b) => getWarMetrics(b).heatScore - getWarMetrics(a).heatScore
  );
  const mainArena = allRankedArenas.find((arena) => statusMeta[arena.status].canJoin) ?? allRankedArenas[0];
  const mainMetrics = getWarMetrics(mainArena);
  const mainComments = getPopularComments(mainArena.id, 3);
  const mainHotComment = getArenaHotComment(mainArena.id, initialComments);
  const closeArenas = [...filteredArenas]
    .filter((arena) => statusMeta[arena.status].canJoin && arena.id !== mainArena.id)
    .sort((a, b) => getWarMetrics(a).gap - getWarMetrics(b).gap)
    .slice(0, 5);
  const commentBoomArenas = [...filteredArenas]
    .filter((arena) => arena.id !== mainArena.id)
    .sort((a, b) => getWarMetrics(b).displayComments - getWarMetrics(a).displayComments)
    .slice(0, 5);
  const latestArenas = [...filteredArenas]
    .filter((arena) => arena.id !== mainArena.id)
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);
  const myArenas = participations
    .map((item) => {
      const arena = arenas.find((target) => target.id === item.arenaId);

      return arena ? { arena, item, metrics: getWarMetrics(arena) } : null;
    })
    .filter((item): item is { arena: Arena; item: MyParticipation; metrics: ReturnType<typeof getWarMetrics> } => Boolean(item))
    .slice(0, 3);
  const battleSections = [
    {
      title: "⚔️ 박빙 TOP5",
      description: "한 표만 들어와도 분위기 바뀌는 판",
      arenas: closeArenas,
      cta: "반박하러 입장",
    },
    {
      title: "💬 댓글 폭발 TOP5",
      description: "댓글 읽다가 시간 순삭되는 판",
      arenas: commentBoomArenas,
      cta: "댓글 전쟁 참전",
    },
    {
      title: "🆕 최신 VS",
      description: "새로 깔린 판에 먼저 끼어들기",
      arenas: latestArenas,
      cta: "이 판에 끼어들기",
    },
  ];

  useEffect(() => {
    window.setTimeout(() => {
      const saved = window.localStorage.getItem("vs_arena_participation");

      if (!saved) return;

      try {
        setParticipations(JSON.parse(saved) as MyParticipation[]);
      } catch {
        setParticipations([]);
      }
    }, 0);
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#08090d] text-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-3 py-4 sm:px-6 sm:py-5 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F0D77A] sm:text-xs sm:tracking-[0.32em]">
              Comment War Arena
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-normal text-white sm:text-6xl">
              VS ARENA
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-bold leading-relaxed text-zinc-400">
              남들 싸우는 거 보다가, 못 참겠으면 바로 한마디 박는 곳.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center md:min-w-[420px]">
            <div className="border border-white/10 bg-white/[0.04] px-3 py-2">
              <div className="text-base font-black text-white sm:text-lg">
                {totalSpectators.toLocaleString()}
              </div>
              <div className="text-xs text-zinc-500">지금 구경중</div>
            </div>
            <div className="border border-white/10 bg-white/[0.04] px-3 py-2">
              <div className="text-base font-black text-white sm:text-lg">
                {liveArenas.length}
              </div>
              <div className="text-xs text-zinc-500">열린 판</div>
            </div>
            <div className="border border-white/10 bg-white/[0.04] px-3 py-2">
              <div className="text-base font-black text-[#F0D77A] sm:text-lg">
                {mainMetrics.recentTenComments}
              </div>
              <div className="text-xs text-zinc-500">10분 댓글</div>
            </div>
          </div>
        </header>

        <section className="grid gap-2 border-b border-white/10 py-3 sm:grid-cols-3">
          {["① 편 고르기", "② 한마디 던지기", "③ 반박 받으면 재참전"].map((step) => (
            <div
              key={step}
              className="border border-white/10 bg-white/[0.035] px-3 py-2 text-center text-xs font-black text-zinc-300"
            >
              {step}
            </div>
          ))}
        </section>

        <nav className="flex gap-2 overflow-x-auto border-b border-white/10 py-3">
          {categoryTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`shrink-0 border px-4 py-2 text-xs font-black transition ${
                activeCategory === tab.id
                  ? "border-[#E7B933] bg-[#E7B933] text-black"
                  : "border-white/10 bg-white/[0.035] text-zinc-400 hover:border-white/25 hover:text-zinc-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {myArenas.length > 0 ? (
          <section className="border-b border-white/10 py-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-white">내가 참전한 판</h2>
              <span className="text-xs font-black text-zinc-600">
                다시 들어가서 반박 확인
              </span>
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              {myArenas.map(({ arena, item, metrics }) => {
                const myPercent = item.selectedSide === "A" ? metrics.aPercent : metrics.bPercent;
                const isWinning =
                  item.selectedSide === "A"
                    ? metrics.aPercent >= metrics.bPercent
                    : metrics.bPercent >= metrics.aPercent;

                return (
                  <Link
                    key={arena.id}
                    href={`/arena/${arena.id}`}
                    className="border border-white/10 bg-white/[0.035] p-3 transition hover:border-[#E7B933]/45"
                  >
                    <div className="line-clamp-1 text-sm font-black text-white">
                      {arena.title}
                    </div>
                    <div className="mt-2 text-xs font-bold text-zinc-500">
                      내 진영 {item.selectedSide} · 현재 {myPercent}%로{" "}
                      {isWinning ? "앞서는 중" : "밀리는 중"} · 반박{" "}
                      {Math.max(1, item.commentIds.length + metrics.recentTenComments % 5)}개
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="border-b border-white/10 py-4 sm:py-5">
          <Link
            href={`/arena/${mainArena.id}`}
            className="group relative block overflow-hidden border border-[#A53A4A]/45 bg-white/[0.035] p-4 text-left shadow-2xl shadow-black/30 transition hover:border-[#E7B933]/55 sm:p-5"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-[#A53A4A]" />
            <div className="flex flex-wrap items-center gap-2">
              <span className="animate-pulse bg-[#A53A4A] px-3 py-1 text-xs font-black text-white">
                오늘의 불판
              </span>
              {getHotBadges(mainArena).map((badge) => (
                <span
                  key={badge.label}
                  className={`px-3 py-1 text-xs font-black ${badge.tone}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
              <div className="min-w-0">
                <h2 className="break-keep text-4xl font-black leading-[0.98] text-white sm:text-6xl lg:text-7xl">
                  {mainArena.title}
                </h2>
                <p className="mt-4 max-w-3xl text-base font-black leading-relaxed text-[#F0D77A] sm:text-xl">
                  {getArenaShout(mainArena)}
                </p>
              </div>
              <div className="border border-[#E7B933]/45 bg-[#E7B933]/12 p-4 text-center">
                <div className="text-xs font-black text-[#F0D77A]">
                  💬 댓글 전쟁
                </div>
                <div className="mt-1 text-6xl font-black text-white">
                  {mainMetrics.displayComments.toLocaleString()}
                </div>
                <div className="mt-1 text-xs font-bold text-zinc-500">
                  최근 10분 +{mainMetrics.recentTenComments} · 1시간 투표 +{mainMetrics.recentHourVotes}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] sm:items-stretch">
              <div className="border border-[#A53A4A]/45 bg-[#A53A4A]/16 p-4">
                <div className="text-xs font-black text-[#F0A0AA]">A 진영</div>
                <div className="mt-1 break-keep text-2xl font-black text-white">
                  {mainArena.optionA}
                </div>
                <div className="mt-3 text-3xl font-black text-[#F0A0AA]">
                  {mainMetrics.aPercent}%
                </div>
              </div>
              <div className="grid place-items-center border border-white/10 bg-black/50 text-2xl font-black text-white">
                VS
              </div>
              <div className="border border-[#2D6A9F]/45 bg-[#2D6A9F]/16 p-4">
                <div className="text-xs font-black text-[#8EC6F2]">B 진영</div>
                <div className="mt-1 break-keep text-2xl font-black text-white">
                  {mainArena.optionB}
                </div>
                <div className="mt-3 text-3xl font-black text-[#8EC6F2]">
                  {mainMetrics.bPercent}%
                </div>
              </div>
            </div>

            <div className="mt-4 h-3 overflow-hidden bg-white/10">
              <div
                className="inline-block h-full bg-[#A53A4A]"
                style={{ width: `${mainMetrics.aPercent}%` }}
              />
              <div
                className="inline-block h-full bg-[#2D6A9F]"
                style={{ width: `${mainMetrics.bPercent}%` }}
              />
            </div>

            <div className="mt-5 grid gap-2">
              {(mainHotComment ? [mainHotComment, ...mainComments] : mainComments)
                .filter((comment, index, list) => list.findIndex((item) => item.id === comment.id) === index)
                .slice(0, 3)
                .map((comment) => (
                  <div
                    key={comment.id}
                    className="border-l-4 border-[#E7B933] bg-black/25 py-2 pl-4 pr-3"
                  >
                    <p className="line-clamp-1 text-sm font-bold leading-relaxed text-zinc-200 sm:text-base">
                      💬 &ldquo;{comment.text}&rdquo;
                    </p>
                    <div className="mt-1 text-xs font-black text-zinc-600">
                      👍 {comment.likes} · {comment.side === "A" ? mainArena.optionA : mainArena.optionB} 진영
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-black text-zinc-500">
                현재 {mainArena.spectators.toLocaleString()}명 구경중
              </span>
              <span className="bg-[#E7B933] px-5 py-3 text-sm font-black text-black transition group-hover:bg-[#F0D77A]">
                오늘의 불판 입장
              </span>
            </div>
          </Link>
        </section>

        <section className="grid gap-4 py-5">
          {battleSections.map((section) => (
            <section
              key={section.title}
              className="border border-white/10 bg-white/[0.025] p-3 sm:p-4"
            >
              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-black text-white">{section.title}</h2>
                  <p className="mt-1 text-xs font-bold text-zinc-600">
                    {section.description}
                  </p>
                </div>
                <span className="text-xs font-black text-[#F0D77A]">
                  TOP5
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {section.arenas.map((arena) => (
                  <BattleCard key={arena.id} arena={arena} cta={section.cta} />
                ))}
              </div>
            </section>
          ))}
        </section>
      </div>
    </main>
  );
}
