import { useState } from "react";
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
  buildWaitEventPayload,
  buildTradeEventPayload,
  canSubmitDecisionAction,
  clearPendingTradeReason,
} from "./trainingTradeReason";
import { useI18n } from "@/i18n/LanguageProvider";

type UseTrainingTradeParams = {
  mutationGuard: { current: boolean };
  activeChartId: number | null;
  status: string;
  setSnapshots: React.Dispatch<React.SetStateAction<ReportDocumentResponse[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  applyTrade: (res: TradeResponse) => void;
  currentPositionQty?: number;
  currentPrice?: number;
  currentCandleTime?: number | null;
  onTradeExecuted?: (input: {
    side: "BUY" | "SELL";
    res: TradeResponse;
    qty?: number;
  }) => void;
  appendEvent: (event: TrainingEventResponse) => void;
};

function formatPrice(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(Number(value));
}

export function useTrainingTrade({
  mutationGuard: mutationGuardRef,
  activeChartId,
  setError,
  applyTrade,
  onTradeExecuted,
  currentPositionQty,
  currentPrice,
  currentCandleTime,
  appendEvent,
}: UseTrainingTradeParams) {
  const { language, t } = useI18n();
  const locale = language === "ko" ? "ko-KR" : "en-US";
  const relationLabel = () => tradeForm.planRelation ? t(`training.relation.${tradeForm.planRelation === "FOLLOWED_PLAN" ? "followed" : tradeForm.planRelation === "CHANGED_PLAN" ? "changed" : "unplanned"}`) : "-";

  const [tradeForm, setTradeForm] = useState<TradeForm>({
    qty: 1,
    entryReason: "",
    riskNote: "",
    reasons: [],
    reasonMode: "MANUAL",
    scenarioSnapshotId: null,
    planRelation: null,
    changeReason: "",
  });
  const [tradeFormChartId, setTradeFormChartId] = useState(activeChartId);

  if (tradeFormChartId !== activeChartId) {
    setTradeFormChartId(activeChartId);
    setTradeForm(clearPendingTradeReason);
  }

  const [loading, setLoading] = useState(false);

  const [lastSavedMessage, setLastSavedMessage] = useState<{
    text: string;
    side: "BUY" | "SELL" | "WAIT";
  } | null>(null);

  const showSavedMessage = (text: string, side: "BUY" | "SELL" | "WAIT") => {
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
      title: t("training.action.executionEvent", { side: sellAll ? "SELL ALL" : side }),
      payloadJson: buildTradeEventPayload({
        side,
        qty,
        res,
        tradeForm,
        sellAll,
        claimCopy: {
          followedTitle: t("training.relation.followedClaim"),
          changedTitle: t("training.relation.changedClaim"),
          entryConditionMet: t("training.relation.entryConditionMet"),
          exitConditionMet: t("training.relation.exitConditionMet"),
          changedReason: t("training.relation.changedClaimReason"),
        },
      }),
    });
  };

  const resetReasonOnly = () => {
    setTradeForm(clearPendingTradeReason);
  };

  const executeTrade = async (side: "BUY" | "SELL") => {
    if (!activeChartId) return false;
    if (!canSubmitDecisionAction(tradeForm)) {
      setError(t("training.relation.required"));
      return false;
    }

    const qty = Number(tradeForm.qty);

    if (!Number.isInteger(qty) || qty <= 0) {
      setError(t("training.action.invalidQuantity"));
      return false;
    }

    if (mutationGuardRef.current) return false;
    mutationGuardRef.current = true;

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
            ? (error.response?.data?.message ?? t("training.action.executionFailed", { side }))
            : t("training.action.executionFailed", { side }),
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
        setError(t("training.action.evidenceSaveFailed"));
      }

      showSavedMessage(
        eventSaved
          ? `${t("training.action.executed", { side })}\n${t("training.action.quantityPrice", { qty: qty.toLocaleString(locale), price: formatPrice(tradeRes.executedPrice, locale) })} · ${relationLabel()}`
          : `${t("training.action.executed", { side })} · ${t("training.action.quantityPrice", { qty, price: formatPrice(tradeRes.executedPrice, locale) })} · ${t("training.action.evidenceFailedSuffix")}`,
        side,
      );

      resetReasonOnly();
      return true;
    } finally {
      setLoading(false);
      mutationGuardRef.current = false;
    }
  };

  const executeWait = async () => {
    if (!activeChartId) return false;
    if (!canSubmitDecisionAction(tradeForm)) {
      setError(t("training.relation.required"));
      return false;
    }
    if (mutationGuardRef.current) return false;
    mutationGuardRef.current = true;
    try {
      setLoading(true);
      setError(null);
      const event = await reportApi.createEvent(activeChartId, {
        type: "TRADE",
        title: t("training.action.waitEvent"),
        payloadJson: buildWaitEventPayload({
          candleTime: currentCandleTime ?? null,
          price: currentPrice ?? null,
          tradeForm,
        }),
      });
      appendEvent(event);
      showSavedMessage(
        `${t("training.action.waitEvent")}\n${relationLabel()}`,
        "WAIT",
      );
      resetReasonOnly();
      return true;
    } catch {
      setError(t("training.action.waitSaveFailed"));
      return false;
    } finally {
      setLoading(false);
      mutationGuardRef.current = false;
    }
  };

  const onSellAll = async () => {
    if (!activeChartId) return false;
    if (!canSubmitDecisionAction(tradeForm)) {
      setError(t("training.relation.required"));
      return false;
    }

    if (mutationGuardRef.current) return false;
    mutationGuardRef.current = true;

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
            ? (error.response?.data?.message ?? t("training.action.executionFailed", { side: "SELL ALL" }))
            : t("training.action.executionFailed", { side: "SELL ALL" }),
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
        setError(t("training.action.evidenceSaveFailed"));
      }

      showSavedMessage(
        eventSaved
          ? `${t("training.action.executed", { side: "SELL" })}\n${sellQty == null ? t("training.action.allShares") : t("training.action.quantityPrice", { qty: sellQty.toLocaleString(locale), price: formatPrice(res.executedPrice, locale) })} · ${relationLabel()}`
          : `${t("training.action.executed", { side: "SELL ALL" })} · ₩${formatPrice(res.executedPrice, locale)} · ${t("training.action.evidenceFailedSuffix")}`,
        "SELL",
      );

      resetReasonOnly();
      return true;
    } finally {
      setLoading(false);
      mutationGuardRef.current = false;
    }
  };

  return {
    tradeForm,
    setTradeForm,
    loading,

    onSellAll,
    executeBuy: () => executeTrade("BUY"),
    executeSell: () => executeTrade("SELL"),
    executeWait,

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
