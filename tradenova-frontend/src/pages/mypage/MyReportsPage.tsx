// src/pages/mypage/MyReportsPage.tsx
import { useMemo, useState } from "react";

type Report = {
    id: number;
    title: string;
    createdAt: string;
    accountName: string;
    tags: string[];
    summary: string;
};

export default function MyReportsPage() {
    const [q, setQ] = useState("");

    const reports: Report[] = useMemo(
        () => [
            {
                id: 1,
                title: "2월 1주차 매매 리포트",
                createdAt: "2026-02-07",
                accountName: "메인 계좌",
                tags: ["손익비", "리스크룰"],
                summary: "손절은 지켰지만 익절 기준이 흔들림. 다음 주는 1R 고정.",
            },
            {
                id: 2,
                title: "스윙 루틴 점검",
                createdAt: "2026-02-20",
                accountName: "서브 계좌",
                tags: ["과매매", "진입근거"],
                summary: "진입 근거는 좋으나 빈도가 높음. 대기 기준을 강화.",
            },
        ],
        []
    );

    const filtered = useMemo(() => {
        const t = q.trim().toLowerCase();
        if (!t) return reports;
        return reports.filter(
            (r) =>
                r.title.toLowerCase().includes(t) ||
                r.summary.toLowerCase().includes(t) ||
                r.accountName.toLowerCase().includes(t) ||
                r.tags.some((x) => x.toLowerCase().includes(t))
        );
    }, [q, reports]);

    return (
        <div className="space-y-6">
            <div>
                <div className="text-xl font-semibold">리포트 정리본</div>
                <div className="mt-1 text-sm text-muted-foreground">
                    계좌/세션별 리포트를 모아서 보는 화면 (현재 데모 UI)
                </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/10 p-3">
                <input
                    className="w-full rounded-xl border border-border/60 bg-background/30 px-3 py-2 text-sm"
                    placeholder="검색: 제목/요약/태그/계좌"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
            </div>

            <div className="space-y-3">
                {filtered.map((r) => (
                    <div key={r.id} className="rounded-2xl border border-border/60 bg-background/10 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-sm font-semibold">{r.title}</div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                    {r.createdAt} · {r.accountName}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {r.tags.map((t) => (
                                    <span
                                        key={t}
                                        className="rounded-md border border-border/60 bg-background/20 px-2 py-1 text-xs"
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="mt-3 text-sm text-muted-foreground">{r.summary}</div>

                        <div className="mt-3 flex gap-2">
                            <button className="rounded-xl border border-border/60 px-3 py-2 text-sm hover:bg-muted/30">
                                상세 보기(추가 예정)
                            </button>
                            <button className="rounded-xl border border-border/60 px-3 py-2 text-sm hover:bg-muted/30">
                                AI 재요약(추가 예정)
                            </button>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="rounded-2xl border border-border/60 bg-background/10 p-6 text-sm text-muted-foreground">
                        검색 결과가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}