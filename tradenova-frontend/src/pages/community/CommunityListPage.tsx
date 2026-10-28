import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommunityAuthor } from "@/components/community/CommunityAuthor";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { useI18n } from "@/i18n/LanguageProvider";

export default function CommunityListPage() {
  const { language, t } = useI18n();
  const [page, setPage] = useState(0);
  const query = useCommunityPosts(page);
  const locale = language === "ko" ? "ko-KR" : "en-US";

  return <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
    <header className="flex items-end justify-between gap-4 border-b border-border/50 pb-6">
      <div><p className="text-xs font-semibold tracking-[.2em] text-primary">COMMUNITY</p><h1 className="mt-2 text-2xl font-semibold">{t("community.title")}</h1><p className="mt-1 text-sm text-muted-foreground">{t("community.description")}</p></div>
      <Button asChild><Link to="/community/new"><PenLine />{t("community.write")}</Link></Button>
    </header>
    {query.loading && <ListSkeleton />}
    {query.error && <State text={t("community.loadFailed")} action={<Button variant="outline" size="sm" onClick={() => void query.load()}>{t("common.retry")}</Button>} />}
    {!query.loading && !query.error && query.data?.content.length === 0 && <State text={t("community.empty")} sub={t("community.emptyPrompt")} />}
    <div className="divide-y divide-border/40">{query.data?.content.map((post) => <Link key={post.id} to={`/community/${post.id}`} className="block px-1 py-5 transition-colors hover:bg-muted/15 sm:px-3"><CommunityAuthor author={post.author}/><h2 className="mt-3 text-base font-semibold">{post.title}</h2><p className="mt-1 line-clamp-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{post.contentPreview}</p><div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5"/>{post.likeCount}</span><span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5"/>{post.commentCount}</span><time>{new Date(post.createdAt).toLocaleDateString(locale)}</time></div></Link>)}</div>
    {query.data && query.data.totalPages > 1 && <nav className="mt-6 flex justify-center gap-2" aria-label={t("common.pagination")}><Button variant="outline" disabled={query.data.first} onClick={() => setPage((value) => value - 1)}>{t("community.previous")}</Button><span className="px-3 py-2 text-xs text-muted-foreground">{query.data.number + 1} / {query.data.totalPages}</span><Button variant="outline" disabled={query.data.last} onClick={() => setPage((value) => value + 1)}>{t("community.next")}</Button></nav>}
  </main>;
}

function State({ text, sub, action }: { text: string; sub?: string; action?: React.ReactNode }) { return <div className="py-20 text-center"><p className="text-sm font-medium">{text}</p>{sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}{action && <div className="mt-4">{action}</div>}</div>; }
function ListSkeleton() { const { t } = useI18n(); return <div className="space-y-1 py-4" aria-label={t("community.loading")}>{[0, 1, 2].map((item) => <div key={item} className="h-36 animate-pulse rounded-lg bg-muted/20" />)}</div>; }
