// src/pages/TrainingSessionPage.tsx
import { useMemo, useState } from "react";
import { trainingSessionApi } from "@/api/trainingSessionApi";
import type { Candle, SessionProgressResponse, TradeResponse, TrainingStatus } from "@/types/training";

/**
 * MVP 목표: 세션 생성 -> 캔들 로드 -> NEXT로 1봉씩 공개 -> BUY/SELL/SELL ALL
 * - UI는 최소로, 동작 검증/상태 반영 우선
 */
export default function TrainingSessionPage() {
    // ===== Core State =====
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [candles, setCandles] = useState<Candle[]>([]);

    const [progressIndex, setProgressIndex] = useState<number>(0);
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [cashBalance, setCashBalance] = useState<number | null>(null);
    const [positionQty, setPositionQty] = useState<number | null>(null);
    const [avgPrice, setAvgPrice] = useState<number | null>(null);
    const [status, setStatus] = useState<TrainingStatus>("IN_PROGRESS");

    // ===== UI/UX State =====
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ===== Inputs (MVP: 하드코딩/간단 입력) =====
    const [accountId, setAccountId] = useState<number>(10);
    const [bars, setBars] = useState<number>(120);
    const [qty, setQty] = useState<number>(1);

    // 요청 중이거나 세션 종료면 거래/진행 막기
    const disabled = !sessionId || status === "COMPLETED" || loading;

    // progressIndex 기준으로 공개된 캔들만 보여주기
    const visibleCandles = useMemo(() => {
        if (!candles.length) return [];
        const end = Math.min(progressIndex + 1, candles.length);
        return candles.slice(0, end);
    }, [candles, progressIndex]);

    const applyProgressSnapshot = (res: SessionProgressResponse) => {
        setProgressIndex(res.progressIndex);
        setCurrentPrice(res.currentPrice);
        setCashBalance(res.cashBalance);
        setPositionQty(res.positionQty);
        setAvgPrice(res.avgPrice);
        setStatus(res.status);
    };

    const applyTradeSnapshot = (res: TradeResponse) => {
        setCashBalance(res.cashBalance);
        setPositionQty(res.positionQty);
        setAvgPrice(res.avgPrice);
        setCurrentPrice(res.executedPrice);
    };

    // ===== Handlers =====
    const onCreateSession = async () => {
        try {
            setLoading(true);
            setError(null);

            const created = await trainingSessionApi.createSession({
                accountId,
                mode: "RANDOM",
                bars,
            });

            setSessionId(created.sessionId);
            setStatus(created.status);

            // 세션 생성 직후 캔들 로드
            const cs = await trainingSessionApi.getSessionCandles(created.sessionId);
            setCandles(cs);

            // 초기 progressIndex가 백엔드에서 따로 내려오지 않으면 0 기준으로 시작
            // 만약 created 응답에 progressIndex가 있다면 그 값으로 세팅해도 됨.
            setProgressIndex(0);

            console.log("created:", created);
            console.log("candles:", cs.length);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? "세션 생성 실패");
        } finally {
            setLoading(false);
        }
    };

    const onNext = async () => {
        if (!sessionId) return;
        try {
            setLoading(true);
            setError(null);

            const res = await trainingSessionApi.next(sessionId);
            applyProgressSnapshot(res);

            console.log("next:", res);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? "NEXT 실패");
        } finally {
            setLoading(false);
        }
    };

    const onAdvance10 = async () => {
        if (!sessionId) return;
        try {
            setLoading(true);
            setError(null);

            const res = await trainingSessionApi.advance(sessionId, 10);
            applyProgressSnapshot(res);

            console.log("advance(10):", res);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? "ADVANCE 실패");
        } finally {
            setLoading(false);
        }
    };

    const onBuy = async () => {
        if (!sessionId) return;
        try {
            setLoading(true);
            setError(null);

            const res = await trainingSessionApi.buy(sessionId, qty);
            applyTradeSnapshot(res);

            console.log("buy:", res);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? "BUY 실패");
        } finally {
            setLoading(false);
        }
    };

    const onSell = async () => {
        if (!sessionId) return;
        try {
            setLoading(true);
            setError(null);

            const res = await trainingSessionApi.sell(sessionId, qty);
            applyTradeSnapshot(res);

            console.log("sell:", res);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? "SELL 실패");
        } finally {
            setLoading(false);
        }
    };

    const onSellAll = async () => {
        if (!sessionId) return;
        try {
            setLoading(true);
            setError(null);

            const res = await trainingSessionApi.sellAll(sessionId);
            applyTradeSnapshot(res);

            console.log("sellAll:", res);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? "SELL ALL 실패");
        } finally {
            setLoading(false);
        }
    };

    // ===== UI (MVP) =====
    return (
        <div style={{ padding: 16, maxWidth: 960, margin: "0 auto" }}>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>Training Session (MVP)</h1>

            <div style={{ marginTop: 12, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        accountId
                        <input
                            type="number"
                            value={accountId}
                            onChange={(e) => setAccountId(Number(e.target.value))}
                            style={{ width: 120 }}
                            disabled={loading}
                        />
                    </label>

                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        bars
                        <input
                            type="number"
                            value={bars}
                            min={30}
                            onChange={(e) => setBars(Number(e.target.value))}
                            style={{ width: 120 }}
                            disabled={loading}
                        />
                    </label>

                    <button onClick={onCreateSession} disabled={loading} style={{ padding: "8px 12px" }}>
                        세션 생성 + 캔들 로드
                    </button>

                    <span style={{ marginLeft: "auto", opacity: 0.8 }}>
                        {loading ? "Loading..." : sessionId ? `sessionId=${sessionId}` : "no session"}
                    </span>
                </div>

                {error && (
                    <div style={{ marginTop: 10, color: "crimson" }}>
                        <b>Error:</b> {error}
                    </div>
                )}
            </div>

            <div style={{ marginTop: 12, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    <button onClick={onNext} disabled={disabled} style={{ padding: "8px 12px" }}>
                        NEXT (1봉)
                    </button>

                    <button onClick={onAdvance10} disabled={disabled} style={{ padding: "8px 12px" }}>
                        ADVANCE (10봉)
                    </button>

                    <span style={{ opacity: 0.8 }}>
                        status: <b>{status}</b>
                    </span>

                    {status === "COMPLETED" && (
                        <span style={{ color: "green", fontWeight: 700 }}>세션 종료됨</span>
                    )}
                </div>

                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    <div>
                        progressIndex: <b>{progressIndex}</b>
                    </div>
                    <div>
                        currentPrice: <b>{currentPrice ?? "-"}</b>
                    </div>
                    <div>
                        candlesLoaded: <b>{candles.length}</b> / visible: <b>{visibleCandles.length}</b>
                    </div>
                    <div>
                        cashBalance: <b>{cashBalance ?? "-"}</b>
                    </div>
                    <div>
                        positionQty: <b>{positionQty ?? "-"}</b>
                    </div>
                    <div>
                        avgPrice: <b>{avgPrice ?? "-"}</b>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 12, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        qty
                        <input
                            type="number"
                            value={qty}
                            min={0.000001}
                            step={1}
                            onChange={(e) => setQty(Number(e.target.value))}
                            style={{ width: 120 }}
                            disabled={disabled}
                        />
                    </label>

                    <button onClick={onBuy} disabled={disabled} style={{ padding: "8px 12px" }}>
                        BUY
                    </button>

                    <button onClick={onSell} disabled={disabled} style={{ padding: "8px 12px" }}>
                        SELL
                    </button>

                    <button onClick={onSellAll} disabled={disabled} style={{ padding: "8px 12px" }}>
                        SELL ALL
                    </button>

                    <span style={{ marginLeft: "auto", opacity: 0.8 }}>
                        * COMPLETED 또는 로딩 중이면 버튼 비활성화
                    </span>
                </div>
            </div>

            {/* 차트는 MVP에서는 placeholder: slice가 잘 되는지 숫자로 확인 */}
            <div style={{ marginTop: 12, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
                <h2 style={{ fontSize: 16, margin: 0 }}>Chart Placeholder</h2>
                <div style={{ marginTop: 8, fontSize: 13, opacity: 0.9 }}>
                    visibleCandles = candles.slice(0, progressIndex + 1)
                </div>

                <div style={{ marginTop: 10, maxHeight: 240, overflow: "auto", border: "1px solid #eee" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>idx</th>
                                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>t</th>
                                <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #eee" }}>o</th>
                                <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #eee" }}>h</th>
                                <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #eee" }}>l</th>
                                <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #eee" }}>c</th>
                                <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #eee" }}>v</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleCandles.map((c, idx) => (
                                <tr key={c.t ?? idx}>
                                    <td style={{ padding: 8, borderBottom: "1px solid #f3f3f3" }}>{idx}</td>
                                    <td style={{ padding: 8, borderBottom: "1px solid #f3f3f3" }}>{c.t}</td>
                                    <td style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #f3f3f3" }}>{c.o}</td>
                                    <td style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #f3f3f3" }}>{c.h}</td>
                                    <td style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #f3f3f3" }}>{c.l}</td>
                                    <td style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #f3f3f3" }}>{c.c}</td>
                                    <td style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #f3f3f3" }}>{c.v}</td>
                                </tr>
                            ))}
                            {!visibleCandles.length && (
                                <tr>
                                    <td colSpan={7} style={{ padding: 12, textAlign: "center", opacity: 0.7 }}>
                                        세션 생성 후 캔들을 로드하세요.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}