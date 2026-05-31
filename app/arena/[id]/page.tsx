import Link from "next/link";
import { notFound } from "next/navigation";
import { arenas, initialComments } from "@/lib/arena-data";
import ArenaDetailClient from "./ArenaDetailClient";

type ArenaPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return arenas.map((arena) => ({ id: String(arena.id) }));
}

export default async function ArenaPage({ params }: ArenaPageProps) {
  const { id } = await params;
  const arena = arenas.find((item) => item.id === Number(id));

  if (!arena) notFound();

  return (
    <main className="min-h-screen bg-[#08090d] text-zinc-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="border border-white/10 px-3 py-2 text-sm font-black text-zinc-300 transition hover:border-cyan-300 hover:text-cyan-200"
          >
            ← 로비로
          </Link>
          <div className="text-xs font-black uppercase tracking-[0.32em] text-cyan-300">
            VS ARENA / Battle Room
          </div>
        </header>

        <ArenaDetailClient arena={arena} initialComments={initialComments} />
      </div>
    </main>
  );
}
