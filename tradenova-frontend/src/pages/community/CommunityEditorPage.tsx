import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { communityApi } from "@/api/communityApi";
import { Button } from "@/components/ui/button";
import { validateCommunityPost } from "./communityView";
import { useI18n } from "@/i18n/LanguageProvider";

export default function CommunityEditorPage() {
  const { language, t } = useI18n();
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editing) communityApi.getPost(Number(id)).then((post) => { if (!post.mine) throw new Error(); setTitle(post.title); setContent(post.content); }).catch(() => setError(t("community.postLoadError")));
  }, [editing, id, t]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const validation = validateCommunityPost({ title, content });
    if (validation) {
      const key = validation.includes("120") ? "titleTooLong" : validation.includes("10,000") ? "contentTooLong" : "titleContentRequired";
      setError(t(`community.${key}`));
      return;
    }
    setSaving(true); setError("");
    try { const post = editing ? await communityApi.updatePost(Number(id), { title, content }) : await communityApi.createPost({ title, content }); navigate(`/community/${post.id}`); }
    catch { setError(t("community.saveError")); }
    finally { setSaving(false); }
  }

  return <main className="mx-auto max-w-3xl px-4 py-10">
    <Link className="text-sm text-muted-foreground hover:text-foreground" to={editing ? `/community/${id}` : "/community"}>← {t("community.back")}</Link>
    <h1 className="mt-6 text-2xl font-semibold">{editing ? t("community.editPost") : t("community.share")}</h1>
    <form onSubmit={submit} className="mt-7 space-y-5">
      <label className="block text-sm font-medium">{t("community.titleLabel")}<input value={title} maxLength={120} onChange={(event) => setTitle(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 outline-none focus:ring-1 focus:ring-ring"/></label>
      <label className="block text-sm font-medium">{t("community.contentLabel")}<textarea value={content} maxLength={10000} onChange={(event) => setContent(event.target.value)} rows={14} className="mt-2 w-full resize-y rounded-md border border-input bg-background p-3 leading-6 outline-none focus:ring-1 focus:ring-ring"/></label>
      <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{content.length.toLocaleString(language === "ko" ? "ko-KR" : "en-US")} / 10,000</span><div className="flex gap-2"><Button type="button" variant="ghost" asChild><Link to={editing ? `/community/${id}` : "/community"}>{t("common.cancel")}</Link></Button><Button disabled={saving}>{saving ? t("common.saving") : t("common.save")}</Button></div></div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </form>
  </main>;
}
