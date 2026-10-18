import http from "./http";
import type { CommunityComment, CommunityPage, CommunityPostDetail, CommunityPostInput, CommunityPostSummary, CommunityReportReason } from "@/types/community";

export const communityApi = {
  listPosts: (page=0,size=20) => http.get<CommunityPage<CommunityPostSummary>>("/api/community/posts",{params:{page,size}}).then(r=>r.data),
  getPost: (id:number) => http.get<CommunityPostDetail>(`/api/community/posts/${id}`).then(r=>r.data),
  createPost: (body:CommunityPostInput) => http.post<CommunityPostDetail>("/api/community/posts",body).then(r=>r.data),
  updatePost: (id:number,body:CommunityPostInput) => http.patch<CommunityPostDetail>(`/api/community/posts/${id}`,body).then(r=>r.data),
  deletePost: (id:number) => http.delete(`/api/community/posts/${id}`),
  listComments: (id:number,page=0) => http.get<CommunityPage<CommunityComment>>(`/api/community/posts/${id}/comments`,{params:{page,size:50}}).then(r=>r.data),
  createComment: (id:number,content:string) => http.post<CommunityComment>(`/api/community/posts/${id}/comments`,{content}).then(r=>r.data),
  deleteComment: (id:number) => http.delete(`/api/community/comments/${id}`),
  like: (id:number) => http.put<{likedByMe:boolean;likeCount:number}>(`/api/community/posts/${id}/like`).then(r=>r.data),
  unlike: (id:number) => http.delete<{likedByMe:boolean;likeCount:number}>(`/api/community/posts/${id}/like`).then(r=>r.data),
  report: (targetId:number,reason:CommunityReportReason) => http.post("/api/community/reports",{targetType:"POST",targetId,reason}),
};
