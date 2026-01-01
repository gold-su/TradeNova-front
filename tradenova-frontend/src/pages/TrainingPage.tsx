import { useEffect, useState } from "react";
import CandleChart from "@/components/training/CandleChart";
import { trainingApi, type Candle } from "@/api/trainingApi";
import { Button } from "@/components/ui/button";

export default function TrainingPage() {
    const [candles, setCandles] = useState<Candle[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const load = async () => {
        setErrorMsg("");
        setLoading(true);
        try {
            // 여기 params는 예시. 너 백엔드가 요구하면 맞춰 넣자.
            const data = await trainingApi.getCandles({
                symbol: "005930",
                from: "20240101",
                to: "20240630",
            });
            setCandles(data);
        } catch (e: any) {
            setErrorMsg(e?.response?.data?.message || "차트 데이터를 불러오지 못했어");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <main className="mx-auto w-full max-w-6xl px-4 py-10">
            <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Training</h1>
                    <p className="text-sm text-muted-foreground">
                        랜덤 차트 훈련 1단계: 캔들 불러오기 + 차트 렌더
                    </p>
                </div>

                <Button onClick={load} disabled={loading}>
                    {loading ? "Loading..." : "Reload"}
                </Button>
            </div>

            {errorMsg && (
                <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {errorMsg}
                </div>
            )}

            {candles.length > 0 ? (
                <CandleChart candles={candles} />
            ) : (
                <div className="rounded-2xl border border-border/60 bg-background/20 p-8 text-muted-foreground">
                    {loading ? "불러오는 중..." : "데이터가 없어. API 응답을 확인해봐."}
                </div>
            )}
        </main>
    );
}
