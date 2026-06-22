"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  type Arena,
  type ArenaComment,
  type Side,
  LOCAL_COMMENTS_STORAGE_KEY,
  arenas,
  getArenaStatsWithLocalComments,
  getCommentScore,
  initialComments,
} from "@/lib/arena-data";

type HomeCategory = {
  id: string;
  label: string;
  categories: string[];
};

type LocalComment = ArenaComment & {
  isLocal?: boolean;
};

type SuggestionForm = {
  question: string;
  optionA: string;
  optionB: string;
  nickname: string;
};

type HomeEventName = "home_view" | "vote" | "comment" | "share";

const homeCategories: HomeCategory[] = [
  { id: "all", label: "전체", categories: [] },
  { id: "relationship", label: "연애/인간관계", categories: ["연애"] },
  { id: "reality", label: "돈/직장", categories: ["돈", "직장"] },
  { id: "life", label: "생활/취향", categories: ["생활", "선택지옥"] },
];

const homeArenaIds = [4, 3, 9, 114, 73, 10, 45, 117, 115, 58, 63, 64, 55, 33, 69, 72];
const featuredArenaId = 4;

const getHomeRank = (arena: Arena) => {
  const index = homeArenaIds.indexOf(arena.id);

  return index === -1 ? 999 : index;
};

const getHomeArenas = () =>
  arenas
    .filter((arena) =>
      homeCategories.some((category) => category.categories.includes(arena.category))
    )
    .sort((a, b) => getHomeRank(a) - getHomeRank(b) || b.heat - a.heat);

const getCompactTitle = (arena: Arena) =>
  arena.title.replace(` ${arena.optionA} vs ${arena.optionB}`, "");

const getArenaComments = (arenaId: number, localComments: LocalComment[] = []) =>
  [
    ...initialComments.map((comment) => ({ ...comment, isLocal: false })),
    ...localComments,
  ].filter((comment) => comment.arenaId === arenaId);

const getPopularComments = (arenaId: number, localComments: LocalComment[] = [], limit = 3) =>
  getArenaComments(arenaId, localComments)
    .sort((a, b) => getCommentScore(b) - getCommentScore(a))
    .slice(0, limit);

const getLatestComments = (arenaId: number, localComments: LocalComment[] = [], limit = 4) =>
  getArenaComments(arenaId, localComments)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);

const makeShareText = (arena: Arena) =>
  `나는 골랐는데, 너는 뭐 고를래? ${arena.optionA} vs ${arena.optionB}`;

const trackHomeEvent = (
  name: HomeEventName,
  arenaId: number,
  detail?: Record<string, string>
) => {
  try {
    const saved = JSON.parse(
      window.localStorage.getItem("vs_arena_home_events") ?? "[]"
    ) as unknown[];

    window.localStorage.setItem(
      "vs_arena_home_events",
      JSON.stringify(
        [
          ...saved,
          {
            name,
            arenaId,
            detail,
            createdAt: new Date().toISOString(),
          },
        ].slice(-100)
      )
    );
  } catch {
    window.localStorage.setItem(
      "vs_arena_home_events",
      JSON.stringify([
        {
          name,
          arenaId,
          detail,
          createdAt: new Date().toISOString(),
        },
      ])
    );
  }
};

const MiniArenaCard = ({
  arena,
  localComments,
}: {
  arena: Arena;
  localComments: LocalComment[];
}) => {
  const stats = getArenaStatsWithLocalComments(arena, localComments);

  return (
    <Link
      href={`/arena/${arena.id}`}
      className="block border border-white/10 bg-[#151821] p-4 transition hover:border-[#E7B933]/45 hover:bg-[#181c27]"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-black text-zinc-400">
          {arena.category}
        </span>
        <span className="text-xs font-bold text-zinc-500">
          참여 {stats.voteCount.toLocaleString()} · 댓글 {stats.commentCount}
        </span>
      </div>
      <h3 className="mt-3 line-clamp-2 break-keep text-base font-black leading-snug text-white">
        {arena.title}
      </h3>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center text-xs font-black text-zinc-200">
        <span className="truncate border border-[#A53A4A]/35 bg-[#A53A4A]/14 px-2 py-2">
          {arena.optionA}
        </span>
        <span className="text-zinc-600">VS</span>
        <span className="truncate border border-[#2D6A9F]/35 bg-[#2D6A9F]/14 px-2 py-2">
          {arena.optionB}
        </span>
      </div>
    </Link>
  );
};

export default function Home() {
  const [selectedSide, setSelectedSide] = useState<Side | null>(null);
  const [activeCategory, setActiveCategory] = useState(homeCategories[0].id);
  const [nickname, setNickname] = useState("");
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState<LocalComment[]>([]);
  const [toast, setToast] = useState("");
  const [suggestion, setSuggestion] = useState<SuggestionForm>({
    question: "",
    optionA: "",
    optionB: "",
    nickname: "",
  });
  const [suggestionDone, setSuggestionDone] = useState(false);
  const homeArenas = useMemo(() => getHomeArenas(), []);
  const featuredArena =
    homeArenas.find((arena) => arena.id === featuredArenaId) ?? homeArenas[0];
  const featuredStats = getArenaStatsWithLocalComments(featuredArena, localComments);
  const activeCategoryData =
    homeCategories.find((category) => category.id === activeCategory) ?? homeCategories[0];
  const categoryArenas =
    activeCategoryData.id === "all"
      ? homeArenas
      : homeArenas.filter((arena) =>
          activeCategoryData.categories.includes(arena.category)
        );
  const dividedArenas = [...homeArenas]
    .filter((arena) => arena.id !== featuredArena.id)
    .sort((a, b) => {
      const aStats = getArenaStatsWithLocalComments(a, localComments);
      const bStats = getArenaStatsWithLocalComments(b, localComments);
      const aGap = Math.abs(aStats.aPercent - aStats.bPercent);
      const bGap = Math.abs(bStats.aPercent - bStats.bPercent);

      return aGap - bGap || getHomeRank(a) - getHomeRank(b);
    })
    .slice(0, 6);
  const commentHeavyArenas = [...homeArenas]
    .filter((arena) => arena.id !== featuredArena.id)
    .sort(
      (a, b) =>
        getArenaStatsWithLocalComments(b, localComments).commentCount -
          getArenaStatsWithLocalComments(a, localComments).commentCount ||
        getHomeRank(a) - getHomeRank(b)
    )
    .slice(0, 6);
  const latestArenas = [...homeArenas]
    .filter((arena) => arena.id !== featuredArena.id)
    .sort((a, b) => b.id - a.id)
    .slice(0, 6);
  const representativeComments = getPopularComments(featuredArena.id, localComments, 2);
  const latestComments = getLatestComments(featuredArena.id, localComments, 4);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedVote = window.localStorage.getItem(`vs_arena_vote_${featuredArena.id}`);
      const savedComments =
        window.localStorage.getItem(LOCAL_COMMENTS_STORAGE_KEY) ??
        window.localStorage.getItem("vs_arena_home_comments");

      if (savedVote === "A" || savedVote === "B") {
        setSelectedSide(savedVote);
      }

      if (savedComments) {
        try {
          const parsedComments = JSON.parse(savedComments) as LocalComment[];

          setLocalComments(parsedComments);
          window.localStorage.setItem(
            LOCAL_COMMENTS_STORAGE_KEY,
            JSON.stringify(parsedComments)
          );
          window.localStorage.removeItem("vs_arena_home_comments");
        } catch {
          setLocalComments([]);
        }
      }

      trackHomeEvent("home_view", featuredArena.id);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [featuredArena.id]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const vote = (side: Side) => {
    setSelectedSide(side);
    window.localStorage.setItem(`vs_arena_vote_${featuredArena.id}`, side);
    trackHomeEvent("vote", featuredArena.id, { side });
    showToast(`${side === "A" ? featuredArena.optionA : featuredArena.optionB} 골랐어`);
  };

  const submitComment = () => {
    if (!selectedSide || !commentText.trim()) {
      showToast("먼저 하나 고르고 한마디 남겨줘");
      return;
    }

    const nextComment: LocalComment = {
      id: Date.now(),
      arenaId: featuredArena.id,
      side: selectedSide,
      nickname: nickname.trim() || "익명",
      text: commentText.trim(),
      score: 0,
      likes: 0,
      reactions: {
        knockout: 0,
        meme: 0,
        stretch: 0,
        fact: 0,
        funny: 0,
      },
      createdAt: Date.now(),
      isLocal: true,
    };
    const nextComments = [nextComment, ...localComments].slice(0, 100);

    setLocalComments(nextComments);
    window.localStorage.setItem(
      LOCAL_COMMENTS_STORAGE_KEY,
      JSON.stringify(nextComments)
    );
    trackHomeEvent("comment", featuredArena.id, { side: selectedSide });
    setCommentText("");
    showToast("댓글 남겼어. 이제 반응 볼 차례");
  };

  const copyLink = async (arena: Arena) => {
    const url = `${window.location.origin}/arena/${arena.id}`;

    try {
      await navigator.clipboard.writeText(`${makeShareText(arena)}\n${url}`);
      trackHomeEvent("share", arena.id, { channel: "copy" });
      showToast("링크가 복사됐어");
    } catch {
      showToast("복사가 막혔어. 주소창 링크를 복사해줘");
    }
  };

  const shareToFriend = async (arena: Arena) => {
    const url = `${window.location.origin}/arena/${arena.id}`;
    const text = makeShareText(arena);

    if (navigator.share) {
      try {
        await navigator.share({ title: `${arena.title} | VS Arena`, text, url });
        trackHomeEvent("share", arena.id, { channel: "native" });
        showToast("공유창을 열었어");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          showToast("공유가 취소됐어");
          return;
        }
      }
    }

    await copyLink(arena);
    showToast("공유 기능 대신 링크를 복사했어");
  };

  const shareToX = (arena: Arena) => {
    const url = `${window.location.origin}/arena/${arena.id}`;
    const text = makeShareText(arena);
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

    trackHomeEvent("share", arena.id, { channel: "x" });
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const nextArena = () => {
    const currentIndex = homeArenas.findIndex((arena) => arena.id === featuredArena.id);
    const next = homeArenas[(currentIndex + 1) % homeArenas.length];

    window.location.href = `/arena/${next.id}`;
  };

  const submitSuggestion = () => {
    if (!suggestion.question.trim() || !suggestion.optionA.trim() || !suggestion.optionB.trim()) {
      showToast("질문과 A/B 선택지를 채워줘");
      return;
    }

    setSuggestionDone(true);
    setSuggestion({ question: "", optionA: "", optionB: "", nickname: "" });
    showToast("제안 고마워");
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#090b10] text-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 pb-3">
          <Link href="/" className="shrink-0" aria-label="VS Arena 홈">
            <Image
              src="/brand/logo-vs-arena.png"
              alt="VS Arena"
              width={207}
              height={172}
              priority
              className="h-12 w-auto object-contain sm:h-14"
            />
          </Link>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-black text-white">둘 중 하나만 골라.</p>
            <p className="mt-1 text-xs font-bold text-zinc-500">
              사람들은 뭘 선택했을까?
            </p>
          </div>
        </header>

        {toast ? (
          <div
            role="status"
            aria-live="polite"
            className="fixed left-1/2 top-4 z-50 -translate-x-1/2 border border-[#E7B933]/40 bg-[#151821] px-4 py-3 text-sm font-black text-[#F0D77A] shadow-2xl shadow-black/40"
          >
            {toast}
          </div>
        ) : null}

        <section className="rounded-none border border-white/10 bg-[#11141c] p-4 shadow-xl shadow-black/30 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black text-[#E7B933]">오늘의 아레나</p>
              <p className="mt-1 text-sm font-bold text-zinc-400">
                너라면 뭐 고름?
              </p>
            </div>
            <div className="text-right text-xs font-bold text-zinc-500">
              <div>참여 {featuredStats.voteCount.toLocaleString()}명</div>
              <div>댓글 {featuredStats.commentCount}개</div>
            </div>
          </div>

          <h1 className="mt-4 break-keep text-3xl font-black leading-tight text-white sm:text-5xl">
            {getCompactTitle(featuredArena)}
          </h1>

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <button
              type="button"
              onClick={() => vote("A")}
              aria-pressed={selectedSide === "A"}
              className={`min-h-24 border px-4 py-5 text-left transition ${
                selectedSide === "A"
                  ? "border-[#F0A0AA] bg-[#A53A4A] text-white"
                  : "border-[#A53A4A]/35 bg-[#A53A4A]/14 text-white hover:border-[#F0A0AA]"
              }`}
            >
              <span className="block text-xs font-black text-[#F0A0AA]">A 선택</span>
              <span className="mt-2 block break-keep text-2xl font-black leading-tight">
                {featuredArena.optionA}
              </span>
            </button>
            <div className="grid h-12 place-items-center border border-white/10 bg-black/30 px-5 text-xl font-black text-white sm:h-24">
              VS
            </div>
            <button
              type="button"
              onClick={() => vote("B")}
              aria-pressed={selectedSide === "B"}
              className={`min-h-24 border px-4 py-5 text-left transition ${
                selectedSide === "B"
                  ? "border-[#8EC6F2] bg-[#2D6A9F] text-white"
                  : "border-[#2D6A9F]/35 bg-[#2D6A9F]/14 text-white hover:border-[#8EC6F2]"
              }`}
            >
              <span className="block text-xs font-black text-[#8EC6F2]">B 선택</span>
              <span className="mt-2 block break-keep text-2xl font-black leading-tight">
                {featuredArena.optionB}
              </span>
            </button>
          </div>

          {!selectedSide ? (
            <p className="mt-4 text-center text-sm font-bold text-zinc-500">
              투표하면 현재 민심이 보여요.
            </p>
          ) : (
            <div className="mt-5 border border-white/10 bg-[#0d1017] p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-black text-white">
                  {selectedSide}를 골랐어.
                </h2>
                <span className="text-xs font-bold text-zinc-500">
                  현재 결과
                </span>
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-sm font-black">
                    <span className={selectedSide === "A" ? "text-[#F0A0AA]" : "text-zinc-400"}>
                      A {featuredArena.optionA}
                    </span>
                    <span>{featuredStats.aPercent}%</span>
                  </div>
                  <div className="h-3 bg-white/10">
                    <div
                      className="h-full bg-[#A53A4A]"
                      style={{ width: `${featuredStats.aPercent}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm font-black">
                    <span className={selectedSide === "B" ? "text-[#8EC6F2]" : "text-zinc-400"}>
                      B {featuredArena.optionB}
                    </span>
                    <span>{featuredStats.bPercent}%</span>
                  </div>
                  <div className="h-3 bg-white/10">
                    <div
                      className="h-full bg-[#2D6A9F]"
                      style={{ width: `${featuredStats.bPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-base font-black text-white">왜 그렇게 생각해?</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)_128px]">
                  <input
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                    aria-label="댓글 닉네임"
                    placeholder="닉네임"
                    className="border border-white/10 bg-black/25 px-3 py-3 text-sm font-bold text-white outline-none placeholder:text-zinc-600 focus:border-[#E7B933]/60"
                  />
                  <input
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    aria-label="댓글 내용"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") submitComment();
                    }}
                    placeholder="왜 이쪽을 골랐어?"
                    className="border border-white/10 bg-black/25 px-3 py-3 text-sm font-bold text-white outline-none placeholder:text-zinc-600 focus:border-[#E7B933]/60"
                  />
                  <button
                    type="button"
                    onClick={submitComment}
                    className="bg-[#E7B933] px-4 py-3 text-sm font-black text-black transition hover:bg-[#F0D77A]"
                  >
                    댓글 남기기
                  </button>
                </div>
                <p className="mt-2 text-xs font-bold text-zinc-500">
                  닉네임만 입력하고 바로 댓글 달기. 가입은 나중에 해도 돼.
                </p>
              </div>
            </div>
          )}

          {selectedSide ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => copyLink(featuredArena)}
                className="border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-black text-zinc-200 transition hover:border-[#E7B933]/50"
              >
                링크 복사
              </button>
              <button
                type="button"
                onClick={() => shareToFriend(featuredArena)}
                className="border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-black text-zinc-200 transition hover:border-[#E7B933]/50"
              >
                친구에게 물어보기
              </button>
              <button
                type="button"
                onClick={() => shareToX(featuredArena)}
                className="border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-black text-zinc-200 transition hover:border-[#E7B933]/50"
              >
                X 공유
              </button>
              <button
                type="button"
                onClick={nextArena}
                className="border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-black text-zinc-200 transition hover:border-[#E7B933]/50"
              >
                다음 아레나 보기
              </button>
            </div>
          ) : null}
        </section>

        {selectedSide ? (
        <section className="grid gap-4 py-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="border border-white/10 bg-[#11141c] p-4">
            <h2 className="text-lg font-black text-white">대표 의견</h2>
            <div className="mt-3 space-y-3">
              {representativeComments.map((comment) => (
                <div key={comment.id} className="border border-white/10 bg-black/20 p-3">
                  <div className="text-xs font-black text-zinc-500">
                    {comment.side} 선택 · {comment.nickname}
                  </div>
                  <p className="mt-2 break-keep text-sm font-bold leading-relaxed text-zinc-200">
                    {comment.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-[#11141c] p-4">
            <h2 className="text-lg font-black text-white">최신 댓글</h2>
            <div className="mt-3 space-y-3">
              {latestComments.map((comment) => (
                <div key={comment.id} className="border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
                  <div className="text-xs font-black text-zinc-500">
                    {comment.side} 선택 · {comment.nickname}
                    {comment.isLocal ? " · 방금" : ""}
                  </div>
                  <p className="mt-1 break-keep text-sm font-bold leading-relaxed text-zinc-300">
                    {comment.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        ) : null}

        <nav className="flex gap-2 overflow-x-auto border-y border-white/10 py-3">
          {homeCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              aria-pressed={activeCategory === category.id}
              className={`shrink-0 border px-4 py-3 text-sm font-black transition ${
                activeCategory === category.id
                  ? "border-[#E7B933] bg-[#E7B933] text-black"
                  : "border-white/10 bg-white/[0.035] text-zinc-400 hover:border-white/25 hover:text-white"
              }`}
            >
              {category.label}
            </button>
          ))}
        </nav>

        <section className="py-5">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-white">
                {activeCategoryData.label}
              </h2>
              <p className="mt-1 text-sm font-bold text-zinc-500">
                가볍게 고르고 바로 사람들 생각 보기
              </p>
            </div>
            <span className="text-xs font-black text-zinc-600">
              {categoryArenas.length}개 아레나
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {categoryArenas.slice(0, 6).map((arena) => (
              <MiniArenaCard
                key={arena.id}
                arena={arena}
                localComments={localComments}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-4 pb-5 lg:grid-cols-3">
          {[
            { title: "오늘 많이 갈린 아레나", arenas: dividedArenas },
            { title: "댓글 많은 아레나", arenas: commentHeavyArenas },
            { title: "최신 아레나", arenas: latestArenas },
          ].map((section) => (
            <div key={section.title} className="border border-white/10 bg-[#11141c] p-4">
              <h2 className="text-lg font-black text-white">{section.title}</h2>
              <div className="mt-3 space-y-3">
                {section.arenas.slice(0, 5).map((arena) => {
                  const stats = getArenaStatsWithLocalComments(arena, localComments);

                  return (
                    <Link
                      key={arena.id}
                      href={`/arena/${arena.id}`}
                      className="block border border-white/10 bg-black/15 p-3 transition hover:border-[#E7B933]/45"
                    >
                      <div className="line-clamp-1 text-sm font-black text-white">
                        {arena.title}
                      </div>
                      <div className="mt-2 text-xs font-bold text-zinc-500">
                        {arena.optionA} vs {arena.optionB}
                      </div>
                      <div className="mt-2 text-xs font-black text-zinc-600">
                        참여 {stats.voteCount.toLocaleString()} · 댓글 {stats.commentCount} · {arena.category}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        <section className="mb-8 border border-white/10 bg-[#11141c] p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-white">주제 제안하기</h2>
              <p className="mt-1 text-sm font-bold text-zinc-500">
                실제 아레나 등록은 운영자가 확인한 뒤 올릴게.
              </p>
            </div>
            {suggestionDone ? (
              <span className="text-sm font-black text-[#E7B933]">
                제안 고마워! 운영자가 확인할게.
              </span>
            ) : null}
          </div>
          <div className="mt-4 grid gap-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_180px_120px]">
            <input
              value={suggestion.question}
              aria-label="제안할 질문"
              onChange={(event) =>
                setSuggestion((current) => ({ ...current, question: event.target.value }))
              }
              placeholder="질문"
              className="border border-white/10 bg-black/25 px-3 py-3 text-sm font-bold text-white outline-none placeholder:text-zinc-600 focus:border-[#E7B933]/60"
            />
            <input
              value={suggestion.optionA}
              aria-label="제안할 A 선택지"
              onChange={(event) =>
                setSuggestion((current) => ({ ...current, optionA: event.target.value }))
              }
              placeholder="A 선택지"
              className="border border-white/10 bg-black/25 px-3 py-3 text-sm font-bold text-white outline-none placeholder:text-zinc-600 focus:border-[#E7B933]/60"
            />
            <input
              value={suggestion.optionB}
              aria-label="제안할 B 선택지"
              onChange={(event) =>
                setSuggestion((current) => ({ ...current, optionB: event.target.value }))
              }
              placeholder="B 선택지"
              className="border border-white/10 bg-black/25 px-3 py-3 text-sm font-bold text-white outline-none placeholder:text-zinc-600 focus:border-[#E7B933]/60"
            />
            <input
              value={suggestion.nickname}
              aria-label="제안자 닉네임"
              onChange={(event) =>
                setSuggestion((current) => ({ ...current, nickname: event.target.value }))
              }
              placeholder="제안자 닉네임"
              className="border border-white/10 bg-black/25 px-3 py-3 text-sm font-bold text-white outline-none placeholder:text-zinc-600 focus:border-[#E7B933]/60"
            />
            <button
              type="button"
              onClick={submitSuggestion}
              className="bg-white px-4 py-3 text-sm font-black text-black transition hover:bg-[#E7B933]"
            >
              제안하기
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
