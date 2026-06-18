import { useState } from "react";
import { reportApi } from "@/api/reportApi";
import { trainingApi } from "@/api/trainingApi";
import type { ReportDocumentResponse, TradeResponse } from "@/types/training";
import type { TradeForm } from "./training.types";

type UseTrainingTradeParams = {
  activeChartId: number | null;
  status: string;
  loadEvents: (chartId: number) => Promise<void>;
  setSnapshots: React.Dispatch<React.SetStateAction<ReportDocumentResponse[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  applyTrade: (res: TradeResponse) => void;
  currentPositionQty?: number;
  onTradeExecuted?: (input: {
    side: "BUY" | "SELL";
    res: TradeResponse;
    qty?: number;
  }) => void;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("ko-KR").format(Number(value));
}

export function useTrainingTrade({
  activeChartId,
  loadEvents,
  setError,
  applyTrade,
  onTradeExecuted,
  currentPositionQty,
}: UseTrainingTradeParams) {
  const [tradeForm, setTradeForm] = useState<TradeForm>({
    qty: 1,
    entryReason: "",
    riskNote: "",
  });

  const [loading, setLoading] = useState(false);

  const [lastSavedMessage, setLastSavedMessage] = useState<{
    text: string;
    side: "BUY" | "SELL";
  } | null>(null);

  const showSavedMessage = (text: string, side: "BUY" | "SELL") => {
    setLastSavedMessage({ text, side });

    window.setTimeout(() => {
      setLastSavedMessage(null);
    }, 3000);
  };

  const createTradeLog = async ({
    chartId,
    side,
    qty,
    res,
    sellAll = false,
  }: {
    chartId: number;
    side: "BUY" | "SELL";
    qty?: number;
    res: TradeResponse;
    sellAll?: boolean;
  }) => {
    const entryReason = tradeForm.entryReason.trim();
    const riskNote = tradeForm.riskNote.trim();

    await reportApi.createEvent(chartId, {
      type: "TRADE",
      title: sellAll ? "SELL ALL 실행" : `${side} 실행`,
      payloadJson: {
        side,
        qty,
        price: res.executedPrice,
        tradeId: res.tradeId,
        candleTime: res.candleTime,

        entryReason,
        riskNote,

        hasReason: entryReason.length > 0,
        hasRiskNote: riskNote.length > 0,
        savedForAiReview: true,
        sellAll,

        reasonVersion: 1,
      },
    });
  };

  const resetReasonOnly = () => {
    setTradeForm((prev) => ({
      ...prev,
      entryReason: "",
      riskNote: "",
    }));
  };

  const executeTrade = async (side: "BUY" | "SELL") => {
    if (!activeChartId) return;

    const qty = Number(tradeForm.qty);

    if (!qty || qty <= 0) {
      setError("수량을 올바르게 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const tradeRes =
        side === "BUY"
          ? await trainingApi.buy(activeChartId, { qty })
          : await trainingApi.sell(activeChartId, { qty });

      applyTrade(tradeRes);

      onTradeExecuted?.({
        side,
        res: tradeRes,
        qty,
      });

      await createTradeLog({
        chartId: activeChartId,
        side,
        qty,
        res: tradeRes,
      });

      showSavedMessage(
        `${side} 저장됨 · ${qty}주 · ${formatPrice(
          tradeRes.executedPrice,
        )}원 · AI 리뷰 반영`,
        side,
      );

      resetReasonOnly();
      await loadEvents(activeChartId);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? `${side} 실패`);
    } finally {
      setLoading(false);
    }
  };

  const onSellAll = async () => {
    if (!activeChartId) return;

    try {
      setLoading(true);
      setError(null);

      const sellQty = currentPositionQty ?? undefined;

      const res = await trainingApi.sellAll(activeChartId);
      applyTrade(res);

      onTradeExecuted?.({
        side: "SELL",
        res,
        qty: sellQty,
      });

      await createTradeLog({
        chartId: activeChartId,
        side: "SELL",
        qty: sellQty,
        res,
        sellAll: true,
      });

      showSavedMessage(
        `SELL ALL 저장됨 · ${formatPrice(res.executedPrice)}원 · AI 리뷰 반영`,
        "SELL",
      );

      resetReasonOnly();
      await loadEvents(activeChartId);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "SELL ALL 실패");
    } finally {
      setLoading(false);
    }
  };

  return {
    tradeForm,
    setTradeForm,
    loading,

    onSellAll,
    executeBuy: () => executeTrade("BUY"),
    executeSell: () => executeTrade("SELL"),

    lastSavedMessage,

    // 기존 코드 호환용
    tradeModalOpen: false,
    setTradeModalOpen: () => { },
    tradeType: null,
    handleConfirmTrade: () => { },
    openBuyModal: () => { },
    openSellModal: () => { },
  };
}