"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  Arena,
  ArenaComment,
  Side,
  SortType,
} from "@/lib/arena-data";
import {
  arenas,
  emptyReactions,
  getArenaBadge,
  getArenaHotComment,
  getArenaStats,
  getCommentScore,
  getReactionTotal,
} from "@/lib/arena-data";

type ArenaDetailClientProps = {
  arena: Arena;
  initialComments: ArenaComment[];
};

type CommentTab = "new" | "popular" | "A" | "B";
type MyParticipation = {
  arenaId: number;
  selectedSide: Side;
  commentIds: number[];
  lastVisitedAt: string;
};

const commentTabLabels: Record<CommentTab, string> = {
  new: "최신 댓글",
  popular: "인기 댓글",
  A: "A진영 댓글",
  B: "B진영 댓글",
};

const COMMENT_COOLDOWN_MS = 10_000;
const SIDE_A_TONE = {
  border: "border-[#A53A4A]/45",
  bg: "bg-[#A53A4A]/16",
  text: "text-[#F0A0AA]",
  solid: "bg-[#A53A4A] text-white",
};
const SIDE_B_TONE = {
  border: "border-[#2D6A9F]/45",
  bg: "bg-[#2D6A9F]/16",
  text: "text-[#8EC6F2]",
  solid: "bg-[#2D6A9F] text-white",
};
const ACCENT_TONE = "border-[#E7B933]/45 bg-[#E7B933]/12 text-[#F0D77A]";
const nicknameSeeds = [
  "오타니거리조절러",
  "은가누펀치감별사",
  "월300안정파",
  "로또인생리셋러",
  "칼퇴수호자",
  "출근혐오자",
  "카톡읽씹분석가",
  "배달비저격수",
  "부먹방지위원회",
  "찍먹수호자",
  "전애인거리두기",
  "단톡방판정단",
  "반박대기중",
  "논리충전완료",
  "감정과몰입러",
  "AI상담불신자",
];
const generateNickname = () =>
  nicknameSeeds[Math.floor(Math.random() * nicknameSeeds.length)];

const getDetailWarMetrics = (arena: Arena, comments: ArenaComment[]) => {
  const stats = getArenaStats(arena, comments);
  const arenaComments = comments.filter((comment) => comment.arenaId === arena.id);
  const reactionScore = arenaComments.reduce(
    (sum, comment) => sum + getReactionTotal(comment),
    0
  );

  return {
    ...stats,
    gap: Math.abs(stats.aPercent - stats.bPercent),
    displayComments: stats.displayCommentCount,
    recentTenComments: stats.recentComments,
    recentHourVotes: stats.recentVotes,
    reactionScore,
  };
};

const getDetailHotBadges = (arena: Arena, comments: ArenaComment[]) => {
  const metrics = getDetailWarMetrics(arena, comments);
  const badges: { label: string; tone: string }[] = [];

  if (metrics.displayComments >= 45) {
    badges.push({ label: "HOT", tone: "bg-[#A53A4A] text-white" });
  }

  if (metrics.gap <= 10) {
    badges.push({ label: "박빙", tone: "bg-[#2D6A9F] text-white" });
  }

  if (metrics.reactionScore >= 45) {
    badges.push({ label: "논란", tone: "bg-[#E7B933] text-black" });
  }

  if (metrics.recentTenComments >= 9) {
    badges.push({ label: "댓글폭발", tone: "border border-[#E7B933]/45 bg-[#E7B933]/12 text-[#F0D77A]" });
  }

  if (arena.status === "main" || arena.status === "live") {
    badges.push({ label: "급상승", tone: "border border-white/10 bg-white/[0.04] text-zinc-300" });
  }

  return badges.slice(0, 5);
};

export default function ArenaDetailClient({
  arena,
  initialComments,
}: ArenaDetailClientProps) {
  const [comments, setComments] = useState<ArenaComment[]>(initialComments);
  const [sortType, setSortType] = useState<SortType>("new");
  const [commentTab, setCommentTab] = useState<CommentTab>("new");
  const [selectedSide, setSelectedSide] = useState<Side>("A");
  const [votedSide, setVotedSide] = useState<Side | null>(null);
  const [nickname, setNickname] = useState("");
  const [draft, setDraft] = useState("");
  const [freshCommentIds, setFreshCommentIds] = useState<Set<number>>(new Set());
  const [lastCommentAt, setLastCommentAt] = useState(0);
  const [abuseNotice, setAbuseNotice] = useState("");
  const [shareNotice, setShareNotice] = useState("");
  const [now, setNow] = useState(0);

  const canJoinArena = arena.status !== "closed";
  const arenaComments = comments.filter((comment) => comment.arenaId === arena.id);
  const stats = getDetailWarMetrics(arena, comments);
  const hotComment = getArenaHotComment(arena.id, comments);
  const badge = getArenaBadge(arena, comments);
  const hotBadges = getDetailHotBadges(arena, comments);
  const cooldownLeftMs =
    lastCommentAt > 0 ? Math.max(0, COMMENT_COOLDOWN_MS - (now - lastCommentAt)) : 0;
  const cooldownLeftSeconds = Math.ceil(cooldownLeftMs / 1000);
  const canSubmitComment = canJoinArena && cooldownLeftMs === 0 && draft.trim().length >= 5;
  const draftPlaceholder = "왜 이쪽을 골랐어?";
  const warSummary =
    stats.gap <= 5
      ? "거의 반반입니다. 댓글 하나로 분위기가 달라질 수 있습니다."
      : stats.aPercent > stats.bPercent
        ? `${arena.optionA} 진영이 앞서는 중. ${arena.optionB} 쪽 반박이 필요한 상황입니다.`
        : `${arena.optionB} 진영이 앞서는 중. ${arena.optionA} 쪽이 밀리는 중입니다.`;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    const lastAt = window.localStorage.getItem(`vs-arena-last-comment-${arena.id}`);
    const savedNickname = window.localStorage.getItem("vs_arena_nickname");
    const savedVote = window.localStorage.getItem(`vs_arena_vote_${arena.id}`) as Side | null;

    window.setTimeout(() => {
      setNow(Date.now());
      const nextNickname = savedNickname || generateNickname();

      setNickname(nextNickname);
      window.localStorage.setItem("vs_arena_nickname", nextNickname);

      if (savedVote === "A" || savedVote === "B") {
        setSelectedSide(savedVote);
        setVotedSide(savedVote);
      }

      if (lastAt) {
        setLastCommentAt(Number(lastAt));
      }
    }, 0);

    return () => window.clearInterval(timer);
  }, [arena.id]);

  const persistParticipation = (side: Side, commentId?: number) => {
    const saved = window.localStorage.getItem("vs_arena_participation");
    let records: MyParticipation[] = [];

    try {
      records = saved ? (JSON.parse(saved) as MyParticipation[]) : [];
    } catch {
      records = [];
    }

    const existing = records.find((item) => item.arenaId === arena.id);
    const nextRecord: MyParticipation = existing
      ? {
          ...existing,
          selectedSide: side,
          commentIds: commentId
            ? [...new Set([...existing.commentIds, commentId])]
            : existing.commentIds,
          lastVisitedAt: new Date().toISOString(),
        }
      : {
          arenaId: arena.id,
          selectedSide: side,
          commentIds: commentId ? [commentId] : [],
          lastVisitedAt: new Date().toISOString(),
        };

    window.localStorage.setItem(
      "vs_arena_participation",
      JSON.stringify([
        nextRecord,
        ...records.filter((item) => item.arenaId !== arena.id),
      ].slice(0, 12))
    );
  };

  const voteForSide = (side: Side) => {
    if (!canJoinArena) return;

    setSelectedSide(side);
    setVotedSide(side);
    window.localStorage.setItem(`vs_arena_vote_${arena.id}`, side);
    persistParticipation(side);
    setAbuseNotice(
      `${side === "A" ? arena.optionA : arena.optionB}에 한 표를 던졌어요.`
    );
  };

  const changeNickname = () => {
    const nextNickname = generateNickname();

    setNickname(nextNickname);
    window.localStorage.setItem("vs_arena_nickname", nextNickname);
  };

  const sortedComments = useMemo(() => {
    const list = [...arenaComments];

    if (sortType === "new") {
      return list.sort((a, b) => b.createdAt - a.createdAt);
    }

    if (sortType === "best") {
      return list.sort((a, b) => b.likes - a.likes);
    }

    return list.sort((a, b) => getCommentScore(b) - getCommentScore(a));
  }, [arenaComments, sortType]);

  const sideAComments = sortedComments.filter((comment) => comment.side === "A");
  const sideBComments = sortedComments.filter((comment) => comment.side === "B");
  const visibleComments =
    commentTab === "A"
      ? sideAComments
      : commentTab === "B"
        ? sideBComments
        : commentTab === "popular"
          ? [...arenaComments].sort((a, b) => b.likes - a.likes)
          : [...arenaComments].sort((a, b) => b.createdAt - a.createdAt);
  const relatedArenas = arenas
    .filter((item) => item.id !== arena.id && item.category === arena.category)
    .slice(0, 3);

  const addComment = () => {
    const text = draft.trim();

    if (!text || !canJoinArena) return;
    if (text.length < 5) {
      setAbuseNotice("의견을 5글자 이상 남겨주세요.");
      return;
    }
    if (cooldownLeftMs > 0) {
      setAbuseNotice(`${cooldownLeftSeconds}초만 숨 고르고 다시 올리자.`);
      return;
    }
    if (
      arenaComments.some(
        (comment) =>
          comment.nickname === (nickname.trim() || "익명의 논객") &&
          comment.text.trim() === text
      )
    ) {
      setAbuseNotice("같은 댓글은 한 번만 남길 수 있어요.");
      return;
    }

    const commentId = Date.now();
    setComments((current) => [
      {
        id: commentId,
        arenaId: arena.id,
        side: selectedSide,
        nickname: nickname.trim() || "익명의 논객",
        text,
        likes: 0,
        reactions: emptyReactions(),
        createdAt: Date.now(),
      },
      ...current,
    ]);
    setFreshCommentIds((current) => new Set(current).add(commentId));
    setVotedSide(selectedSide);
    persistParticipation(selectedSide, commentId);
    const submittedAt = Date.now();
    setLastCommentAt(submittedAt);
    window.localStorage.setItem(
      `vs-arena-last-comment-${arena.id}`,
      String(submittedAt)
    );
    setDraft("");
    setAbuseNotice("댓글을 남겼어요.");
    window.setTimeout(() => {
      document
        .getElementById("comment-zone")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const shareArena = async () => {
    const url = `${window.location.origin}/arena/${arena.id}`;
    const text = `“${arena.title}”\n너라면 어느 쪽이야?\nVS Arena에서 투표해봐\n${url}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${arena.title} | VS Arena`,
          text,
          url,
        });
        setShareNotice("공유창을 열었어요.");
      } else {
        await navigator.clipboard.writeText(text);
        setShareNotice("질문 링크를 복사했어요.");
      }
    } catch {
      setShareNotice("공유가 취소됐어요.");
    }

    window.setTimeout(() => setShareNotice(""), 2600);
  };

  const copyArenaLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/arena/${arena.id}`);
      setShareNotice("링크가 복사됐어.");
    } catch {
      setShareNotice("복사에 실패했어. 주소창에서 직접 복사해줘.");
    }

    window.setTimeout(() => setShareNotice(""), 2600);
  };

  const renderCommentCard = (comment: ArenaComment, index: number) => {
    const dislikes = Math.max(0, Math.floor((getReactionTotal(comment) - comment.likes / 3) / 2));
    const isTopComment = comment.likes >= 90 && index === 0;
    const isFreshComment = freshCommentIds.has(comment.id);
    const timeLabel =
      comment.createdAt > 1_000_000_000_000
        ? "방금 전"
        : `${Math.max(1, 45 - comment.createdAt)}분 전`;
    const sideTone = comment.side === "A" ? SIDE_A_TONE : SIDE_B_TONE;

    return (
      <article
        key={comment.id}
        className={`border bg-white/[0.022] p-4 ${
          index === 0 && sortType !== "new" ? "border-[#E7B933]/35" : "border-white/10"
        }`}
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={`border px-2 py-1 text-xs font-black ${sideTone.border} ${sideTone.bg} ${sideTone.text}`}>
            {comment.side} 선택 · {comment.side === "A" ? arena.optionA : arena.optionB}
          </span>
          {isTopComment ? (
            <span className={`border px-2 py-1 text-xs font-black ${ACCENT_TONE}`}>
              대표 의견
            </span>
          ) : null}
          {isFreshComment ? (
            <span className="border border-[#E7B933]/45 bg-[#E7B933] px-2 py-1 text-xs font-black text-black">
              방금 작성
            </span>
          ) : null}
          <span className="text-sm font-bold text-zinc-300">{comment.nickname}</span>
          <span className="text-xs font-bold text-zinc-600">{timeLabel}</span>
        </div>
        <p className="whitespace-pre-wrap break-words leading-relaxed text-zinc-100">
          {comment.text}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold text-zinc-600">
          <span>공감 {comment.likes}</span>
          <span>비공감 {dislikes}</span>
        </div>
      </article>
    );
  };

  return (
    <div className="min-w-0 space-y-4 pb-8">
      <section
        id="vote-zone"
        className="min-w-0 border border-white/10 bg-white/[0.035] p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-[#F0D77A]">#{arena.category}</span>
          {votedSide
            ? hotBadges.map((item) => (
                <span
                  key={item.label}
                  className={`px-2 py-1 text-xs font-black ${item.tone}`}
                >
                  {item.label}
                </span>
              ))
            : null}
        </div>
        <h1 className="mt-3 break-keep text-2xl font-black leading-tight text-white sm:text-5xl">
          {arena.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm font-bold leading-relaxed text-zinc-500">
          {arena.openingLine}
        </p>

        <div className="mt-4 grid grid-cols-2 border border-white/10 bg-black/25 text-center">
          <div className="border-r border-white/10 px-3 py-3">
            <div className="text-base font-black text-white sm:text-lg">
              {stats.totalVotes.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500">누적 참여</div>
          </div>
          <div className="px-3 py-3">
            <div className="text-base font-black text-white sm:text-lg">
              {stats.displayComments.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500">누적 댓글</div>
          </div>
        </div>
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-black text-white">내 편 고르기</h2>
            <span className="text-xs font-black text-[#F0D77A]">
              고르면 바로 민심 보임
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] sm:items-stretch">
            <button
              onClick={() => voteForSide("A")}
              disabled={!canJoinArena}
              aria-pressed={votedSide === "A"}
              className={`min-w-0 border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 sm:p-5 ${
                votedSide === "A"
                ? `${SIDE_A_TONE.border} ${SIDE_A_TONE.bg}`
                : `border-white/10 bg-black/30 hover:${SIDE_A_TONE.border}`
              }`}
            >
              <div className={`text-xs font-bold ${SIDE_A_TONE.text}`}>A 진영</div>
              <div className="mt-1 break-keep text-2xl font-black text-white sm:text-3xl">
                {arena.optionA}
              </div>
              <div className={`mt-4 px-4 py-3 text-center text-sm font-black ${SIDE_A_TONE.solid}`}>
                {arena.optionA}에 한 표
              </div>
            </button>

            <div className="grid min-h-12 place-items-center border border-white/10 bg-black/35 text-lg font-black text-white">
              VS
            </div>

            <button
              onClick={() => voteForSide("B")}
              disabled={!canJoinArena}
              aria-pressed={votedSide === "B"}
              className={`min-w-0 border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 sm:p-5 ${
                votedSide === "B"
                ? `${SIDE_B_TONE.border} ${SIDE_B_TONE.bg}`
                : `border-white/10 bg-black/30 hover:${SIDE_B_TONE.border}`
              }`}
            >
              <div className={`text-xs font-bold ${SIDE_B_TONE.text}`}>B 진영</div>
              <div className="mt-1 break-keep text-2xl font-black text-white sm:text-3xl">
                {arena.optionB}
              </div>
              <div className={`mt-4 px-4 py-3 text-center text-sm font-black ${SIDE_B_TONE.solid}`}>
                {arena.optionB}에 한 표
              </div>
            </button>
          </div>
        </div>
        {!votedSide ? (
          <p className="mt-4 text-center text-sm font-bold text-zinc-500">
            투표하면 현재 민심이 보여요.
          </p>
        ) : (
          <div className="mt-5 border border-white/10 bg-black/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-black text-white">
                너는 {votedSide}를 골랐어.
              </h2>
              <span className="text-xs font-black text-[#F0D77A]">현재 민심 · {badge}</span>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-sm font-black">
                  <span>A {arena.optionA}</span>
                  <span>{stats.aPercent}%</span>
                </div>
                <div className="h-3 bg-white/10">
                  <div className="h-full bg-[#A53A4A]" style={{ width: `${stats.aPercent}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm font-black">
                  <span>B {arena.optionB}</span>
                  <span>{stats.bPercent}%</span>
                </div>
                <div className="h-3 bg-white/10">
                  <div className="h-full bg-[#2D6A9F]" style={{ width: `${stats.bPercent}%` }} />
                </div>
              </div>
            </div>
            <div className={`mt-4 border px-4 py-3 text-sm font-bold leading-relaxed ${ACCENT_TONE}`}>
              {warSummary}
            </div>
            <div id="quick-comment" className="mt-5">
              <h3 className="text-base font-black text-white">왜 이쪽을 골랐어?</h3>
              <p className="mt-1 text-xs font-bold text-zinc-500">한 줄만 남겨도 좋아.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)_130px]">
                <input
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  disabled={!canJoinArena}
                  placeholder="닉네임"
                  aria-label="닉네임"
                  className="min-h-12 border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none placeholder:text-zinc-600 focus:border-[#E7B933]/60"
                  maxLength={16}
                />
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") addComment();
                  }}
                  disabled={!canJoinArena}
                  placeholder={draftPlaceholder}
                  className="min-h-12 border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none placeholder:text-zinc-600 focus:border-[#E7B933]/60"
                  maxLength={500}
                  aria-label="댓글 내용"
                />
                <button
                  onClick={addComment}
                  disabled={!canSubmitComment}
                  className="min-h-12 bg-[#E7B933] px-4 text-sm font-black text-black transition hover:bg-[#F0D77A] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-zinc-500"
                >
                  댓글 남기기
                </button>
              </div>
              <button
                type="button"
                onClick={changeNickname}
                className="mt-2 text-xs font-bold text-zinc-500 transition hover:text-zinc-200"
              >
                랜덤 닉네임 사용
              </button>
              {abuseNotice ? (
                <div className={`mt-3 border px-4 py-3 text-xs font-bold ${ACCENT_TONE}`}>
                  {abuseNotice}
                </div>
              ) : null}
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px_180px]">
              <div className="bg-white/[0.025] px-4 py-3 text-xs font-bold leading-relaxed text-zinc-400">
                친구 의견도 궁금하다면 이 질문을 공유해보세요.
              </div>
              <button
                type="button"
                onClick={copyArenaLink}
                className="border border-white/15 px-4 py-3 text-sm font-black text-zinc-300 transition hover:border-white/35 hover:text-white"
              >
                링크 복사
              </button>
              <button
                type="button"
                onClick={shareArena}
                className="border border-[#E7B933]/45 bg-[#E7B933]/12 px-4 py-3 text-sm font-black text-[#F0D77A] transition hover:bg-[#E7B933] hover:text-black"
              >
                친구에게 공유하기
              </button>
            </div>
            {shareNotice ? (
              <div className="mt-2 border border-[#E7B933]/35 bg-[#E7B933]/10 px-4 py-2 text-xs font-black text-[#F0D77A]">
                {shareNotice}
              </div>
            ) : null}
          </div>
        )}
      </section>

      {votedSide && hotComment ? (
        <section className={`border p-4 sm:p-5 ${ACCENT_TONE}`}>
          <div className="text-sm font-black">
            현재 경기 하이라이트
          </div>
          <p className="mt-3 text-lg font-black leading-relaxed text-white sm:text-xl">
            &ldquo;{hotComment.text}&rdquo;
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
            <span>{hotComment.nickname}</span>
            <span>추천 {hotComment.likes}</span>
            <span>관전 점수 {getCommentScore(hotComment)}</span>
          </div>
        </section>
      ) : null}

      {votedSide ? (
      <section className="min-w-0">
        <section id="comment-zone" className="min-w-0 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-white">
                갈리는 댓글 현장
              </h2>
              <p className="mt-1 text-xs font-bold text-zinc-600">
                다른 사람은 왜 그쪽을 골랐는지 확인해보세요.
              </p>
            </div>
            <div className="grid w-full grid-cols-2 border border-white/10 bg-black/25 p-1 sm:w-auto sm:min-w-[420px] sm:grid-cols-4">
              {(["new", "popular", "A", "B"] as CommentTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setCommentTab(tab);
                    setSortType(tab === "popular" ? "best" : "new");
                  }}
                  className={`px-3 py-2 text-xs font-black transition ${
                    commentTab === tab
                      ? "bg-[#E7B933] text-black"
                      : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {commentTabLabels[tab]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 border border-white/10 bg-white/[0.02] p-3">
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-black">
              <div className={`border px-2 py-3 ${SIDE_A_TONE.border} ${SIDE_A_TONE.bg} ${SIDE_A_TONE.text}`}>
                A진영 {sideAComments.length}
              </div>
              <div className={`border px-2 py-3 ${SIDE_B_TONE.border} ${SIDE_B_TONE.bg} ${SIDE_B_TONE.text}`}>
                B진영 {sideBComments.length}
              </div>
              <div className={`border px-2 py-3 ${ACCENT_TONE}`}>
                댓글 {stats.displayComments.toLocaleString()}
              </div>
            </div>
            {visibleComments.map((comment, index) => renderCommentCard(comment, index))}
          </div>
        </section>

      </section>
      ) : null}
      {votedSide && relatedArenas.length > 0 ? (
        <section className="border border-white/10 bg-white/[0.035] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black text-white">관련 VS 추천</h2>
            <span className="text-xs font-bold text-zinc-600">#{arena.category}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {relatedArenas.map((item) => {
              const relatedStats = getArenaStats(item, comments);

              return (
                <Link
                  key={item.id}
                  href={`/arena/${item.id}`}
                  className="border border-white/10 bg-black/25 p-3 transition hover:border-[#E7B933]/45"
                >
                  <div className="line-clamp-2 text-sm font-black text-zinc-100">
                    {item.title}
                  </div>
                  <div className="mt-2 text-xs font-bold text-zinc-500">
                    참여 {relatedStats.totalVotes.toLocaleString()} · 댓글{" "}
                    {relatedStats.displayCommentCount}
                  </div>
                </Link>
              );
            })}
          </div>
          <Link
            href={`/arena/${relatedArenas[0].id}`}
            className="mt-4 block min-h-12 border border-[#E7B933]/45 px-4 py-3 text-center text-sm font-black text-[#F0D77A] transition hover:bg-[#E7B933] hover:text-black"
          >
            다음 VS 보기
          </Link>
        </section>
      ) : null}
    </div>
  );
}
