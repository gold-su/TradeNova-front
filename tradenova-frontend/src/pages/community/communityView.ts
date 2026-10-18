import type { CommunityAuthor, CommunityPostInput } from "@/types/community";

export function validateCommunityPost(input: CommunityPostInput) {
  if (!input.title.trim() || !input.content.trim()) return "제목과 내용을 입력해 주세요.";
  if (input.title.trim().length > 120) return "제목은 120자 이하로 입력해 주세요.";
  if (input.content.trim().length > 10_000) return "내용은 10,000자 이하로 입력해 주세요.";
  return null;
}

export function communityAuthorMeta(author: CommunityAuthor, compact = false) {
  return compact ? `Level ${author.level}` : `Level ${author.level} · 훈련 ${author.completedTrainingCount}회`;
}
