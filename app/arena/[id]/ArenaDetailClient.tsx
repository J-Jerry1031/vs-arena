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

const sortLabels: Record<SortType, string> = {
  hot: "핫한순",
  new: "최신순",
  best: "베스트순",
};

const COMMENT_COOLDOWN_MS = 10_000;

export default function ArenaDetailClient({
  arena,
  initialComments,
}: ArenaDetailClientProps) {
  const [comments, setComments] = useState<ArenaComment[]>(initialComments);
  const [sortType, setSortType] = useState<SortType>("hot");
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
  const stats = getArenaStats(arena, comments);
  const hotComment = getArenaHotComment(arena.id, comments);
  const badge = getArenaBadge(arena, comments);
  const arenaHeat = Math.min(100, arena.heat + arenaComments.length * 2);
  const cooldownLeftMs =
    lastCommentAt > 0 ? Math.max(0, COMMENT_COOLDOWN_MS - (now - lastCommentAt)) : 0;
  const cooldownLeftSeconds = Math.ceil(cooldownLeftMs / 1000);
  const canSubmitComment = canJoinArena && cooldownLeftMs === 0 && draft.trim().length >= 5;

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

    return (
      <article
        key={comment.id}
        className={`border bg-white/[0.035] transition hover:border-cyan-300/50 ${
          index === 0 && sortType !== "new"
            ? "border-amber-300/40"
            : "border-white/10"
        }`}
      >
        <div className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_96px] sm:items-center">
          <button
            onClick={() => toggleExpanded(comment.id)}
            className="min-w-0 text-left"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {index === 0 && sortType !== "new" ? (
                <span className="bg-amber-300 px-2 py-1 text-xs font-black text-black">
                  HOT
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
            </div>

            <p className="line-clamp-2 leading-relaxed text-zinc-100">
              {comment.text}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-zinc-600">
              <span>점수 {score}</span>
              <span>반응 {getReactionTotal(comment)}</span>
              <span>{isExpanded ? "접기" : "펼쳐서 투표"}</span>
            </div>
          </button>

          <button
            onClick={() => likeComment(comment.id)}
            className="border border-white/10 px-3 py-2 text-sm font-bold text-zinc-300 transition hover:border-amber-300 hover:text-amber-200"
          >
            추천 {comment.likes}
          </button>
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
    <div className="space-y-5">
      <section className="border border-amber-300/30 bg-white/[0.04] p-5 shadow-2xl shadow-cyan-950/20 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-cyan-300">
                #{arena.category}
              </span>
              <span
                className={`border px-2 py-1 text-xs font-bold ${
                  arena.status === "main" ? "animate-pulse" : ""
                } ${statusMeta[arena.status].tone}`}
              >
                {arena.status === "main" ? "NOW BURNING" : statusMeta[arena.status].label}
              </span>
              <span className="border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs font-black text-amber-200">
                {badge}
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-5xl">
              {arena.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400">
              {arena.openingLine}
            </p>
          </div>

          <div className="grid min-w-64 grid-cols-3 border border-white/10 bg-black/25 text-center">
            <div className="border-r border-white/10 px-3 py-3">
              <div className="text-lg font-black text-white">
                {stats.commentCount}
              </div>
              <div className="text-xs text-zinc-500">댓글</div>
            </div>
            <div className="border-r border-white/10 px-3 py-3">
              <div className="text-lg font-black text-amber-300">
                {arenaHeat}
              </div>
              <div className="text-xs text-zinc-500">열기</div>
            </div>
            <div className="px-3 py-3">
              <div className="text-lg font-black text-white">
                {stats.aPercent}:{stats.bPercent}
              </div>
              <div className="text-xs text-zinc-500">여론</div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => setSelectedSide("A")}
            disabled={!canJoinArena}
            className={`border p-5 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
              selectedSide === "A"
                ? "border-rose-300 bg-rose-400/15"
                : "border-white/10 bg-black/30 hover:border-rose-300/60"
            }`}
          >
            <div className="text-xs font-bold text-rose-200">A 진영</div>
            <div className="mt-1 text-3xl font-black text-white">
              {arena.optionA}
            </div>
            <div className="mt-3 text-sm text-zinc-400">
              {stats.aPercent}% 지지
            </div>
          </button>

          <button
            onClick={() => setSelectedSide("B")}
            disabled={!canJoinArena}
            className={`border p-5 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
              selectedSide === "B"
                ? "border-sky-300 bg-sky-400/15"
                : "border-white/10 bg-black/30 hover:border-sky-300/60"
            }`}
          >
            <div className="text-xs font-bold text-sky-200">B 진영</div>
            <div className="mt-1 text-3xl font-black text-white">
              {arena.optionB}
            </div>
            <div className="mt-3 text-sm text-zinc-400">
              {stats.bPercent}% 지지
            </div>
          </button>
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
      </section>

      {hotComment ? (
        <section className="border border-amber-300/40 bg-amber-300/10 p-5">
          <div className="text-sm font-black text-amber-200">
            현재 경기 하이라이트
          </div>
          <p className="mt-3 text-xl font-black leading-relaxed text-white">
            &ldquo;{hotComment.text}&rdquo;
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
            <span>{hotComment.nickname}</span>
            <span>추천 {hotComment.likes}</span>
            <span>관전 점수 {getCommentScore(hotComment)}</span>
            <button
              onClick={() => setSelectedSide(hotComment.side === "A" ? "B" : "A")}
              disabled={!canJoinArena}
              className="ml-auto border border-white/10 px-3 py-1.5 text-xs font-black text-zinc-300 transition hover:border-cyan-300 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              이 댓글에 반박하기
            </button>
          </div>
        </section>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-sm font-black text-zinc-300">
              {canJoinArena ? "참전하기" : "관전석"}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              {canJoinArena
                ? "장문도 가능. 목록에는 두 줄만 보이고, 필요한 댓글만 펼쳐서 투표."
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
            <div className="mt-3 flex items-center border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-400">
              선택 진영:
              <strong className="ml-2 text-white">
                {selectedSide === "A" ? arena.optionA : arena.optionB}
              </strong>
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
                {selectedSide === "A" ? arena.optionA : arena.optionB}로 입장 중
              </span>
            </div>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={!canJoinArena}
              placeholder={
                canJoinArena
                  ? "짧게 꽂아도 되고, 길게 논파해도 됨. 일단 링 위로."
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
                  : "링 위에 올리기"
                : "구경 중"}
            </button>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-zinc-500">
              <div className="border border-white/10 bg-black/25 p-3">
                같은 댓글 반복 컷
              </div>
              <div className="border border-white/10 bg-black/25 p-3">
                추천/반응 중복 컷
              </div>
            </div>
          </div>

        </aside>

        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-400">
                진영별 댓글 배틀
              </h2>
              <p className="mt-1 text-xs text-zinc-600">
                좌우 진영으로 훑고, 댓글 행을 눌러 전문과 투표를 열기.
              </p>
            </div>
            <div className="grid w-full grid-cols-3 border border-white/10 bg-black/25 p-1 sm:w-auto sm:min-w-64">
              {(["hot", "new", "best"] as SortType[]).map((sort) => (
                <button
                  key={sort}
                  onClick={() => setSortType(sort)}
                  className={`px-3 py-2 text-xs font-black transition ${
                    sortType === sort
                      ? "bg-cyan-300 text-black"
                      : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {sortLabels[sort]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            <div className="space-y-3 border border-rose-300/20 bg-rose-400/[0.03] p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-black text-rose-200">
                  A. {arena.optionA}
                </div>
                <div className="text-xs text-zinc-500">
                  {sideAComments.length}개 주장
                </div>
              </div>
              {sideAComments.map((comment, index) =>
                renderCommentCard(comment, index)
              )}
            </div>

            <div className="space-y-3 border border-sky-300/20 bg-sky-400/[0.03] p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-black text-sky-200">
                  B. {arena.optionB}
                </div>
                <div className="text-xs text-zinc-500">
                  {sideBComments.length}개 주장
                </div>
              </div>
              {sideBComments.map((comment, index) =>
                renderCommentCard(comment, index)
              )}
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
