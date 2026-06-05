"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  Arena,
  ArenaComment,
  ReactionType,
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
  getTopReaction,
  reactionMeta,
  reactionOrder,
  statusMeta,
} from "@/lib/arena-data";

type ArenaDetailClientProps = {
  arena: Arena;
  initialComments: ArenaComment[];
};

type CommentTab = "new" | "popular" | "A" | "B";

const commentTabLabels: Record<CommentTab, string> = {
  new: "최신 댓글",
  popular: "인기 댓글",
  A: "A진영 댓글",
  B: "B진영 댓글",
};

const COMMENT_COOLDOWN_MS = 10_000;

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
    displayComments: stats.commentCount * 76 + Math.round(arena.heat * 1.7),
    recentTenComments: Math.max(8, Math.round(arena.heat / 7 + stats.commentCount * 3)),
    recentHourVotes: Math.max(64, Math.round(arena.spectators / 48 + arena.heat * 2)),
    reactionScore,
  };
};

const getDetailHotBadges = (arena: Arena, comments: ArenaComment[]) => {
  const metrics = getDetailWarMetrics(arena, comments);
  const badges: { label: string; tone: string }[] = [];

  if (metrics.displayComments >= 180) {
    badges.push({ label: "🔥 HOT", tone: "bg-rose-400 text-black" });
  }

  if (metrics.gap <= 10) {
    badges.push({ label: "⚔️ 박빙", tone: "bg-cyan-300 text-black" });
  }

  if (metrics.reactionScore >= 45) {
    badges.push({ label: "🧨 논란", tone: "bg-amber-300 text-black" });
  }

  if (metrics.recentTenComments >= 18) {
    badges.push({ label: "💬 댓글폭발", tone: "bg-lime-300 text-black" });
  }

  if (arena.status === "main" || arena.status === "live") {
    badges.push({ label: "🚀 급상승", tone: "bg-violet-300 text-black" });
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
  const [nickname, setNickname] = useState("익명의 논객");
  const [draft, setDraft] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [likedCommentIds, setLikedCommentIds] = useState<Set<number>>(new Set());
  const [reactedKeys, setReactedKeys] = useState<Set<string>>(new Set());
  const [lastCommentAt, setLastCommentAt] = useState(0);
  const [abuseNotice, setAbuseNotice] = useState("");
  const [now, setNow] = useState(0);

  const canJoinArena = statusMeta[arena.status].canJoin;
  const arenaComments = comments.filter((comment) => comment.arenaId === arena.id);
  const stats = getDetailWarMetrics(arena, comments);
  const hotComment = getArenaHotComment(arena.id, comments);
  const badge = getArenaBadge(arena, comments);
  const hotBadges = getDetailHotBadges(arena, comments);
  const cooldownLeftMs =
    lastCommentAt > 0 ? Math.max(0, COMMENT_COOLDOWN_MS - (now - lastCommentAt)) : 0;
  const cooldownLeftSeconds = Math.ceil(cooldownLeftMs / 1000);
  const canSubmitComment = canJoinArena && cooldownLeftMs === 0 && draft.trim().length >= 5;
  const selectedOption = selectedSide === "A" ? arena.optionA : arena.optionB;
  const opposingOption = selectedSide === "A" ? arena.optionB : arena.optionA;
  const draftPlaceholder =
    selectedSide === "A"
      ? `${opposingOption} 쪽 말이 안 먹히는 이유를 한 방 먹여주세요.`
      : `${opposingOption} 쪽이 놓친 걸 바로 찔러주세요.`;
  const commentTemplates = [
    {
      label: "반박하기",
      text: `반박하자면, ${opposingOption} 쪽 주장은 ___ 때문에 말이 안 됨.`,
    },
    {
      label: "드립치기",
      text: `솔직히 이건 ${selectedOption} 쪽이 이기는 그림이 너무 웃김. 왜냐면 ___`,
    },
    {
      label: "팩트체크",
      text: `팩트만 보면 ${selectedOption} 쪽이 맞는 이유는 ___`,
    },
    {
      label: "한줄평",
      text: `${selectedOption} 편 든다. 이유는 간단함. ___`,
    },
  ];

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    const liked = window.localStorage.getItem("vs-arena-liked-comments");
    const reacted = window.localStorage.getItem("vs-arena-reacted-keys");
    const lastAt = window.localStorage.getItem(`vs-arena-last-comment-${arena.id}`);

    window.setTimeout(() => {
      setNow(Date.now());

      if (liked) {
        setLikedCommentIds(new Set(JSON.parse(liked) as number[]));
      }

      if (reacted) {
        setReactedKeys(new Set(JSON.parse(reacted) as string[]));
      }

      if (lastAt) {
        setLastCommentAt(Number(lastAt));
      }
    }, 0);

    return () => window.clearInterval(timer);
  }, [arena.id]);

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
      setAbuseNotice("너무 짧으면 판정 불가. 최소 5글자는 던져줘.");
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
      setAbuseNotice("같은 말 복붙은 관중석에서 바로 티남. 다른 각도로 가자.");
      return;
    }

    setComments((current) => [
      {
        id: Date.now(),
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
    const submittedAt = Date.now();
    setLastCommentAt(submittedAt);
    window.localStorage.setItem(
      `vs-arena-last-comment-${arena.id}`,
      String(submittedAt)
    );
    setDraft("");
    setAbuseNotice("등록 완료. 이제 상대 진영 반응 기다리면 됨.");
  };

  const likeComment = (id: number) => {
    if (likedCommentIds.has(id)) {
      setAbuseNotice("추천은 한 댓글에 한 번만. 몰빵은 운영팀이 싫어함.");
      return;
    }

    setComments((current) =>
      current.map((comment) =>
        comment.id === id ? { ...comment, likes: comment.likes + 1 } : comment
      )
    );
    setLikedCommentIds((current) => {
      const next = new Set(current);
      next.add(id);
      window.localStorage.setItem(
        "vs-arena-liked-comments",
        JSON.stringify([...next])
      );
      return next;
    });
  };

  const reactToComment = (id: number, reaction: ReactionType) => {
    const key = `${id}:${reaction}`;

    if (reactedKeys.has(key)) {
      setAbuseNotice("같은 반응은 이미 찍었음. 판정은 한 번이면 충분.");
      return;
    }

    setComments((current) =>
      current.map((comment) =>
        comment.id === id
          ? {
              ...comment,
              reactions: {
                ...comment.reactions,
                [reaction]: comment.reactions[reaction] + 1,
              },
            }
          : comment
      )
    );
    setReactedKeys((current) => {
      const next = new Set(current);
      next.add(key);
      window.localStorage.setItem(
        "vs-arena-reacted-keys",
        JSON.stringify([...next])
      );
      return next;
    });
  };

  const applyCommentTemplate = (template: string) => {
    setDraft((current) => {
      if (!current.trim()) return template;

      return `${current.trim()}\n${template}`;
    });
  };

  const prepareReply = (comment: ArenaComment) => {
    const replySide = comment.side === "A" ? "B" : "A";
    const replyOption = replySide === "A" ? arena.optionA : arena.optionB;
    const shortQuote =
      comment.text.length > 42 ? `${comment.text.slice(0, 42)}...` : comment.text;

    setSelectedSide(replySide);
    setDraft(
      `반박하자면, "${shortQuote}" 이 말은 ___ 때문에 ${replyOption} 쪽에서 못 받음.`
    );
    window.setTimeout(() => {
      document
        .getElementById("comment-write")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  const toggleExpanded = (id: number) => {
    setExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const renderCommentCard = (comment: ArenaComment, index: number) => {
    const topReaction = getTopReaction(comment);
    const score = getCommentScore(comment);
    const isExpanded = expandedIds.has(comment.id);
    const dislikes = Math.max(0, Math.floor((getReactionTotal(comment) - comment.likes / 3) / 2));
    const replies = Math.max(0, Math.floor((comment.likes + getReactionTotal(comment)) / 18));
    const isPopular = comment.likes >= 70 || index === 0;
    const timeLabel =
      comment.createdAt > 1_000_000_000_000
        ? "방금 전"
        : `${Math.max(1, 45 - comment.createdAt)}분 전`;

    return (
      <article
        key={comment.id}
        className={`border bg-white/[0.035] transition hover:border-cyan-300/50 ${
          index === 0 && sortType !== "new"
            ? "border-amber-300/40"
            : "border-white/10"
        }`}
      >
        <div className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center">
          <button
            onClick={() => toggleExpanded(comment.id)}
            className="min-w-0 text-left"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {isPopular ? (
                <span className="bg-amber-300 px-2 py-1 text-xs font-black text-black">
                  인기댓글
                </span>
              ) : null}
              {topReaction ? (
                <span className="border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-xs font-black text-cyan-200">
                  {reactionMeta[topReaction].badge}
                </span>
              ) : null}
              <span
                className={`border px-2 py-1 text-xs font-bold ${
                  comment.side === "A"
                    ? "border-rose-300/30 bg-rose-400/10 text-rose-200"
                    : "border-sky-300/30 bg-sky-400/10 text-sky-200"
                }`}
              >
                {comment.side === "A" ? arena.optionA : arena.optionB}
              </span>
              <span className="text-sm font-bold text-zinc-300">
                {comment.nickname}
              </span>
              <span className="text-xs font-bold text-zinc-600">{timeLabel}</span>
            </div>

            <p className="line-clamp-2 leading-relaxed text-zinc-100">
              {comment.text}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-zinc-600">
              <span>좋아요 {comment.likes}</span>
              <span>싫어요 {dislikes}</span>
              <span>답글 {replies}</span>
              <span>점수 {score}</span>
              <span>{isExpanded ? "접기" : "이 말 반박하기"}</span>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-1 text-xs font-black">
            <button
              onClick={() => likeComment(comment.id)}
              className="border border-lime-300/30 bg-lime-300/10 px-2 py-2 text-lime-100 transition hover:bg-lime-300 hover:text-black"
            >
              맞말
            </button>
            <button
              onClick={() => reactToComment(comment.id, "stretch")}
              className="border border-violet-300/30 bg-violet-300/10 px-2 py-2 text-violet-100 transition hover:bg-violet-300 hover:text-black"
            >
              억지
            </button>
            <button
              onClick={() => prepareReply(comment)}
              className="border border-rose-300/30 bg-rose-400/10 px-2 py-2 text-rose-100 transition hover:bg-rose-300 hover:text-black"
            >
              반박하기
            </button>
            <button
              onClick={() => toggleExpanded(comment.id)}
              className="border border-white/10 bg-black/25 px-2 py-2 text-zinc-300 transition hover:border-cyan-300 hover:text-cyan-100"
            >
              답글 보기 {replies}
            </button>
          </div>
        </div>

        {isExpanded ? (
          <div className="border-t border-white/10 bg-black/20 p-4">
            <p className="whitespace-pre-wrap leading-relaxed text-zinc-100">
              {comment.text}
            </p>
            <div className="mt-4 grid grid-cols-5 gap-1">
              {reactionOrder.map((reaction) => (
                <button
                  key={reaction}
                  onClick={() => reactToComment(comment.id, reaction)}
                  className={`min-h-10 border px-1 text-xs font-bold transition ${
                    comment.reactions[reaction] > 0
                      ? reactionMeta[reaction].active
                      : "border-white/10 bg-black/25 text-zinc-500 hover:border-white/30 hover:text-zinc-200"
                  }`}
                  title={reactionMeta[reaction].badge}
                >
                  <span className="block">{reactionMeta[reaction].label}</span>
                  <span className="block text-[10px] opacity-75">
                    {comment.reactions[reaction]}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => toggleExpanded(comment.id)}
              className="mt-3 text-xs font-black text-cyan-300 transition hover:text-cyan-100"
            >
              접기
            </button>
          </div>
        ) : null}
      </article>
    );
  };

  return (
    <div className="min-w-0 space-y-5 pb-44">
      <section
        id="vote-zone"
        className="min-w-0 border border-rose-300/30 bg-white/[0.04] p-4 shadow-2xl shadow-rose-950/20 sm:p-6"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-cyan-300">
                #{arena.category}
              </span>
              {hotBadges.map((item) => (
                <span
                  key={item.label}
                  className={`px-2 py-1 text-xs font-black ${item.tone}`}
                >
                  {item.label}
                </span>
              ))}
            </div>
            <h1 className="mt-3 break-keep text-2xl font-black leading-tight text-white sm:text-5xl">
              {arena.title}
            </h1>
            <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
              <div className="border border-white/10 bg-black/30 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-sm font-black text-white">현재 전황</h2>
                  <span className="text-xs font-black text-amber-200">
                    {badge}
                  </span>
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
                  <div className="border border-rose-300/25 bg-rose-400/10 p-3">
                    <div className="truncate text-sm font-black text-rose-100">
                      {arena.optionA}
                    </div>
                    <div className="mt-1 text-4xl font-black text-white">
                      {stats.aPercent}%
                    </div>
                  </div>
                  <div className="text-xs font-black text-zinc-500">VS</div>
                  <div className="border border-sky-300/25 bg-sky-400/10 p-3">
                    <div className="truncate text-sm font-black text-sky-100">
                      {arena.optionB}
                    </div>
                    <div className="mt-1 text-4xl font-black text-white">
                      {stats.bPercent}%
                    </div>
                  </div>
                </div>
              </div>
              <div className="border border-amber-300/40 bg-amber-300/10 p-4 text-center">
                <div className="text-xs font-black text-amber-200">
                  💬 댓글 전쟁
                </div>
                <div className="mt-1 text-5xl font-black text-white">
                  {stats.displayComments.toLocaleString()}
                </div>
                <div className="mt-1 text-xs font-bold text-zinc-500">
                  최근 10분 +{stats.recentTenComments}
                </div>
              </div>
            </div>
          </div>

          <div className="grid w-full grid-cols-3 border border-white/10 bg-black/25 text-center lg:min-w-64 lg:max-w-sm">
            <div className="border-r border-white/10 px-3 py-3">
              <div className="text-base font-black text-amber-300 sm:text-lg">
                {stats.displayComments.toLocaleString()}
              </div>
              <div className="text-xs text-zinc-500">누적 댓글</div>
            </div>
            <div className="border-r border-white/10 px-3 py-3">
              <div className="text-base font-black text-amber-300 sm:text-lg">
                {arena.spectators.toLocaleString()}
              </div>
              <div className="text-xs text-zinc-500">구경중</div>
            </div>
            <div className="px-3 py-3">
              <div className="text-base font-black text-white sm:text-lg">
                +{stats.recentHourVotes}
              </div>
              <div className="text-xs text-zinc-500">1시간 투표</div>
            </div>
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-sm font-bold leading-relaxed text-zinc-500">
          {arena.openingLine}
        </p>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-black text-white">내 편 고르기</h2>
            <span className="text-xs font-black text-amber-200">
              고르면 바로 민심 보임
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setSelectedSide("A")}
              disabled={!canJoinArena}
              className={`min-w-0 border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 sm:p-5 ${
                selectedSide === "A"
                  ? "border-rose-300 bg-rose-400/15"
                  : "border-white/10 bg-black/30 hover:border-rose-300/60"
              }`}
            >
              <div className="text-xs font-bold text-rose-200">A 진영</div>
              <div className="mt-1 break-keep text-2xl font-black text-white sm:text-3xl">
                {arena.optionA}
              </div>
              <div className="mt-3 text-sm text-zinc-400">
                {stats.aPercent}% 지지
              </div>
              <div className="mt-4 bg-rose-300 px-4 py-3 text-center text-sm font-black text-black">
                {arena.optionA} 편 들기
              </div>
            </button>

            <button
              onClick={() => setSelectedSide("B")}
              disabled={!canJoinArena}
              className={`min-w-0 border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 sm:p-5 ${
                selectedSide === "B"
                  ? "border-sky-300 bg-sky-400/15"
                  : "border-white/10 bg-black/30 hover:border-sky-300/60"
              }`}
            >
              <div className="text-xs font-bold text-sky-200">B 진영</div>
              <div className="mt-1 break-keep text-2xl font-black text-white sm:text-3xl">
                {arena.optionB}
              </div>
              <div className="mt-3 text-sm text-zinc-400">
                {stats.bPercent}% 지지
              </div>
              <div className="mt-4 bg-sky-300 px-4 py-3 text-center text-sm font-black text-black">
                {arena.optionB} 편 들기
              </div>
            </button>
          </div>
        </div>

        <div className="mt-5 h-3 overflow-hidden bg-white/10">
          <div
            className="inline-block h-full bg-rose-400 transition-all"
            style={{ width: `${stats.aPercent}%` }}
          />
          <div
            className="inline-block h-full bg-sky-400 transition-all"
            style={{ width: `${stats.bPercent}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs font-black text-zinc-500">
          <span>{arena.optionA} {stats.aPercent}%</span>
          <span>{arena.optionB} {stats.bPercent}%</span>
        </div>
      </section>

      {hotComment ? (
        <section className="border border-amber-300/40 bg-amber-300/10 p-4 sm:p-5">
          <div className="text-sm font-black text-amber-200">
            현재 경기 하이라이트
          </div>
          <p className="mt-3 text-lg font-black leading-relaxed text-white sm:text-xl">
            &ldquo;{hotComment.text}&rdquo;
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
            <span>{hotComment.nickname}</span>
            <span>추천 {hotComment.likes}</span>
            <span>관전 점수 {getCommentScore(hotComment)}</span>
            <button
              onClick={() => setSelectedSide(hotComment.side === "A" ? "B" : "A")}
              disabled={!canJoinArena}
              className="w-full border border-white/10 px-3 py-2 text-xs font-black text-zinc-300 transition hover:border-cyan-300 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-auto sm:w-auto sm:py-1.5"
            >
              이 댓글에 반박하기
            </button>
          </div>
        </section>
      ) : null}

      <section className="grid min-w-0 gap-5 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="min-w-0 space-y-4">
          <div id="comment-write" className="border border-white/10 bg-white/[0.04] p-4 sm:p-5">
            <h2 className="text-sm font-black text-zinc-300">
              {canJoinArena ? "댓글 전쟁 참여" : "관전석"}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              {canJoinArena
                ? "읽다가 빡치면 바로 아래에서 한 줄 박으면 됨."
                : "예정 또는 종료된 경기는 댓글 작성이 잠겨 있음."}
            </p>

            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              disabled={!canJoinArena}
              className="mt-4 w-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              maxLength={16}
              aria-label="닉네임"
            />
            <div className="mt-3 flex flex-wrap items-center border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-400">
              너는 누구 편?
              <strong className="ml-2 text-white">
                {selectedOption}
              </strong>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(["A", "B"] as Side[]).map((side) => (
                <button
                  key={side}
                  onClick={() => setSelectedSide(side)}
                  disabled={!canJoinArena}
                  className={`border px-3 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    selectedSide === side
                      ? side === "A"
                        ? "border-rose-300 bg-rose-300 text-black"
                        : "border-sky-300 bg-sky-300 text-black"
                      : "border-white/10 bg-black/30 text-zinc-400 hover:border-white/30"
                  }`}
                >
                  {side === "A" ? arena.optionA : arena.optionB} 편으로 참전
                </button>
              ))}
            </div>
            <div
              className={`sticky top-3 z-10 mt-3 border px-4 py-3 text-sm font-black ${
                selectedSide === "A"
                  ? "border-rose-300/40 bg-rose-400/15 text-rose-100"
                  : "border-sky-300/40 bg-sky-400/15 text-sky-100"
              }`}
            >
              지금 너는 {selectedSide === "A" ? "A" : "B"}편.{" "}
              <span className="text-zinc-400">
                {selectedOption}로 입장 중
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {commentTemplates.map((template) => (
                <button
                  key={template.label}
                  type="button"
                  onClick={() => applyCommentTemplate(template.text)}
                  disabled={!canJoinArena}
                  className="border border-white/10 bg-black/30 px-3 py-2 text-xs font-black text-zinc-300 transition hover:border-amber-300 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {template.label}
                </button>
              ))}
            </div>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={!canJoinArena}
              placeholder={
                canJoinArena
                  ? draftPlaceholder
                  : "이 경기는 지금 관전만 가능함."
              }
              className="mt-3 min-h-44 w-full resize-none border border-white/10 bg-black/40 p-4 text-sm leading-relaxed text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              maxLength={1200}
            />
            <div className="mt-2 flex items-center justify-between gap-3 text-xs font-bold text-zinc-600">
              <span>{draft.trim().length}/1200</span>
              <span>
                {cooldownLeftMs > 0
                  ? `${cooldownLeftSeconds}초 쿨다운`
                  : "도배 감시 통과"}
              </span>
            </div>
            {abuseNotice ? (
              <div className="mt-3 border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-xs font-bold text-amber-100">
                {abuseNotice}
              </div>
            ) : null}
            <button
              onClick={addComment}
              disabled={!canSubmitComment}
              className="mt-3 w-full border border-cyan-300 bg-cyan-300 px-5 py-3 text-sm font-black text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-zinc-500"
            >
              {canJoinArena
                ? cooldownLeftMs > 0
                  ? "쿨다운 중"
                  : "한마디 던지기"
                : "구경 중"}
            </button>
            <div className="mt-4 grid gap-2 text-xs font-bold text-zinc-500 sm:grid-cols-2">
              <div className="border border-white/10 bg-black/25 p-3">
                같은 댓글 반복 컷
              </div>
              <div className="border border-white/10 bg-black/25 p-3">
                추천/반응 중복 컷
              </div>
            </div>
          </div>

        </aside>

        <section id="comment-zone" className="min-w-0 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-white">
                피 튀기는 댓글 현장
              </h2>
              <p className="mt-1 text-xs font-bold text-zinc-600">
                사람들 왜 이렇게 싸우는지 읽다 보면 나도 한마디 남기게 됨.
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
                      ? "bg-cyan-300 text-black"
                      : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {commentTabLabels[tab]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 border border-white/10 bg-white/[0.025] p-3">
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-black">
              <div className="border border-rose-300/20 bg-rose-400/10 px-2 py-3 text-rose-100">
                A진영 {sideAComments.length}
              </div>
              <div className="border border-sky-300/20 bg-sky-400/10 px-2 py-3 text-sky-100">
                B진영 {sideBComments.length}
              </div>
              <div className="border border-amber-300/20 bg-amber-300/10 px-2 py-3 text-amber-100">
                댓글전쟁 {stats.displayComments.toLocaleString()}
              </div>
            </div>
            {visibleComments.map((comment, index) => renderCommentCard(comment, index))}
          </div>
        </section>
      </section>
      {relatedArenas.length > 0 ? (
        <section className="border border-white/10 bg-white/[0.035] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black text-white">관련 VS 추천</h2>
            <span className="text-xs font-bold text-zinc-600">#{arena.category}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {relatedArenas.map((item) => {
              const relatedStats = getArenaStats(item, comments);

              return (
                <a
                  key={item.id}
                  href={`/arena/${item.id}`}
                  className="border border-white/10 bg-black/25 p-3 transition hover:border-cyan-300/40"
                >
                  <div className="line-clamp-2 text-sm font-black text-zinc-100">
                    {item.title}
                  </div>
                  <div className="mt-2 text-xs font-bold text-zinc-500">
                    {relatedStats.aPercent}:{relatedStats.bPercent} · 댓글{" "}
                    {relatedStats.commentCount}
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      ) : null}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#08090d]/95 p-2 backdrop-blur">
        <div className="mx-auto grid max-w-5xl gap-2 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
          <div className="grid grid-cols-2 gap-1">
            {(["A", "B"] as Side[]).map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => setSelectedSide(side)}
                disabled={!canJoinArena}
                className={`min-h-10 border px-3 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  selectedSide === side
                    ? side === "A"
                      ? "border-rose-300 bg-rose-300 text-black"
                      : "border-sky-300 bg-sky-300 text-black"
                    : "border-white/10 bg-black/40 text-zinc-400 hover:border-white/30"
                }`}
              >
                {side === "A" ? arena.optionA : arena.optionB}
              </button>
            ))}
          </div>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={!canJoinArena}
            placeholder={`${selectedOption} 편으로 한마디 남기기...`}
            className="min-h-11 w-full border border-white/10 bg-black/50 px-4 text-sm font-bold text-white outline-none placeholder:text-zinc-600 focus:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            maxLength={1200}
            aria-label="하단 고정 댓글 입력"
          />
          <button
            onClick={addComment}
            disabled={!canSubmitComment}
            className="min-h-11 border border-cyan-300 bg-cyan-300 px-5 text-sm font-black text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-zinc-500"
          >
            댓글쓰기
          </button>
          <div className="flex min-w-0 gap-1 overflow-x-auto lg:col-span-3">
            {commentTemplates.map((template) => (
              <button
                key={template.label}
                type="button"
                onClick={() => applyCommentTemplate(template.text)}
                disabled={!canJoinArena}
                className="shrink-0 border border-white/10 bg-black/30 px-3 py-2 text-[11px] font-black text-zinc-400 transition hover:border-amber-300 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
