import { useState } from "react";
import { reportApi } from "@/api/reportApi";
import { trainingApi } from "@/api/trainingApi";
import type {
  ReportDocumentResponse,
  TradeResponse,
  TrainingEventResponse,
} from "@/types/training";
import type { TradeForm } from "./training.types";
import { emptyProgress } from "./training.utils";

/**
 * 훈련 화면의 "거래/거래모달/거래 후 이벤트/스냅샷" 로직을 담당하는 훅
 *
 * 담당 책임:
 * - BUY / SELL 모달 상태
 * - 거래 실행
 * - 거래 이벤트 저장
 * - 거래 직후 snapshot 저장
 * - SELL ALL 실행
 */
type UseTrainingTradeParams = {
  activeChartId: number | null;
  status: string;
  loadEvents: (chartId: number) => Promise<void>;
  setSnapshots: React.Dispatch<React.SetStateAction<ReportDocumentResponse[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  applyTrade: (res: TradeResponse) => void;
};

export function useTrainingTrade({
  activeChartId,
  status,
  loadEvents,
  setSnapshots,
  setError,
  applyTrade,
}: UseTrainingTradeParams) {
  // ===== 거래 모달 상태 =====
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState<"BUY" | "SELL" | null>(null);

  // ===== 거래 입력 폼 =====
  const [tradeForm, setTradeForm] = useState<TradeForm>({
    qty: 1,
    entryReason: "",
    riskNote: "",
  });

  // ===== 로딩 =====
  const [loading, setLoading] = useState(false);

  /**
   * BUY / SELL 실행 후
   * - trade 응답 반영
   * - TRADE 이벤트 저장
   * - snapshot 저장
   * - 이벤트 로그 다시 로드
   */
  const handleConfirmTrade = async () => {
    if (!activeChartId || !tradeType) return;

    try {
      setLoading(true);
      setError(null);

      const tradeRes =
        tradeType === "BUY"
          ? await trainingApi.buy(activeChartId, { qty: tradeForm.qty })
          : await trainingApi.sell(activeChartId, { qty: tradeForm.qty });

      // trade 결과를 상위 진행 상태에 반영
      applyTrade(tradeRes);

      // 거래 이벤트 저장
      const event = await reportApi.createEvent(activeChartId, {
        type: "TRADE",
        title: `${tradeType} 실행`,
        payloadJson: {
          qty: tradeForm.qty,
          entryReason: tradeForm.entryReason,
          riskNote: tradeForm.riskNote,
          price: tradeRes.executedPrice,
        },
      });

      // 거래 직후 snapshot 저장
      const snapshot = await reportApi.createSnapshot(activeChartId, {
        linkedEventId: event.id,
        contentJson: {
          thesis: "",
          entryReason: tradeForm.entryReason,
          exitPlan: "",
          riskNote: tradeForm.riskNote,
          freeNote: "",
          tags: [],
        },
      });

      setSnapshots((prev) => [snapshot, ...prev]);

      // 모달 초기화
      setTradeModalOpen(false);
      setTradeForm({
        qty: 1,
        entryReason: "",
        riskNote: "",
      });

      await loadEvents(activeChartId);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "거래 실패");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 현재 활성 차트 전량 매도
   */
  const onSellAll = async () => {
    if (!activeChartId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await trainingApi.sellAll(activeChartId);
      applyTrade(res);
      await loadEvents(activeChartId);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "SELL ALL 실패");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 매수 모달 열기
   */
  const openBuyModal = () => {
    setTradeType("BUY");
    setTradeModalOpen(true);
  };

  /**
   * 매도 모달 열기
   */
  const openSellModal = () => {
    setTradeType("SELL");
    setTradeModalOpen(true);
  };

  return {
    tradeModalOpen,
    setTradeModalOpen,
    tradeType,
    tradeForm,
    setTradeForm,
    loading,

    handleConfirmTrade,
    onSellAll,
    openBuyModal,
    openSellModal,
  };
}
