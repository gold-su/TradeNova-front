export type CommunityAuthor = { userId: number; nickname: string; level: number; completedTrainingCount: number };
export type CommunityPostSummary = { id:number; title:string; contentPreview:string; author:CommunityAuthor; likeCount:number; commentCount:number; likedByMe:boolean; createdAt:string };
export type CommunityPostDetail = { id:number; title:string; content:string; author:CommunityAuthor; likeCount:number; commentCount:number; likedByMe:boolean; mine:boolean; createdAt:string; updatedAt:string|null };
export type CommunityComment = { id:number; author:CommunityAuthor; content:string; mine:boolean; createdAt:string };
export type CommunityPage<T> = { content:T[]; number:number; totalPages:number; totalElements:number; first:boolean; last:boolean };
export type CommunityPostInput = { title:string; content:string };
export type CommunityReportReason = "SPAM"|"HARASSMENT"|"INAPPROPRIATE"|"MISINFORMATION"|"OTHER";
