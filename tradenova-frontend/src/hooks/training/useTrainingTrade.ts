import { useEffect, useState } from "react";
import axios from "axios";
import { reportApi } from "@/api/reportApi";
import { trainingApi } from "@/api/trainingApi";
import type {
  ReportDocumentResponse,
  TradeResponse,
  TrainingEventResponse,
} from "@/types/training";
import type { TradeForm } from "./training.types";
import {
  buildTradeEventPayload,
  clearPendingTradeReason,
} from "./trainingTradeReason";

type UseTrainingTradeParams = {
  mutationGuard: { current: boolean };
  activeChartId: number | null;
  status: string;
  setSnapshots: React.Dispatch<React.SetStateAction<ReportDocumentResponse[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  applyTrade: (res: TradeResponse) => void;
  currentPositionQty?: number;
  onTradeExecuted?: (input: {
    side: "BUY" | "SELL";
    res: TradeResponse;
    qty?: number;
  }) => void;
  appendEvent: (event: TrainingEventResponse) => void;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("ko-KR").format(Number(value));
}

export function useTrainingTrade({
  mutationGuard,
  activeChartId,
  setError,
  applyTrade,
  onTradeExecuted,
  currentPositionQty,
  appendEvent,
}: UseTrainingTradeParams) {

  const [tradeForm, setTradeForm] = useState<TradeForm>({
    qty: 1,
    entryReason: "",
    riskNote: "",
    reasons: [],
    reasonMode: "MANUAL",
    scenarioSnapshotId: null,
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

    return await reportApi.createEvent(chartId, {
      type: "TRADE",
      title: sellAll ? "SELL ALL 실행" : `${side} 실행`,
      payloadJson: buildTradeEventPayload({ side, qty, res, tradeForm, sellAll }),
    });
  };

  const resetReasonOnly = () => {
    setTradeForm(clearPendingTradeReason);
  };

  useEffect(() => {
    setTradeForm(clearPendingTradeReason);
  }, [activeChartId]);

  const executeTrade = async (side: "BUY" | "SELL") => {
    if (!activeChartId) return false;

    const qty = Number(tradeForm.qty);

    if (!Number.isInteger(qty) || qty <= 0) {
      setError("수량을 올바르게 입력해주세요.");
      return false;
    }

    if (mutationGuard.current) return false;
    mutationGuard.current = true;

    try {
      setLoading(true);
      setError(null);

      let tradeRes: TradeResponse;

      try {
        tradeRes =
          side === "BUY"
            ? await trainingApi.buy(activeChartId, { qty })
            : await trainingApi.sell(activeChartId, { qty });
      } catch (error: unknown) {
        setError(
          axios.isAxiosError<{ message?: string }>(error)
            ? (error.response?.data?.message ?? `${side} 실패`)
            : `${side} 실패`,
        );
        return false;
      }

      applyTrade(tradeRes);

      onTradeExecuted?.({
        side,
        res: tradeRes,
        qty,
      });

      let eventSaved = true;

      try {
        const event = await createTradeLog({
          chartId: activeChartId,
          side,
          qty,
          res: tradeRes,
        });

        appendEvent(event);
      } catch {
        eventSaved = false;
        setError("거래는 성공했지만 매매 로그 저장에 실패했습니다.");
      }

      showSavedMessage(
        eventSaved
          ? `${side} 저장됨 · ${qty}주 · ${formatPrice(
            tradeRes.executedPrice,
          )}원 · AI 리뷰 반영`
          : `${side} 체결됨 · ${qty}주 · ${formatPrice(
            tradeRes.executedPrice,
          )}원 · 매매 로그 저장 실패`,
        side,
      );

      resetReasonOnly();
      return true;
    } finally {
      setLoading(false);
      mutationGuard.current = false;
    }
  };

  const onSellAll = async () => {
    if (!activeChartId) return false;

    if (mutationGuard.current) return false;
    mutationGuard.current = true;

    try {
      setLoading(true);
      setError(null);

      const sellQty = currentPositionQty ?? undefined;

      let res: TradeResponse;

      try {
        res = await trainingApi.sellAll(activeChartId);
      } catch (error: unknown) {
        setError(
          axios.isAxiosError<{ message?: string }>(error)
            ? (error.response?.data?.message ?? "SELL ALL 실패")
            : "SELL ALL 실패",
        );
        return false;
      }

      applyTrade(res);

      // 포지션이 없으면 백엔드는 snapshot만 담고 실제 거래는 생성하지 않는다.
      if (res.tradeId == null) return false;

      onTradeExecuted?.({
        side: "SELL",
        res,
        qty: sellQty,
      });

      let eventSaved = true;

      try {
        const event = await createTradeLog({
          chartId: activeChartId,
          side: "SELL",
          qty: sellQty,
          res,
          sellAll: true,
        });

        appendEvent(event);
      } catch {
        eventSaved = false;
        setError("거래는 성공했지만 매매 로그 저장에 실패했습니다.");
      }

      showSavedMessage(
        eventSaved
          ? `SELL ALL 저장됨 · ${formatPrice(res.executedPrice)}원 · AI 리뷰 반영`
          : `SELL ALL 체결됨 · ${formatPrice(res.executedPrice)}원 · 매매 로그 저장 실패`,
        "SELL",
      );

      resetReasonOnly();
      return true;
    } finally {
      setLoading(false);
      mutationGuard.current = false;
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
