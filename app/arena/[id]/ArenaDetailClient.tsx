"use client";

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
  statusMeta,
} from "@/lib/arena-data";

type ArenaDetailClientProps = {
  arena: Arena;
  initialComments: ArenaComment[];
};

type CommentTab = "new" | "popular" | "A" | "B";
type LocalReaction = "fact" | "stretch" | "knockout" | "funny" | "meme";
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
const reactionButtons: { type: LocalReaction; label: string }[] = [
  { type: "fact", label: "인정" },
  { type: "stretch", label: "개소리" },
  { type: "knockout", label: "반박마려움" },
  { type: "funny", label: "웃김" },
  { type: "meme", label: "논리승" },
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
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [likedCommentIds, setLikedCommentIds] = useState<Set<number>>(new Set());
  const [reactedKeys, setReactedKeys] = useState<Set<string>>(new Set());
  const [freshCommentIds, setFreshCommentIds] = useState<Set<number>>(new Set());
  const [lastCommentAt, setLastCommentAt] = useState(0);
  const [abuseNotice, setAbuseNotice] = useState("");
  const [shareNotice, setShareNotice] = useState("");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
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
      ? `${opposingOption} 쪽 말 안 먹히는 이유 한 방 먹여주세요.`
      : `${opposingOption} 쪽 주장에 반박해보세요.`;
  const warSummary =
    stats.gap <= 5
      ? "거의 반반입니다. 댓글 한 방에 분위기 뒤집힐 수 있습니다."
      : stats.aPercent > stats.bPercent
        ? `${arena.optionA} 진영이 앞서는 중. ${arena.optionB} 쪽 반박이 필요한 상황입니다.`
        : `${arena.optionB} 진영이 앞서는 중. ${arena.optionA} 쪽이 밀리는 중입니다.`;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    const liked = window.localStorage.getItem("vs-arena-liked-comments");
    const reacted = window.localStorage.getItem("vs-arena-reacted-keys");
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
    setIsComposerOpen(true);
    window.localStorage.setItem(`vs_arena_vote_${arena.id}`, side);
    persistParticipation(side);
    setAbuseNotice(
      `참전 완료. 당신은 ${side === "A" ? arena.optionA : arena.optionB} 진영에 섰습니다.`
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
    setAbuseNotice("등록 완료. 이제 상대 진영 반응 기다리면 됨.");
    window.setTimeout(() => {
      document
        .getElementById("comment-zone")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
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

  const reactToComment = (id: number, reaction: LocalReaction) => {
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

  const prepareReply = (comment: ArenaComment) => {
    const replySide = comment.side === "A" ? "B" : "A";
    const shortQuote =
      comment.text.length > 42 ? `${comment.text.slice(0, 42)}...` : comment.text;

    setSelectedSide(replySide);
    setVotedSide(replySide);
    setDraft(
      `"${shortQuote}" 이 말에 답글: `
    );
    setIsComposerOpen(true);
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

  const shareArena = async () => {
    const url = `${window.location.origin}/arena/${arena.id}`;
    const text = `“${arena.title}”\n너는 어느 쪽임?\nVS Arena에서 투표해봐\n${url}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${arena.title} | VS Arena`,
          text,
          url,
        });
        setShareNotice("공유창 열림. 친구한테 판정 맡겨보세요.");
      } else {
        await navigator.clipboard.writeText(text);
        setShareNotice("논쟁 링크 복사됨. 친구한테 판정 맡겨보세요.");
      }
    } catch {
      setShareNotice("공유가 취소됐어요. 링크 복사는 언제든 다시 가능함.");
    }

    window.setTimeout(() => setShareNotice(""), 2600);
  };

  const renderCommentCard = (comment: ArenaComment, index: number) => {
    const isExpanded = expandedIds.has(comment.id);
    const dislikes = Math.max(0, Math.floor((getReactionTotal(comment) - comment.likes / 3) / 2));
    const replies = Math.max(0, Math.floor((comment.likes + getReactionTotal(comment)) / 18));
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
        className={`border bg-white/[0.028] transition hover:border-white/20 ${
          index === 0 && sortType !== "new" ? "border-[#E7B933]/35" : "border-white/10"
        }`}
      >
        <div className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center">
          <button
            onClick={() => toggleExpanded(comment.id)}
            className="min-w-0 text-left"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`border px-2 py-1 text-xs font-black ${sideTone.border} ${sideTone.bg} ${sideTone.text}`}>
                {comment.side === "A" ? arena.optionA : arena.optionB}
              </span>
              {isTopComment ? (
                <span className={`border px-2 py-1 text-xs font-black ${ACCENT_TONE}`}>
                  상위 댓글
                </span>
              ) : null}
              {isFreshComment ? (
                <span className="border border-[#E7B933]/45 bg-[#E7B933] px-2 py-1 text-xs font-black text-black">
                  방금 참전함
                </span>
              ) : null}
              <span className="text-sm font-bold text-zinc-300">
                {comment.nickname}
              </span>
              <span className="text-xs font-bold text-zinc-600">{timeLabel}</span>
            </div>

            <p className="line-clamp-2 leading-relaxed text-zinc-100">
              {comment.text}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-zinc-600">
              <span>공감 {comment.likes}</span>
              <span>비공감 {dislikes}</span>
              <span>답글 {replies}</span>
              {isExpanded ? <span>접기</span> : null}
            </div>
          </button>

          <div className="grid grid-cols-3 gap-1 text-xs font-black sm:grid-cols-2">
            {reactionButtons.map((reaction) => (
              <button
                key={reaction.type}
                onClick={() =>
                  reaction.type === "fact"
                    ? likeComment(comment.id)
                    : reactToComment(comment.id, reaction.type)
                }
                className={`border px-2 py-2 transition ${
                  reaction.type === "fact"
                    ? `${ACCENT_TONE} hover:bg-[#E7B933] hover:text-black`
                    : "border-white/10 bg-black/25 text-zinc-300 hover:border-white/30"
                }`}
              >
                {reaction.label}
              </button>
            ))}
            <button
              onClick={() => prepareReply(comment)}
              className="border border-white/10 bg-black/25 px-2 py-2 text-zinc-300 transition hover:border-[#E7B933]/60 hover:text-[#F0D77A]"
            >
              답글 {replies}
            </button>
          </div>
        </div>

        {isExpanded ? (
          <div className="border-t border-white/10 bg-black/20 p-4">
            <p className="whitespace-pre-wrap leading-relaxed text-zinc-100">
              {comment.text}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-1 sm:grid-cols-5">
              {reactionButtons.map((reaction) => (
                <button
                  key={reaction.type}
                  onClick={() =>
                    reaction.type === "fact"
                      ? likeComment(comment.id)
                      : reactToComment(comment.id, reaction.type)
                  }
                  className="min-h-10 border border-white/10 bg-black/25 px-2 text-xs font-black text-zinc-400 transition hover:border-[#E7B933]/50 hover:text-[#F0D77A]"
                >
                  <span className="block">{reaction.label}</span>
                  <span className="block text-[10px] opacity-75">
                    {reaction.type === "fact"
                      ? comment.likes
                      : comment.reactions[reaction.type]}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => toggleExpanded(comment.id)}
              className="mt-3 text-xs font-black text-zinc-500 transition hover:text-zinc-200"
            >
              접기
            </button>
          </div>
        ) : null}
      </article>
    );
  };

  return (
    <div className="min-w-0 space-y-4 pb-28">
      <section
        id="vote-zone"
        className="min-w-0 border border-white/10 bg-white/[0.035] p-4 sm:p-5"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-[#F0D77A]">
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
                  <span className="text-xs font-black text-[#F0D77A]">
                    {badge}
                  </span>
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
                  <div className={`border p-3 ${SIDE_A_TONE.border} ${SIDE_A_TONE.bg}`}>
                    <div className={`truncate text-sm font-black ${SIDE_A_TONE.text}`}>
                      {arena.optionA}
                    </div>
                    <div className="mt-1 text-4xl font-black text-white">
                      {stats.aPercent}%
                    </div>
                  </div>
                  <div className="text-xs font-black text-zinc-500">VS</div>
                  <div className={`border p-3 ${SIDE_B_TONE.border} ${SIDE_B_TONE.bg}`}>
                    <div className={`truncate text-sm font-black ${SIDE_B_TONE.text}`}>
                      {arena.optionB}
                    </div>
                    <div className="mt-1 text-4xl font-black text-white">
                      {stats.bPercent}%
                    </div>
                  </div>
                </div>
              </div>
              <div className={`border p-4 text-center ${ACCENT_TONE}`}>
                <div className="text-xs font-black">
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
              <div className="text-base font-black text-[#F0D77A] sm:text-lg">
                {stats.displayComments.toLocaleString()}
              </div>
              <div className="text-xs text-zinc-500">누적 댓글</div>
            </div>
            <div className="border-r border-white/10 px-3 py-3">
              <div className="text-base font-black text-[#F0D77A] sm:text-lg">
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
        <div className={`mt-4 border px-4 py-3 text-sm font-black leading-relaxed ${ACCENT_TONE}`}>
          전황 요약: {warSummary} 최근 10분 댓글은 {stats.recentTenComments}개,
          1시간 투표는 {stats.recentHourVotes}개 붙었습니다.
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_220px]">
          <div className="border border-white/10 bg-black/25 px-4 py-3 text-xs font-bold leading-relaxed text-zinc-400">
            친구 의견 갈릴 판이면 바로 던져보세요. 단톡방 판정 들어오면 더 재밌어짐.
          </div>
          <button
            type="button"
            onClick={shareArena}
            className="border border-[#E7B933]/45 bg-[#E7B933]/12 px-4 py-3 text-sm font-black text-[#F0D77A] transition hover:bg-[#E7B933] hover:text-black"
          >
            친구한테 판정 맡기기
          </button>
        </div>
        {shareNotice ? (
          <div className="mt-2 border border-[#E7B933]/35 bg-[#E7B933]/10 px-4 py-2 text-xs font-black text-[#F0D77A]">
            {shareNotice}
          </div>
        ) : null}

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-black text-white">내 편 고르기</h2>
            <span className="text-xs font-black text-[#F0D77A]">
              고르면 바로 민심 보임
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => voteForSide("A")}
              disabled={!canJoinArena}
              className={`min-w-0 border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 sm:p-5 ${
                selectedSide === "A"
                ? `${SIDE_A_TONE.border} ${SIDE_A_TONE.bg}`
                : `border-white/10 bg-black/30 hover:${SIDE_A_TONE.border}`
              }`}
            >
              <div className={`text-xs font-bold ${SIDE_A_TONE.text}`}>A 진영</div>
              <div className="mt-1 break-keep text-2xl font-black text-white sm:text-3xl">
                {arena.optionA}
              </div>
              <div className="mt-3 text-sm text-zinc-400">
                {stats.aPercent}% 지지
              </div>
              <div className={`mt-4 px-4 py-3 text-center text-sm font-black ${SIDE_A_TONE.solid}`}>
                {arena.optionA} 편 들기
              </div>
            </button>

            <button
              onClick={() => voteForSide("B")}
              disabled={!canJoinArena}
              className={`min-w-0 border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 sm:p-5 ${
                selectedSide === "B"
                ? `${SIDE_B_TONE.border} ${SIDE_B_TONE.bg}`
                : `border-white/10 bg-black/30 hover:${SIDE_B_TONE.border}`
              }`}
            >
              <div className={`text-xs font-bold ${SIDE_B_TONE.text}`}>B 진영</div>
              <div className="mt-1 break-keep text-2xl font-black text-white sm:text-3xl">
                {arena.optionB}
              </div>
              <div className="mt-3 text-sm text-zinc-400">
                {stats.bPercent}% 지지
              </div>
              <div className={`mt-4 px-4 py-3 text-center text-sm font-black ${SIDE_B_TONE.solid}`}>
                {arena.optionB} 편 들기
              </div>
            </button>
          </div>
        </div>

        <div className="mt-5 h-3 overflow-hidden bg-white/10">
          <div
            className="inline-block h-full bg-[#A53A4A] transition-all"
            style={{ width: `${stats.aPercent}%` }}
          />
          <div
            className="inline-block h-full bg-[#2D6A9F] transition-all"
            style={{ width: `${stats.bPercent}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs font-black text-zinc-500">
          <span>{arena.optionA} {stats.aPercent}%</span>
          <span>{arena.optionB} {stats.bPercent}%</span>
        </div>
        {votedSide ? (
          <div
            id="quick-comment"
            className="mt-5 border border-white/10 bg-black/30 p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm font-black text-white">
                  투표 완료. 이제 한마디 박아보세요.
                </div>
                <div className="mt-1 text-xs font-bold text-zinc-500">
                  당신은 {votedSide === "A" ? arena.optionA : arena.optionB} 진영에 참전했습니다.
                </div>
              </div>
              <button
                type="button"
                onClick={changeNickname}
                className="border border-white/10 px-3 py-2 text-xs font-black text-zinc-400 transition hover:border-[#E7B933]/50 hover:text-[#F0D77A]"
              >
                오늘의 닉네임: {nickname || "생성중"} · 변경
              </button>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px]">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                disabled={!canJoinArena}
                placeholder={draftPlaceholder}
                className="min-h-12 w-full border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none placeholder:text-zinc-600 focus:border-[#E7B933]/60 disabled:cursor-not-allowed disabled:opacity-60"
                maxLength={500}
                aria-label="투표 후 빠른 댓글 입력"
              />
              <button
                onClick={addComment}
                disabled={!canSubmitComment}
                aria-label="투표 후 빠른 한마디 던지기"
                className="min-h-12 border border-[#E7B933] bg-[#E7B933] px-4 text-sm font-black text-black transition hover:bg-[#F0D77A] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-zinc-500"
              >
                한마디 던지기
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {hotComment ? (
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
            <button
              onClick={() => setSelectedSide(hotComment.side === "A" ? "B" : "A")}
              disabled={!canJoinArena}
              className="w-full border border-white/10 px-3 py-2 text-xs font-black text-zinc-300 transition hover:border-[#E7B933]/60 hover:text-[#F0D77A] disabled:cursor-not-allowed disabled:opacity-50 sm:ml-auto sm:w-auto sm:py-1.5"
            >
              이 댓글에 반박하기
            </button>
          </div>
        </section>
      ) : null}

      <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_270px]">
        <section id="comment-zone" className="min-w-0 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-white">
                피 튀기는 댓글 현장
              </h2>
              <p className="mt-1 text-xs font-bold text-zinc-600">
                읽다가 못 참겠으면 아래 입력창에서 바로 끼어들면 됨.
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

        <aside className="hidden min-w-0 space-y-4 lg:block">
          <div id="comment-write" className="border border-white/10 bg-white/[0.035] p-3">
            <h2 className="text-sm font-black text-zinc-300">
              {canJoinArena ? "한마디 남기기" : "관전석"}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              {canJoinArena
                ? "길게 말고, 걸리는 지점만 짧게."
                : "예정 또는 종료된 경기는 댓글 작성이 잠겨 있음."}
            </p>
            <div className={`mt-3 border px-3 py-2 text-xs font-black ${ACCENT_TONE}`}>
              오늘의 닉네임: {nickname || "생성중"}
            </div>

            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              disabled={!canJoinArena}
              className="mt-3 w-full border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-[#E7B933]/60 disabled:cursor-not-allowed disabled:opacity-60"
              maxLength={16}
              aria-label="닉네임"
            />
            <button
              type="button"
              onClick={changeNickname}
              className="mt-2 w-full border border-white/10 px-3 py-2 text-xs font-black text-zinc-400 transition hover:border-[#E7B933]/50 hover:text-[#F0D77A]"
            >
              오늘의 닉네임 변경
            </button>
            <div className="mt-3 text-xs font-black text-zinc-500">
              너는 누구 편?
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
            {(["A", "B"] as Side[]).map((side) => (
                <button
                  key={side}
                  onClick={() => voteForSide(side)}
                  disabled={!canJoinArena}
                  className={`border px-2 py-2 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    selectedSide === side
                      ? side === "A"
                        ? SIDE_A_TONE.solid
                        : SIDE_B_TONE.solid
                      : "border-white/10 bg-black/30 text-zinc-400 hover:border-white/30"
                  }`}
                >
                  {side === "A" ? arena.optionA : arena.optionB}
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
              className="mt-3 min-h-28 w-full resize-none border border-white/10 bg-black/40 p-3 text-sm leading-relaxed text-white outline-none transition placeholder:text-zinc-600 focus:border-[#E7B933]/60 disabled:cursor-not-allowed disabled:opacity-60"
              maxLength={500}
            />
            <div className="mt-2 flex items-center justify-between gap-3 text-xs font-bold text-zinc-600">
              <span>{draft.trim().length}/500</span>
              <span>
                {cooldownLeftMs > 0
                  ? `${cooldownLeftSeconds}초 쿨다운`
                  : "바로 작성 가능"}
              </span>
            </div>
            {abuseNotice ? (
              <div className={`mt-3 border px-4 py-3 text-xs font-bold ${ACCENT_TONE}`}>
                {abuseNotice}
              </div>
            ) : null}
            <button
              onClick={addComment}
              disabled={!canSubmitComment}
              className="mt-3 w-full border border-[#E7B933] bg-[#E7B933] px-5 py-2.5 text-sm font-black text-black transition hover:bg-[#F0D77A] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-zinc-500"
            >
              {canJoinArena
                ? cooldownLeftMs > 0
                  ? "쿨다운 중"
                  : "한마디 던지기"
                : "구경 중"}
            </button>
          </div>
        </aside>
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
                  className="border border-white/10 bg-black/25 p-3 transition hover:border-[#E7B933]/45"
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
      {isComposerOpen ? (
        <div className="fixed inset-x-0 bottom-[74px] z-30 border-t border-white/10 bg-[#08090d]/98 p-3 shadow-2xl shadow-black/60 backdrop-blur lg:hidden">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-black text-zinc-400">
              {selectedOption} 편으로 작성 중
            </span>
            <button
              type="button"
              onClick={() => setIsComposerOpen(false)}
              className="text-xs font-black text-zinc-500"
            >
              닫기
            </button>
          </div>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={!canJoinArena}
            placeholder={draftPlaceholder}
            className="min-h-24 w-full resize-none border border-white/10 bg-black/50 p-3 text-sm leading-relaxed text-white outline-none placeholder:text-zinc-600 focus:border-[#E7B933]/60 disabled:cursor-not-allowed disabled:opacity-60"
            maxLength={500}
          />
          <div className="mt-2 flex items-center justify-between text-xs font-bold text-zinc-600">
            <span>{draft.trim().length}/500</span>
            <span>{cooldownLeftMs > 0 ? `${cooldownLeftSeconds}초 쿨다운` : "바로 작성 가능"}</span>
          </div>
        </div>
      ) : null}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#08090d]/95 p-2 backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-[auto_minmax(0,1fr)_auto] gap-2">
          <div className="grid grid-cols-2 gap-1">
            {(["A", "B"] as Side[]).map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => voteForSide(side)}
                disabled={!canJoinArena}
                className={`min-h-10 border px-3 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  selectedSide === side
                    ? side === "A"
                      ? SIDE_A_TONE.solid
                      : SIDE_B_TONE.solid
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
            onFocus={() => setIsComposerOpen(true)}
            disabled={!canJoinArena}
            placeholder="한마디 남기기..."
            className="min-h-10 w-full border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none placeholder:text-zinc-600 focus:border-[#E7B933]/60 disabled:cursor-not-allowed disabled:opacity-60"
            maxLength={500}
            aria-label="하단 고정 댓글 입력"
          />
          <button
            onClick={addComment}
            disabled={!canSubmitComment}
            className="min-h-10 border border-[#E7B933] bg-[#E7B933] px-4 text-sm font-black text-black transition hover:bg-[#F0D77A] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-zinc-500"
          >
            댓글쓰기
          </button>
        </div>
      </div>
    </div>
  );
}
