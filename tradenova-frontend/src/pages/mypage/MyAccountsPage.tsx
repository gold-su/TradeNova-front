// src/pages/mypage/MyAccountsPage.tsx
import { useEffect, useMemo, useState } from "react";
import { paperAccountApi, type PaperAccountResponse } from "@/api/paperAccountApi";

type AccountInsight = {
    accountId: number;
    oneLiner: string;
    riskTag: "LOW" | "MID" | "HIGH";
};

type ReportSummary = {
    id: number;
    accountId: number;
    title: string;
    createdAt: string;
    highlight: string;
};

function fmt(v: number | null | undefined) {
    if (v === null || v === undefined) return "-";
    return new Intl.NumberFormat("ko-KR").format(v);
}

export default function MyAccountsPage() {
    const [accounts, setAccounts] = useState<PaperAccountResponse[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [createName, setCreateName] = useState("");
    const [createDesc, setCreateDesc] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    // 임시: AI 한줄평(나중에 API 붙이기)
    const insights: AccountInsight[] = useMemo(
        () => [
            { accountId: 1, oneLiner: "규칙 기반 매매가 안정적. 손절 라인만 더 명확히.", riskTag: "LOW" },
            { accountId: 2, oneLiner: "승률은 괜찮은데 손익비가 아쉬움. 익절 룰 보완 추천.", riskTag: "MID" },
            { accountId: 3, oneLiner: "진입 빈도가 높음. 과매매 가능성 체크 필요.", riskTag: "HIGH" },
        ],
        []
    );

    // 임시: 리포트 요약(나중에 API 붙이기)
    const reportSummaries: ReportSummary[] = useMemo(
        () => [
            { id: 101, accountId: 1, title: "2월 1주차 정리", createdAt: "2026-02-07", highlight: "손절은 잘 지켰고, 익절 기준이 흔들림." },
            { id: 102, accountId: 1, title: "2월 2주차 정리", createdAt: "2026-02-14", highlight: "뉴스 반영 늦음 → 진입 타이밍 개선 필요." },
            { id: 201, accountId: 2, title: "스윙 루틴 점검", createdAt: "2026-02-20", highlight: "진입 근거는 좋은데 분할매수 계획이 없음." },
        ],
        []
    );

    const selected = useMemo(
        () => accounts.find((a) => a.id === selectedId) ?? null,
        [accounts, selectedId]
    );

    const selectedInsight = useMemo(() => {
        if (!selected) return null;
        return insights.find((x) => x.accountId === selected.id) ?? null;
    }, [selected, insights]);

    const selectedReports = useMemo(() => {
        if (!selected) return [];
        return reportSummaries.filter((r) => r.accountId === selected.id);
    }, [selected, reportSummaries]);

    const reload = async () => {
        const list = await paperAccountApi.list();
        setAccounts(list);

        if (!selectedId) {
            const def = list.find((a) => a.isDefault) ?? list[0];
            setSelectedId(def?.id ?? null);
        } else {
            // 선택 유지
            const still = list.some((a) => a.id === selectedId);
            if (!still) setSelectedId(list[0]?.id ?? null);
        }
    };

    useEffect(() => {
        reload().catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onCreate = async () => {
        setMsg(null);
        if (!createName.trim()) {
            setMsg("계좌 이름을 입력해줘.");
            return;
        }
        setLoading(true);
        try {
            await paperAccountApi.create({ name: createName.trim(), description: createDesc.trim() || null });
            setCreateName("");
            setCreateDesc("");
            setMsg("계좌가 생성되었습니다.");
            await reload();
        } catch (e: any) {
            setMsg(e?.response?.data?.message ?? "계좌 생성 실패");
        } finally {
            setLoading(false);
        }
    };

    const onUpdate = async () => {
        if (!selected) return;
        setMsg(null);
        setLoading(true);
        try {
            await paperAccountApi.update(selected.id, { name: selected.name, description: selected.description ?? null });
            setMsg("수정되었습니다.");
            await reload();
        } catch (e: any) {
            setMsg(e?.response?.data?.message ?? "계좌 수정 실패");
        } finally {
            setLoading(false);
        }
    };

    const onSetDefault = async () => {
        if (!selected) return;
        setMsg(null);
        setLoading(true);
        try {
            await paperAccountApi.setDefault(selected.id);
            setMsg("기본 계좌로 설정했습니다.");
            await reload();
        } catch (e: any) {
            setMsg(e?.response?.data?.message ?? "기본 계좌 설정 실패");
        } finally {
            setLoading(false);
        }
    };

    const onReset = async () => {
        if (!selected) return;
        setMsg(null);
        setLoading(true);
        try {
            await paperAccountApi.reset(selected.id);
            setMsg("계좌가 리셋되었습니다.");
            await reload();
        } catch (e: any) {
            setMsg(e?.response?.data?.message ?? "계좌 리셋 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="text-xl font-semibold">계좌 관리</div>
                <div className="mt-1 text-sm text-muted-foreground">
                    계좌 생성/수정/기본설정/리셋 + 계좌별 인사이트/리포트 요약(데모)
                </div>
            </div>

            {msg && (
                <div className="rounded-2xl border border-border/60 bg-background/20 p-3 text-sm text-muted-foreground">
                    {msg}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
                {/* LEFT: list */}
                <div className="rounded-2xl border border-border/60 bg-background/10 p-3">
                    <div className="mb-2 text-sm font-semibold">내 계좌</div>
                    <div className="flex flex-col gap-2">
                        {accounts.map((a) => (
                            <button
                                key={a.id}
                                onClick={() => setSelectedId(a.id)}
                                className={[
                                    "rounded-xl border px-3 py-2 text-left text-sm transition",
                                    selectedId === a.id
                                        ? "border-primary/50 bg-primary/10 font-semibold"
                                        : "border-border/60 hover:bg-muted/30",
                                ].join(" ")}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        #{a.id} · {a.name}
                                        {a.isDefault && (
                                            <span className="ml-2 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs">
                                                DEFAULT
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{fmt(a.cashBalance)}</div>
                                </div>
                                {a.description && (
                                    <div className="mt-1 text-xs text-muted-foreground">{a.description}</div>
                                )}
                            </button>
                        ))}
                        {accounts.length === 0 && (
                            <div className="text-xs text-muted-foreground">계좌가 없습니다.</div>
                        )}
                    </div>

                    {/* create */}
                    <div className="mt-4 rounded-2xl border border-border/60 bg-background/20 p-3">
                        <div className="text-sm font-semibold">계좌 생성</div>
                        <input
                            className="mt-2 w-full rounded-xl border border-border/60 bg-background/30 px-3 py-2 text-sm"
                            placeholder="계좌 이름"
                            value={createName}
                            onChange={(e) => setCreateName(e.target.value)}
                        />
                        <input
                            className="mt-2 w-full rounded-xl border border-border/60 bg-background/30 px-3 py-2 text-sm"
                            placeholder="설명(선택)"
                            value={createDesc}
                            onChange={(e) => setCreateDesc(e.target.value)}
                        />
                        <button
                            onClick={onCreate}
                            disabled={loading}
                            className="mt-3 w-full rounded-xl border border-border/60 px-3 py-2 text-sm hover:bg-muted/30 disabled:opacity-60"
                        >
                            {loading ? "생성 중..." : "생성"}
                        </button>
                    </div>
                </div>

                {/* RIGHT: detail */}
                <div className="space-y-4">
                    <div className="rounded-2xl border border-border/60 bg-background/10 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="text-sm font-semibold">선택 계좌</div>
                                <div className="mt-1 text-muted-foreground text-sm">
                                    {selected ? `#${selected.id} · ${selected.name}` : "선택된 계좌 없음"}
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-xs text-muted-foreground">Cash</div>
                                <div className="text-lg font-semibold">{fmt(selected?.cashBalance)}</div>
                            </div>
                        </div>

                        {selected && (
                            <>
                                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <div>
                                        <div className="text-xs text-muted-foreground">이름</div>
                                        <input
                                            className="mt-1 w-full rounded-xl border border-border/60 bg-background/30 px-3 py-2 text-sm"
                                            value={selected.name}
                                            onChange={(e) =>
                                                setAccounts((prev) =>
                                                    prev.map((x) => (x.id === selected.id ? { ...x, name: e.target.value } : x))
                                                )
                                            }
                                        />
                                    </div>

                                    <div>
                                        <div className="text-xs text-muted-foreground">설명</div>
                                        <input
                                            className="mt-1 w-full rounded-xl border border-border/60 bg-background/30 px-3 py-2 text-sm"
                                            value={selected.description ?? ""}
                                            onChange={(e) =>
                                                setAccounts((prev) =>
                                                    prev.map((x) =>
                                                        x.id === selected.id ? { ...x, description: e.target.value } : x
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        onClick={onUpdate}
                                        disabled={loading}
                                        className="rounded-xl border border-border/60 px-3 py-2 text-sm hover:bg-muted/30 disabled:opacity-60"
                                    >
                                        수정 저장
                                    </button>

                                    <button
                                        onClick={onSetDefault}
                                        disabled={loading}
                                        className="rounded-xl border border-border/60 px-3 py-2 text-sm hover:bg-muted/30 disabled:opacity-60"
                                    >
                                        기본 계좌로 설정
                                    </button>

                                    <button
                                        onClick={onReset}
                                        disabled={loading}
                                        className="rounded-xl border border-border/60 px-3 py-2 text-sm hover:bg-muted/30 disabled:opacity-60"
                                    >
                                        리셋
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* AI one-liner (demo) */}
                    <div className="rounded-2xl border border-border/60 bg-background/10 p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold">AI 한줄평(데모)</div>
                            {selectedInsight && (
                                <span className="rounded-md border border-border/60 bg-background/20 px-2 py-1 text-xs">
                                    RISK: {selectedInsight.riskTag}
                                </span>
                            )}
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                            {selected
                                ? selectedInsight?.oneLiner ?? "아직 인사이트가 없습니다. (다음 단계에서 생성)"
                                : "계좌를 선택하면 표시됩니다."}
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
                            다음 단계: 계좌별 통계(승률/손익비/최대낙폭) + AI 생성 API로 교체
                        </div>
                    </div>

                    {/* report summaries (demo) */}
                    <div className="rounded-2xl border border-border/60 bg-background/10 p-4">
                        <div className="text-sm font-semibold">리포트 요약(데모)</div>
                        <div className="mt-3 space-y-2">
                            {selected ? (
                                selectedReports.length ? (
                                    selectedReports.map((r) => (
                                        <div key={r.id} className="rounded-xl border border-border/60 bg-background/20 p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-semibold">{r.title}</div>
                                                <div className="text-xs text-muted-foreground">{r.createdAt}</div>
                                            </div>
                                            <div className="mt-1 text-sm text-muted-foreground">{r.highlight}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-muted-foreground">이 계좌에 대한 리포트가 아직 없습니다.</div>
                                )
                            ) : (
                                <div className="text-sm text-muted-foreground">계좌를 선택하면 리포트가 표시됩니다.</div>
                            )}
                        </div>

                        <div className="mt-3 text-xs text-muted-foreground">
                            다음 단계: 실제 “세션/차트 리포트” 저장/조회 API 연결 → 여기로 자동 집계
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}