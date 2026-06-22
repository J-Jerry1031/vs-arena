import type { Arena } from "@/lib/arena-data";

const shareTitleOverrides: Partial<Record<number, string>> = {
  3: "답장 느리면 관심 없음 vs 그냥 그런 사람",
  4: "월급 500 지옥 vs 월급 300 평화",
  9: "커피 평생 금지 vs 라면 평생 금지",
  10: "사진 사기 vs 대화 노잼",
  73: "인터넷 없이 살기 vs 친구 없이 살기",
};

const shortenOption = (option: string) =>
  option.length > 15 ? `${option.slice(0, 14)}…` : option;

export const getArenaShareTitle = (arena: Arena) =>
  shareTitleOverrides[arena.id] ??
  `${shortenOption(arena.optionA)} vs ${shortenOption(arena.optionB)}`;

export const getArenaShareText = (arena: Arena) =>
  `나는 골랐는데, 너는 뭐 고를래?\n${getArenaShareTitle(arena)}`;

export const getArenaOgTitle = (arena: Arena) =>
  `${getArenaShareTitle(arena)} | VS Arena`;

export const ARENA_SHARE_DESCRIPTION =
  "너라면 어느 쪽? 선택하고 사람들 의견을 확인해봐.";
