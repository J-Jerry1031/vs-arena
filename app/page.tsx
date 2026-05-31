"use client";

import { useMemo, useState } from "react";

type Side = "A" | "B";
type SortType = "hot" | "new";

type Debate = {
  id: number;
  title: string;
  optionA: string;
  optionB: string;
  category: string;
  participants: number;
};

type Comment = {
  id: number;
  debateId: number;
  side: Side;
  nickname: string;
  text: string;
  likes: number;
  createdAt: number;
};

const debates: Debate[] = [
  {
    id: 1,
    title: "외계인은 존재할까?",
    optionA: "있다",
    optionB: "없다",
    category: "미스터리",
    participants: 12421,
  },
  {
    id: 2,
    title: "AI는 인간을 대체할까?",
    optionA: "대체한다",
    optionB: "못 한다",
    category: "미래",
    participants: 8312,
  },
  {
    id: 3,
    title: "맨손 은가누 vs 방망이 든 오타니",
    optionA: "은가누",
    optionB: "오타니",
    category: "상상배틀",
    participants: 19204,
  },
  {
    id: 4,
    title: "민트초코는 맛인가 벌칙인가?",
    optionA: "맛이다",
    optionB: "벌칙이다",
    category: "밈",
    participants: 6771,
  },
];

const initialComments: Comment[] = [
  {
    id: 1,
    debateId: 1,
    side: "A",
    nickname: "우주광인",
    text: "우주가 이렇게 넓은데 인간만 있다는 게 더 말이 안 됨.",
    likes: 42,
    createdAt: 1,
  },
  {
    id: 2,
    debateId: 1,
    side: "B",
    nickname: "현실주의자",
    text: "있으면 왜 아직 제대로 된 증거가 하나도 없음?",
    likes: 31,
    createdAt: 2,
  },
  {
    id: 3,
    debateId: 2,
    side: "A",
    nickname: "알파고형님",
    text: "반복 업무는 이미 끝났고, 다음은 판단 업무임.",
    likes: 58,
    createdAt: 3,
  },
  {
    id: 4,
    debateId: 3,
    side: "B",
    nickname: "야구몽둥이",
    text: "방망이는 거리 조절이 된다. 이게 진짜 크다.",
    likes: 77,
    createdAt: 4,
  },
];

export default function Home() {
  const [selectedDebateId, setSelectedDebateId] = useState(1);
  const [selectedSide, setSelectedSide] = useState<Side>("A");
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [text, setText] = useState("");
  const [sortType, setSortType] = useState<SortType>("hot");
  const [category, setCategory] = useState("전체");

  const categories = ["전체", ...Array.from(new Set(debates.map((d) => d.category)))];

  const filteredDebates =
    category === "전체"
      ? debates
      : debates.filter((debate) => debate.category === category);

  const selectedDebate = debates.find((d) => d.id === selectedDebateId)!;

  const debateComments = comments
    .filter((comment) => comment.debateId === selectedDebateId)
    .sort((a, b) => {
      if (sortType === "new") return b.createdAt - a.createdAt;
      return b.likes - a.likes;
    });

  const sideCounts = useMemo(() => {
    const a = comments.filter(
      (c) => c.debateId === selectedDebateId && c.side === "A"
    ).length;

    const b = comments.filter(
      (c) => c.debateId === selectedDebateId && c.side === "B"
    ).length;

    return { a, b, total: a + b };
  }, [comments, selectedDebateId]);

  const aPercent =
    sideCounts.total === 0
      ? 50
      : Math.round((sideCounts.a / sideCounts.total) * 100);

  const bPercent = 100 - aPercent;
  const bestComment = [...debateComments].sort((a, b) => b.likes - a.likes)[0];

  const addComment = () => {
    if (!text.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      debateId: selectedDebateId,
      side: selectedSide,
      nickname: "익명의 논객",
      text,
      likes: 0,
      createdAt: Date.now(),
    };

    setComments([newComment, ...comments]);
    setText("");
  };

  const likeComment = (id: number) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === id
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      )
    );
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto max-w-6xl px-5 py-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight">VS ARENA</h1>
            <p className="mt-2 text-sm text-zinc-400">
              세상 쓸데없지만 이상하게 진심이 되는 토론장
            </p>
          </div>

          <div className="rounded-full border border-orange-500/40 bg-orange-500/10 px-5 py-2 text-sm font-bold text-orange-300">
            🔥 실시간 참전 {selectedDebate.participants.toLocaleString()}명
          </div>
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                category === item
                  ? "border-orange-500 bg-orange-500 text-black"
                  : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-3">
            <h2 className="text-sm font-bold text-zinc-400">토론 주제</h2>

            {filteredDebates.map((debate) => (
              <button
                key={debate.id}
                onClick={() => {
                  setSelectedDebateId(debate.id);
                  setSelectedSide("A");
                }}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  debate.id === selectedDebateId
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
                }`}
              >
                <div className="mb-2 text-xs text-orange-300">
                  #{debate.category}
                </div>
                <div className="font-bold">{debate.title}</div>
                <div className="mt-2 text-sm text-zinc-400">
                  {debate.optionA} vs {debate.optionB}
                </div>
                <div className="mt-3 text-xs text-zinc-500">
                  🔥 {debate.participants.toLocaleString()}명 참전 중
                </div>
              </button>
            ))}
          </aside>

          <section className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
              <div className="mb-3 text-sm text-orange-300">
                #{selectedDebate.category}
              </div>

              <h2 className="text-3xl font-black">{selectedDebate.title}</h2>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => setSelectedSide("A")}
                  className={`rounded-2xl border p-5 text-left transition ${
                    selectedSide === "A"
                      ? "border-red-400 bg-red-500/20 shadow-lg shadow-red-500/10"
                      : "border-zinc-700 bg-zinc-950 hover:border-red-400/60"
                  }`}
                >
                  <div className="text-xs text-zinc-400">A 진영</div>
                  <div className="mt-1 text-2xl font-black">
                    {selectedDebate.optionA}
                  </div>
                  <div className="mt-2 text-sm text-zinc-400">
                    현재 {aPercent}% 지지
                  </div>
                </button>

                <button
                  onClick={() => setSelectedSide("B")}
                  className={`rounded-2xl border p-5 text-left transition ${
                    selectedSide === "B"
                      ? "border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/10"
                      : "border-zinc-700 bg-zinc-950 hover:border-blue-400/60"
                  }`}
                >
                  <div className="text-xs text-zinc-400">B 진영</div>
                  <div className="mt-1 text-2xl font-black">
                    {selectedDebate.optionB}
                  </div>
                  <div className="mt-2 text-sm text-zinc-400">
                    현재 {bPercent}% 지지
                  </div>
                </button>
              </div>

              <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="bg-red-500 transition-all"
                  style={{ width: `${aPercent}%` }}
                />
                <div
                  className="bg-blue-500 transition-all"
                  style={{ width: `${bPercent}%` }}
                />
              </div>

              <div className="mt-2 flex justify-between text-xs text-zinc-500">
                <span>{selectedDebate.optionA}</span>
                <span>{selectedDebate.optionB}</span>
              </div>
            </div>

            {bestComment && (
              <div className="rounded-3xl border border-yellow-500/40 bg-gradient-to-r from-yellow-500/20 to-orange-500/10 p-5">
                <div className="mb-2 text-sm font-bold text-yellow-300">
                  👑 현재 토론왕
                </div>
                <p className="text-lg font-bold leading-relaxed">
                  “{bestComment.text}”
                </p>
                <div className="mt-3 text-sm text-zinc-300">
                  by {bestComment.nickname} · 좋아요 {bestComment.likes}
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
              <div className="mb-3 text-sm font-bold text-zinc-300">
                내 주장 남기기
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`${selectedDebate.optionA} vs ${selectedDebate.optionB}... 네 논리를 던져봐`}
                className="min-h-28 w-full resize-none rounded-2xl border border-zinc-700 bg-zinc-950 p-4 text-sm outline-none transition focus:border-orange-500"
              />

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-sm text-zinc-400">
                  선택 진영:{" "}
                  <span className="font-bold text-white">
                    {selectedSide === "A"
                      ? selectedDebate.optionA
                      : selectedDebate.optionB}
                  </span>
                </div>

                <button
                  onClick={addComment}
                  className="rounded-full bg-orange-500 px-5 py-2 font-bold text-black transition hover:bg-orange-400"
                >
                  참전하기
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-400">
                  불타는 댓글
                </h3>

                <div className="flex rounded-full border border-zinc-800 bg-zinc-900 p-1">
                  <button
                    onClick={() => setSortType("hot")}
                    className={`rounded-full px-3 py-1 text-xs ${
                      sortType === "hot"
                        ? "bg-orange-500 text-black"
                        : "text-zinc-400"
                    }`}
                  >
                    좋아요순
                  </button>
                  <button
                    onClick={() => setSortType("new")}
                    className={`rounded-full px-3 py-1 text-xs ${
                      sortType === "new"
                        ? "bg-orange-500 text-black"
                        : "text-zinc-400"
                    }`}
                  >
                    최신순
                  </button>
                </div>
              </div>

              {debateComments.map((comment, index) => (
                <div
                  key={comment.id}
                  className={`rounded-2xl border bg-zinc-900 p-4 transition hover:-translate-y-0.5 hover:border-orange-500/50 ${
                    index === 0 && sortType === "hot"
                      ? "border-orange-500/50"
                      : "border-zinc-800"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      {index === 0 && sortType === "hot" && (
                        <span className="rounded-full bg-yellow-500 px-2 py-1 text-xs font-black text-black">
                          HOT
                        </span>
                      )}

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          comment.side === "A"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {comment.side === "A"
                          ? selectedDebate.optionA
                          : selectedDebate.optionB}
                      </span>

                      <span className="text-sm text-zinc-400">
                        {comment.nickname}
                      </span>
                    </div>

                    <button
                      onClick={() => likeComment(comment.id)}
                      className="rounded-full border border-zinc-700 px-3 py-1 text-sm transition hover:border-orange-400 hover:text-orange-300"
                    >
                      👍 {comment.likes}
                    </button>
                  </div>

                  <p className="leading-relaxed text-zinc-100">
                    {comment.text}
                  </p>
                </div>
              ))}

              {debateComments.length === 0 && (
                <div className="rounded-2xl border border-dashed border-zinc-700 p-8 text-center text-zinc-500">
                  아직 댓글이 없어. 첫 논객이 되어봐.
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}