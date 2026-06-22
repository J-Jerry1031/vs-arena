// @ts-expect-error Node type stripping requires the explicit TypeScript extension.
import { arenas, getArenaStats, initialComments } from "../lib/arena-data.ts";
// @ts-expect-error Node type stripping requires the explicit TypeScript extension.
import { getArenaShareTitle } from "../lib/arena-share.ts";

const errors: string[] = [];
const representativeArenaIds = new Set([3, 6, 73]);
const commentIds = new Set<number>();
const commentBodies = new Set<string>();
const aiStylePhrases = [
  "중요하다고 생각합니다",
  "장기적인 관점에서",
  "개인의 가치관에 따라",
  "상황을 이해하는 것이 중요",
  "두 선택지 모두 장단점",
  "선택할 것 같습니다",
  "더 합리적이라고 봅니다",
];

for (const comment of initialComments) {
  if (commentIds.has(comment.id)) {
    errors.push(`중복 댓글 ID: ${comment.id}`);
  }
  commentIds.add(comment.id);

  if (commentBodies.has(comment.text)) {
    errors.push(`중복 댓글 본문: ${comment.text}`);
  }
  commentBodies.add(comment.text);

  const aiStylePhrase = aiStylePhrases.find((phrase) => comment.text.includes(phrase));
  if (aiStylePhrase) {
    errors.push(`AI 말투 감지 (${aiStylePhrase}): ${comment.text}`);
  }
  if (comment.text.length > 130) {
    errors.push(`댓글 130자 초과 (${comment.text.length}자): ${comment.text}`);
  }
}

for (const arena of arenas) {
  const comments = initialComments.filter((comment) => comment.arenaId === arena.id);
  const aCommentCount = comments.filter((comment) => comment.side === "A").length;
  const bCommentCount = comments.filter((comment) => comment.side === "B").length;
  const stats = getArenaStats(arena, initialComments);
  const shareTitle = getArenaShareTitle(arena);

  if (shareTitle.length > 36) {
    errors.push(`arena ${arena.id}: 공유 제목 ${shareTitle.length}자 (${shareTitle})`);
  }

  if (stats.commentCount !== comments.length) {
    errors.push(
      `arena ${arena.id}: commentCount ${stats.commentCount} !== ${comments.length}`
    );
  }
  if (stats.aCommentCount !== aCommentCount) {
    errors.push(
      `arena ${arena.id}: aCommentCount ${stats.aCommentCount} !== ${aCommentCount}`
    );
  }
  if (stats.bCommentCount !== bCommentCount) {
    errors.push(
      `arena ${arena.id}: bCommentCount ${stats.bCommentCount} !== ${bCommentCount}`
    );
  }
  if (stats.aCommentCount + stats.bCommentCount !== stats.commentCount) {
    errors.push(`arena ${arena.id}: A/B 댓글 합계가 전체 댓글 수와 다름`);
  }
  if (stats.voteCount !== arena.totalVotes) {
    errors.push(
      `arena ${arena.id}: voteCount ${stats.voteCount} !== seed ${arena.totalVotes}`
    );
  }
  if (comments.length < 8 || comments.length > 16) {
    errors.push(`arena ${arena.id}: 댓글 수 ${comments.length}가 8~16 범위를 벗어남`);
  }

  if (representativeArenaIds.has(arena.id)) {
    console.log(
      `arena ${arena.id}: 참여 ${stats.voteCount}, 댓글 ${stats.commentCount}, A ${stats.aCommentCount}, B ${stats.bCommentCount}`
    );
  }
}

if (errors.length > 0) {
  console.error(`\n데이터 정합성 검사 실패 (${errors.length}건)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `\n데이터 정합성 검사 통과: 아레나 ${arenas.length}개, 댓글 ${initialComments.length}개`
  );
}
