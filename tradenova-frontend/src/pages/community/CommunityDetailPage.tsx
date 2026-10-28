import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import { communityApi } from "@/api/communityApi";
import { CommunityAuthor } from "@/components/community/CommunityAuthor";
import { Button } from "@/components/ui/button";
import type { CommunityComment, CommunityPostDetail, CommunityReportReason } from "@/types/community";
import { useI18n } from "@/i18n/LanguageProvider";

export default function CommunityDetailPage() {
  const { language, t } = useI18n();
  const id = Number(useParams().postId);
  const navigate = useNavigate();
  const [post, setPost] = useState<CommunityPostDetail | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const locale = language === "ko" ? "ko-KR" : "en-US";
  const reasons: Record<CommunityReportReason, string> = { SPAM: t("community.spam"), HARASSMENT: t("community.harassment"), INAPPROPRIATE: t("community.inappropriate"), MISINFORMATION: t("community.misinformation"), OTHER: t("community.other") };

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try { const [nextPost, nextComments] = await Promise.all([communityApi.getPost(id), communityApi.listComments(id)]); setPost(nextPost); setComments(nextComments.content); }
    catch { setError(true); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);

  if (loading) return <main className="mx-auto max-w-4xl px-4 py-10"><div className="h-80 animate-pulse rounded-xl bg-muted/20" /></main>;
  if (error || !post) return <main className="mx-auto max-w-4xl px-4 py-20 text-center"><p>{t("community.postLoadFailed")}</p><Button className="mt-4" variant="outline" onClick={() => void load()}>{t("common.retry")}</Button></main>;

  async function toggleLike() { if (!post) return; const response = post.likedByMe ? await communityApi.unlike(id) : await communityApi.like(id); setPost({ ...post, ...response }); }
  async function addComment(event: React.FormEvent) { event.preventDefault(); if (!text.trim()) return; setBusy(true); try { const comment = await communityApi.createComment(id, text); setComments((value) => [...value, comment]); setText(""); setPost((value) => value ? { ...value, commentCount: value.commentCount + 1 } : value); } finally { setBusy(false); } }
  async function removeComment(commentId: number) { await communityApi.deleteComment(commentId); setComments((value) => value.filter((comment) => comment.id !== commentId)); setPost((value) => value ? { ...value, commentCount: Math.max(0, value.commentCount - 1) } : value); }
  async function removePost() { if (!confirm(t("community.deleteConfirm"))) return; await communityApi.deletePost(id); navigate("/community"); }
  async function report() { const raw = prompt(t("community.reportPrompt"), "SPAM") as CommunityReportReason | null; if (!raw || !(raw in reasons)) return; await communityApi.report(id, raw); alert(t("community.reportReceived")); }

  return <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
    <Link to="/community" className="text-sm text-muted-foreground hover:text-foreground">← {t("community.back")}</Link>
    <article className="mt-7 border-b border-border/50 pb-8">
      <div className="flex items-start justify-between gap-4"><CommunityAuthor author={post.author}/><div className="flex gap-1">{post.mine ? <><Button variant="ghost" size="sm" asChild><Link to={`/community/${id}/edit`}>{t("community.edit")}</Link></Button><Button variant="ghost" size="sm" onClick={() => void removePost()}>{t("community.delete")}</Button></> : <Button variant="ghost" size="sm" onClick={() => void report()}>{t("community.report")}</Button>}</div></div>
      <h1 className="mt-6 text-2xl font-semibold leading-tight">{post.title}</h1><time className="mt-2 block text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString(locale)}</time><div className="mt-7 whitespace-pre-wrap text-sm leading-7">{post.content}</div><Button className="mt-7" variant={post.likedByMe ? "secondary" : "outline"} onClick={() => void toggleLike()}><Heart className={post.likedByMe ? "fill-current" : ""}/>{t("community.like", { count: post.likeCount })}</Button>
    </article>
    <section className="py-8"><h2 className="text-base font-semibold">{t("community.comments", { count: post.commentCount })}</h2><form onSubmit={addComment} className="mt-4 flex gap-2"><textarea aria-label={t("community.comment")} value={text} maxLength={2000} onChange={(event) => setText(event.target.value)} rows={2} placeholder={t("community.commentPlaceholder")} className="min-h-20 flex-1 resize-y rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-1 focus:ring-ring"/><Button disabled={busy || !text.trim()}>{t("community.submit")}</Button></form><div className="mt-6 divide-y divide-border/40">{comments.map((comment) => <div key={comment.id} className="py-5"><div className="flex justify-between"><CommunityAuthor author={comment.author} compact/>{comment.mine && <Button aria-label={t("community.deleteComment")} size="icon" variant="ghost" onClick={() => void removeComment(comment.id)}><Trash2/></Button>}</div><p className="mt-3 whitespace-pre-wrap text-sm leading-6">{comment.content}</p><time className="mt-2 block text-[11px] text-muted-foreground">{new Date(comment.createdAt).toLocaleString(locale)}</time></div>)}{comments.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">{t("community.firstComment")}</p>}</div></section>
  </main>;
}
