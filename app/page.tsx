"use client";

import Link from "next/link";
import { useState } from "react";
import {
  type Arena,
  type ArenaComment,
  arenas,
  getArenaHotComment,
  getArenaStats,
  getCommentScore,
  getReactionTotal,
  initialComments,
  statusMeta,
} from "@/lib/arena-data";

const getWarMetrics = (arena: Arena) => {
  const stats = getArenaStats(arena, initialComments);
  const gap = Math.abs(stats.aPercent - stats.bPercent);
  const amplifiedComments = stats.commentCount * 76 + Math.round(arena.heat * 1.7);
  const recentTenComments = Math.max(8, Math.round(arena.heat / 7 + stats.commentCount * 3));
  const recentHourVotes = Math.max(64, Math.round(arena.spectators / 48 + arena.heat * 2));

  return {
    ...stats,
    gap,
    displayComments: amplifiedComments,
    recentTenComments,
    recentHourVotes,
  };
};

const getHotBadges = (arena: Arena) => {
  const metrics = getWarMetrics(arena);
  const reactionScore = initialComments
    .filter((comment) => comment.arenaId === arena.id)
    .reduce((sum, comment) => sum + getReactionTotal(comment), 0);
  const badges: { label: string; tone: string }[] = [];

  if (metrics.displayComments >= 180) {
    badges.push({ label: "🔥 HOT", tone: "bg-rose-400 text-black" });
  }

  if (metrics.gap <= 10) {
    badges.push({ label: "⚔️ 박빙", tone: "bg-cyan-300 text-black" });
  }

  if (reactionScore >= 45) {
    badges.push({ label: "🧨 논란", tone: "bg-amber-300 text-black" });
  }

  if (metrics.recentTenComments >= 18) {
    badges.push({ label: "💬 댓글폭발", tone: "bg-lime-300 text-black" });
  }

  if (arena.status === "main" || arena.status === "live") {
    badges.push({ label: "🚀 급상승", tone: "bg-violet-300 text-black" });
  }

  if (metrics.heatScore >= 650) {
    badges.push({ label: "👑 인기", tone: "bg-white text-black" });
  }

  return badges.slice(0, 4);
};

const getPopularComments = (arenaId: number, limit = 2): ArenaComment[] =>
  initialComments
    .filter((comment) => comment.arenaId === arenaId)
    .sort((a, b) => getCommentScore(b) - getCommentScore(a))
    .slice(0, limit);

const getArenaPulse = (arena: Arena) => {
  const metrics = getWarMetrics(arena);
  const hotComment = getArenaHotComment(arena.id, initialComments);

  if (arena.status === "upcoming") return "곧 판 깔림";
  if (arena.status === "closed") return "명경기 박제";
  if (metrics.gap <= 8 && metrics.displayComments >= 180) return "역전각";
  if (metrics.heatScore > 600) return "댓글 터짐";
  if (hotComment && hotComment.likes > 90) return "한 방 나옴";
  if (metrics.gap >= 30) return "한쪽 개맞는중";

  return "슬슬 달아오름";
};

const getTrendCopy = (arena: Arena) => {
  const metrics = getWarMetrics(arena);

  if (arena.status === "upcoming") {
    return `${arena.scheduledAt} 오픈 대기`;
  }

  if (arena.status === "closed") {
    return `최종 ${metrics.aPercent}:${metrics.bPercent}`;
  }

  if (metrics.aPercent === metrics.bPercent) {
    return "반반이라 아무 말이나 해도 불 붙음";
  }

  const leadingSide = metrics.aPercent > metrics.bPercent ? arena.optionA : arena.optionB;
  const trailingSide = metrics.aPercent > metrics.bPercent ? arena.optionB : arena.optionA;

  return `${leadingSide} 우세, ${trailingSide} 반격 대기`;
};

const getArenaShout = (arena: Arena) => {
  const metrics = getWarMetrics(arena);

  if (metrics.aPercent === metrics.bPercent) {
    return "반반이면 제일 먼저 입 턴 사람이 판 흔듦";
  }

  const winningOption = metrics.aPercent > metrics.bPercent ? arena.optionA : arena.optionB;
  const losingOption = metrics.aPercent > metrics.bPercent ? arena.optionB : arena.optionA;

  return `${winningOption} 쪽이 밀어붙이는 중. ${losingOption} 반박 없으면 그대로 묻힘`;
};

const getVoteGap = (arena: Arena) => {
  return getWarMetrics(arena).gap;
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
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
    (a, b) => getWarMetrics(b).heatScore - getWarMetrics(a).heatScore
  );
  const allRankedArenas = [...arenas].sort(
    (a, b) => getWarMetrics(b).heatScore - getWarMetrics(a).heatScore
  );
  const topArenas = rankedArenas
    .filter((arena) => statusMeta[arena.status].canJoin)
    .slice(0, 3);
  const fallbackTopArenas = allRankedArenas
    .filter((arena) => statusMeta[arena.status].canJoin)
    .slice(0, 3);
  const visibleTopArenas = topArenas.length > 0 ? topArenas : fallbackTopArenas;
  const mainArena = visibleTopArenas[0] ?? allRankedArenas[0];
  const mainStats = getWarMetrics(mainArena);
  const mainPreviews = getPopularComments(mainArena.id, 3);
  const challengerArenas = visibleTopArenas.slice(1, 3);
  const visibleRankedArenas = rankedArenas.slice(0, 36);
  const hiddenArenaCount = Math.max(0, rankedArenas.length - visibleRankedArenas.length);
  const liveFeed = allRankedArenas.slice(0, 6).map((arena) => ({
    arena,
    comment: getArenaHotComment(arena.id, initialComments),
  }));
  const categoryHeat = categories.slice(1).map((category) => {
    const categoryArenas = arenas.filter((arena) => arena.category === category);
    const hottest = [...categoryArenas].sort(
      (a, b) => getWarMetrics(b).heatScore - getWarMetrics(a).heatScore
    )[0];
    const heat = categoryArenas.reduce(
      (sum, arena) => sum + getWarMetrics(arena).heatScore,
      0
    );

    return { category, count: categoryArenas.length, heat, hottest };
  }).sort((a, b) => b.heat - a.heat);
  const replyQueue = allRankedArenas
    .filter((arena) => statusMeta[arena.status].canJoin)
    .slice(3, 9);
  const closeArenas = [...arenas]
    .filter((arena) => statusMeta[arena.status].canJoin)
    .sort((a, b) => getVoteGap(a) - getVoteGap(b))
    .slice(0, 4);
  const commentHeavyArenas = [...arenas]
    .sort(
      (a, b) => getWarMetrics(b).displayComments - getWarMetrics(a).displayComments
    )
    .slice(0, 4);
  const latestArenas = [...arenas]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 4);
  const battleSections = [
    {
      title: "오늘의 뜨거운 VS",
      label: "지금 불타는 VS",
      tone: "border-rose-300/30 bg-rose-400/10 text-rose-100",
      arenas: allRankedArenas.slice(0, 4),
    },
    {
      title: "박빙 승부",
      label: "한 표 차이 감성",
      tone: "border-cyan-300/30 bg-cyan-400/10 text-cyan-100",
      arenas: closeArenas,
    },
    {
      title: "댓글 많은 VS",
      label: "댓글 전쟁",
      tone: "border-amber-300/30 bg-amber-300/10 text-amber-100",
      arenas: commentHeavyArenas,
    },
    {
      title: "최신 VS",
      label: "새 판 오픈",
      tone: "border-violet-300/30 bg-violet-400/10 text-violet-100",
      arenas: latestArenas,
    },
  ];
  const keywordChips = [
    "논파각",
    "반박 대기",
    "밈폭발",
    "역전각",
    "전통논쟁",
    "상상매치",
    "돈 얘기",
    "연애탐정",
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#08090d] text-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-3 py-4 sm:px-6 sm:py-5 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300 sm:text-xs sm:tracking-[0.32em]">
              Live Debate Riot
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-normal text-white sm:text-6xl">
              VS ARENA
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-bold leading-relaxed text-zinc-400">
              말 되면 논리, 안 되면 드립. 지금 안 끼면 구경꾼으로 끝남.
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
          </div>
        </header>

        <section className="grid gap-2 border-b border-white/10 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex min-w-0 gap-2 overflow-hidden">
            {keywordChips.map((keyword) => (
              <span
                key={keyword}
                className="shrink-0 border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-black text-zinc-300"
              >
                {keyword}
              </span>
            ))}
          </div>
          <div className="border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-xs font-black text-rose-100">
            지금 조용하면 지는 판
          </div>
        </section>

        <section className="border-b border-white/10 py-4 sm:py-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            <Link
              href={`/arena/${mainArena.id}`}
              className="group relative min-h-[420px] overflow-hidden border border-rose-300/50 bg-white/[0.035] p-4 text-left shadow-2xl shadow-rose-950/25 transition hover:border-rose-200 sm:p-5"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-rose-400" />
              <div className="flex flex-wrap items-center gap-2">
                <span className="animate-pulse bg-rose-400 px-3 py-1 text-xs font-black text-black">
                  🔥 지금 가장 불타는 VS
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

              <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
                <h2 className="break-keep text-4xl font-black leading-[0.98] text-white sm:text-6xl lg:text-7xl">
                  {mainArena.title}
                </h2>
                <div className="border border-amber-300/40 bg-amber-300/10 p-4 text-center">
                  <div className="text-xs font-black text-amber-200">
                    💬 지금 댓글
                  </div>
                  <div className="mt-1 text-5xl font-black text-white">
                    {mainStats.displayComments.toLocaleString()}
                  </div>
                  <div className="mt-1 text-xs font-bold text-zinc-500">
                    최근 10분 +{mainStats.recentTenComments}
                  </div>
                </div>
              </div>

              <h3 className="sr-only">
                {mainArena.title}
              </h3>

              <p className="mt-4 max-w-3xl text-base font-black leading-relaxed text-amber-100 sm:text-xl">
                {getArenaShout(mainArena)}
              </p>

              <div className="mt-6 grid gap-2 sm:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] sm:items-stretch">
                <div className="border border-rose-300/30 bg-rose-400/10 p-4">
                  <div className="text-xs font-black text-rose-200">A 진영</div>
                  <div className="mt-1 break-keep text-2xl font-black text-white">
                    {mainArena.optionA}
                  </div>
                  <div className="mt-3 text-3xl font-black text-rose-200">
                    {mainStats.aPercent}%
                  </div>
                </div>
                <div className="grid place-items-center border border-white/10 bg-black/50 text-2xl font-black text-white">
                  VS
                </div>
                <div className="border border-sky-300/30 bg-sky-400/10 p-4">
                  <div className="text-xs font-black text-sky-200">B 진영</div>
                  <div className="mt-1 break-keep text-2xl font-black text-white">
                    {mainArena.optionB}
                  </div>
                  <div className="mt-3 text-3xl font-black text-sky-200">
                    {mainStats.bPercent}%
                  </div>
                </div>
              </div>

              <div className="mt-4 h-3 overflow-hidden bg-white/10">
                <div
                  className="inline-block h-full bg-rose-400"
                  style={{ width: `${mainStats.aPercent}%` }}
                />
                <div
                  className="inline-block h-full bg-sky-400"
                  style={{ width: `${mainStats.bPercent}%` }}
                />
              </div>

              <div className="mt-5 grid gap-2">
                {mainPreviews.map((comment) => (
                  <div
                    key={comment.id}
                    className="border-l-4 border-amber-300 bg-black/25 py-2 pl-4 pr-3"
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
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-black text-zinc-300">
                  <span className="border border-white/10 bg-black/25 px-3 py-2">
                    현재 {mainArena.spectators.toLocaleString()}명 구경중
                  </span>
                  <span className="border border-white/10 bg-black/25 px-3 py-2">
                    최근 1시간 투표 {mainStats.recentHourVotes}
                  </span>
                  <span className="border border-white/10 bg-black/25 px-3 py-2">
                    {mainStats.aPercent}:{mainStats.bPercent} 전황
                  </span>
                </div>
                <span className="bg-cyan-300 px-5 py-3 text-sm font-black text-black transition group-hover:bg-cyan-200">
                  댓글판 보러가기
                </span>
              </div>
            </Link>

            <div className="grid gap-3">
              <section className="border border-white/10 bg-black/30 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-black text-white">실시간 판정</h2>
                  <span className="text-xs font-black text-rose-300">LIVE</span>
                </div>
                <div className="space-y-2">
                  {liveFeed.map(({ arena, comment }, index) => (
                    <Link
                      key={arena.id}
                      href={`/arena/${arena.id}`}
                      className="block border border-white/10 bg-white/[0.03] p-3 transition hover:border-cyan-300/40"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-cyan-300">
                          #{index + 1} {getArenaPulse(arena)}
                        </span>
                        <span className="text-xs font-black text-amber-200">
                          💬 {getWarMetrics(arena).displayComments}
                        </span>
                      </div>
                      <div className="mt-1 line-clamp-1 text-sm font-black text-zinc-100">
                        {arena.title}
                      </div>
                      {comment ? (
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                          &ldquo;{comment.text}&rdquo;
                        </p>
                      ) : null}
                    </Link>
                  ))}
                </div>
              </section>

              <section className="border border-cyan-300/20 bg-cyan-300/[0.04] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-black text-cyan-100">
                    카테고리 화력
                  </h2>
                  <span className="text-xs font-black text-zinc-500">
                    {arenas.length}개 판
                  </span>
                </div>
                <div className="grid gap-2">
                  {categoryHeat.slice(0, 5).map(({ category, count, heat, hottest }) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`border p-3 text-left transition hover:border-cyan-300/60 ${
                        selectedCategory === category
                          ? "border-cyan-300 bg-cyan-300 text-black"
                          : "border-white/10 bg-black/25 text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-black">{category}</span>
                        <span className="text-xs font-black">
                          {Math.round(heat).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1 line-clamp-1 text-xs opacity-70">
                        {count}개 · {hottest.title}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {challengerArenas.map((arena) => {
                  const metrics = getWarMetrics(arena);

                  return (
                    <Link
                      key={arena.id}
                      href={`/arena/${arena.id}`}
                      className="border border-white/10 bg-white/[0.04] p-4 transition hover:border-amber-300/40"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="bg-amber-300 px-2 py-1 text-xs font-black text-black">
                          ⚔️ 추격전
                        </span>
                        <span className="text-xs font-bold text-zinc-500">
                          {metrics.aPercent}:{metrics.bPercent}
                        </span>
                      </div>
                      <div className="mt-3 text-4xl font-black text-amber-100">
                        💬 {metrics.displayComments}
                      </div>
                      <div className="mt-1 text-xs font-black text-zinc-600">
                        최근 10분 댓글 +{metrics.recentTenComments}
                      </div>
                      <div className="mt-3 line-clamp-2 text-lg font-black leading-snug text-white">
                        {arena.title}
                      </div>
                      <div className="mt-3 text-xs font-black text-amber-200">
                        댓글판 입장
                      </div>
                    </Link>
                  );
                })}
              </section>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 py-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-white">
                지금 눌러야 하는 판
              </h2>
              <p className="mt-1 text-xs font-bold text-zinc-600">
                민심, 댓글, 박빙, 신규판을 한 번에 훑고 바로 참전.
              </p>
            </div>
            <span className="border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs font-black text-amber-100">
              들어오자마자 내 편 고르기
            </span>
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            {battleSections.map((section) => (
              <section
                key={section.title}
                className="min-w-0 border border-white/10 bg-white/[0.025] p-3"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black text-white">{section.title}</h3>
                  <span className={`border px-2 py-1 text-[11px] font-black ${section.tone}`}>
                    {section.label}
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {section.arenas.map((arena) => {
                    const metrics = getWarMetrics(arena);
                    const previews = getPopularComments(arena.id, 2);

                    return (
                      <Link
                        key={`${section.title}-${arena.id}`}
                        href={`/arena/${arena.id}`}
                        className="group min-w-0 border border-white/10 bg-black/25 p-3 transition hover:border-cyan-300/50"
                      >
                        <div className="flex items-center justify-between gap-2">
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
                          <span className="text-right text-[11px] font-black text-amber-200">
                            💬 {metrics.displayComments}
                          </span>
                        </div>
                        <div className="mt-2 line-clamp-2 min-h-11 text-sm font-black leading-snug text-zinc-100 group-hover:text-cyan-100">
                          {arena.title}
                        </div>
                        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center text-xs font-black">
                          <span className="truncate bg-rose-400/15 px-2 py-2 text-rose-100">
                            {arena.optionA}
                          </span>
                          <span className="text-zinc-500">VS</span>
                          <span className="truncate bg-sky-400/15 px-2 py-2 text-sky-100">
                            {arena.optionB}
                          </span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden bg-white/10">
                          <div
                            className="inline-block h-full bg-rose-400"
                            style={{ width: `${metrics.aPercent}%` }}
                          />
                          <div
                            className="inline-block h-full bg-sky-400"
                            style={{ width: `${metrics.bPercent}%` }}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2 text-[11px] font-black">
                          <span className="text-zinc-500">
                            {metrics.aPercent}:{metrics.bPercent} · 최근 10분 +{metrics.recentTenComments}
                          </span>
                          <span className="text-amber-200">댓글판 입장</span>
                        </div>
                        <div className="mt-3 space-y-1">
                          {previews.map((comment) => (
                            <p
                              key={comment.id}
                              className="line-clamp-1 border-l-2 border-white/20 pl-2 text-xs font-bold text-zinc-500"
                            >
                              💬 &ldquo;{comment.text}&rdquo; · 👍 {comment.likes}
                            </p>
                          ))}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </section>

        <section className="grid flex-1 gap-5 py-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="sticky top-0 z-20 -mx-3 min-w-0 space-y-4 bg-[#08090d]/95 px-3 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSelectedCategory(item)}
                  aria-pressed={selectedCategory === item}
                  className={`shrink-0 border px-3 py-2 text-sm font-bold transition ${
                    selectedCategory === item
                      ? "border-cyan-300 bg-cyan-300 text-black"
                      : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-cyan-300/50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="hidden border border-white/10 bg-white/[0.035] p-4 lg:block">
              <div className="text-sm font-black text-white">반박 대기석</div>
              <div className="mt-3 space-y-2">
                {replyQueue.slice(0, 5).map((arena) => {
                  const metrics = getWarMetrics(arena);

                  return (
                    <Link
                      key={arena.id}
                      href={`/arena/${arena.id}`}
                      className="block border border-white/10 bg-black/25 p-3 transition hover:border-amber-300/40"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-amber-200">
                          {getArenaPulse(arena)}
                        </span>
                        <span className="text-xs text-zinc-600">
                          💬 {metrics.displayComments}
                        </span>
                      </div>
                      <div className="mt-1 line-clamp-2 text-xs font-bold leading-relaxed text-zinc-300">
                        {arena.title}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="min-w-0 space-y-3">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="flex items-center justify-between border border-white/10 bg-white/[0.035] px-4 py-3">
                <h2 className="text-sm font-black text-zinc-300">
                  🔥 오늘의 전쟁터
                </h2>
                <span className="text-xs font-black text-zinc-600">
                  {selectedCategory} · {rankedArenas.length}개
                </span>
              </div>
              <div className="grid grid-cols-3 border border-white/10 bg-black/25 text-center text-xs font-black">
                <div className="border-r border-white/10 px-2 py-3 text-rose-200">
                  A/B 박빙 {rankedArenas.filter((arena) => {
                    return getWarMetrics(arena).gap <= 10;
                  }).length}
                </div>
                <div className="border-r border-white/10 px-2 py-3 text-amber-200">
                  LIVE {rankedArenas.filter((arena) => statusMeta[arena.status].canJoin).length}
                </div>
                <div className="px-2 py-3 text-cyan-200">
                  댓글 {rankedArenas.reduce((sum, arena) => sum + getWarMetrics(arena).displayComments, 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              {visibleRankedArenas.map((arena, index) => {
                const metrics = getWarMetrics(arena);
                const previews = getPopularComments(arena.id, 2);

                return (
                  <Link
                    key={arena.id}
                    href={`/arena/${arena.id}`}
                    className={`group grid min-w-0 gap-3 border border-white/10 bg-white/[0.035] p-3 transition hover:-translate-y-0.5 hover:border-cyan-300/40 md:grid-cols-[76px_minmax(0,1fr)_190px] md:items-start ${
                      index < 3 ? "border-amber-300/30 bg-amber-300/[0.04]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 md:block">
                      <div className="text-xl font-black text-cyan-300">
                        #{index + 1}
                      </div>
                      <span
                        className={`inline-block border px-2 py-1 text-xs font-bold ${statusMeta[arena.status].tone}`}
                      >
                        {arena.status === "main"
                          ? "NOW"
                          : statusMeta[arena.status].label}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-1">
                        {getHotBadges(arena).slice(0, 4).map((hotBadge) => (
                          <span
                            key={hotBadge.label}
                            className={`px-2 py-1 text-[10px] font-black ${hotBadge.tone}`}
                          >
                            {hotBadge.label}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 text-base font-black leading-snug text-white group-hover:text-cyan-100">
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
                      <div className="mt-3 space-y-1">
                        {previews.map((comment) => (
                          <p
                            key={comment.id}
                            className="line-clamp-1 border-l-2 border-white/20 pl-2 text-sm leading-relaxed text-zinc-500"
                          >
                            💬 &ldquo;{comment.text}&rdquo; · 👍 {comment.likes}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-center text-xs font-black md:block md:text-right">
                      <div className="border border-amber-300/30 bg-amber-300/10 px-2 py-2 text-3xl text-amber-100 md:border-0 md:bg-transparent md:p-0">
                        {metrics.displayComments}
                      </div>
                      <div className="border border-white/10 bg-black/25 px-2 py-2 text-zinc-500 md:mt-1 md:border-0 md:bg-transparent md:p-0">
                        💬 댓글
                      </div>
                      <div className="border border-white/10 bg-black/25 px-2 py-2 text-zinc-500 md:mt-1 md:border-0 md:bg-transparent md:p-0">
                        {metrics.aPercent}:{metrics.bPercent}
                      </div>
                      <div className="col-span-3 mt-2 hidden text-xs font-black text-zinc-600 group-hover:text-amber-200 md:block">
                        최근 10분 +{metrics.recentTenComments} · 댓글판 입장
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {hiddenArenaCount > 0 ? (
              <div className="border border-white/10 bg-black/25 px-4 py-3 text-center text-xs font-bold text-zinc-500">
                {hiddenArenaCount}개 주제 더 있음. 카테고리를 찍으면 판이 갈라짐.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
