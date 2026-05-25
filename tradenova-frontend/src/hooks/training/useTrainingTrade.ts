import { useState } from "react";
import { reportApi } from "@/api/reportApi";
import { trainingApi } from "@/api/trainingApi";
import type { ReportDocumentResponse, TradeResponse } from "@/types/training";
import type { TradeForm } from "./training.types";

/**
 * 훈련 화면의 "거래/거래모달" 로직을 담당하는 훅
 *
 * 담당 책임:
 * - BUY / SELL 모달 상태
 * - 거래 실행
 * - 거래 이벤트 저장
 * - SELL ALL 실행
 *
 * 주의:
 * - snapshot은 자동 생성하지 않음
 * - snapshot은 사용자가 직접 "Snapshot 저장" 버튼을 눌렀을 때만 생성
 */
type UseTrainingTradeParams = {
  activeChartId: number | null;
  status: string;
  loadEvents: (chartId: number) => Promise<void>;
  setSnapshots: React.Dispatch<React.SetStateAction<ReportDocumentResponse[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  applyTrade: (res: TradeResponse) => void;
  onTradeExecuted?: (input: {
    side: "BUY" | "SELL";
    res: TradeResponse;
    qty?: number;
  }) => void;
};

export function useTrainingTrade({
  activeChartId,
  status,
  loadEvents,
  setSnapshots,
  setError,
  applyTrade,
  onTradeExecuted,
}: UseTrainingTradeParams) {
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState<"BUY" | "SELL" | null>(null);

  const [tradeForm, setTradeForm] = useState<TradeForm>({
    qty: 1,
    entryReason: "",
    riskNote: "",
  });

  const [loading, setLoading] = useState(false);

  /**
   * BUY / SELL 실행 후
   * - trade 응답 반영
   * - TRADE 이벤트 저장
   * - 이벤트 로그 다시 로드
   *
   * snapshot은 여기서 자동 저장하지 않는다.
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

      // 거래 결과를 상위 진행 상태에 반영
      applyTrade(tradeRes);

      onTradeExecuted?.({
        side: tradeType,
        res: tradeRes,
        qty: tradeForm.qty,
      });

      // 거래 이벤트 저장
      await reportApi.createEvent(activeChartId, {
        type: "TRADE",
        title: `${tradeType} 실행`,
        payloadJson: {
          qty: tradeForm.qty,
          entryReason: tradeForm.entryReason,
          riskNote: tradeForm.riskNote,
          price: tradeRes.executedPrice,
        },
      });

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

      onTradeExecuted?.({
        side: "SELL",
        res,
      });

      await loadEvents(activeChartId);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "SELL ALL 실패");
    } finally {
      setLoading(false);
    }
  };

  const openBuyModal = () => {
    setTradeType("BUY");
    setTradeModalOpen(true);
  };

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
