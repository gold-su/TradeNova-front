import type {
  RiskRuleResponse,
  RiskRuleUpsertRequest,
} from "../../../types/training.ts";

export const EXIT_PERCENT_CHOICES = [25, 50, 75, 100] as const;
export const DEFAULT_EXIT_PERCENT = 100;

/**
 * Converts a target price into its percentage change from the current price.
 * Empty/non-numeric targets and non-positive current prices cannot be compared.
 */
export function calculatePriceChangePercent(
  targetPrice: number | string | null | undefined,
  currentPrice: number | null | undefined,
): number | null {
  if (targetPrice === null || targetPrice === undefined || targetPrice === "") {
    return null;
  }

  const target = Number(targetPrice);
  if (
    !Number.isFinite(target) ||
    !Number.isFinite(currentPrice) ||
    (currentPrice ?? 0) <= 0
  ) {
    return null;
  }

  return ((target - currentPrice!) / currentPrice!) * 100;
}

/**
 * Returns a whole-won candidate price, matching the integer price presentation
 * used throughout the training UI.
 */
export function calculateTargetPrice(
  currentPrice: number | null | undefined,
  changePercent: number,
): number | null {
  if (
    !Number.isFinite(currentPrice) ||
    (currentPrice ?? 0) <= 0 ||
    !Number.isFinite(changePercent)
  ) {
    return null;
  }

  return Math.round(currentPrice! * (1 + changePercent / 100));
}

export type RiskRuleDraft = {
  stopLossPrice: string;
  stopLossExitPercent: string;
  takeProfitPrice: string;
  takeProfitExitPercent: string;
  autoExitEnabled: boolean;
};

export function riskRuleToDraft(
  riskRule: RiskRuleResponse | null,
): RiskRuleDraft {
  return {
    stopLossPrice: riskRule?.stopLossPrice?.toString() ?? "",
    stopLossExitPercent:
      riskRule?.stopLossExitPercent?.toString() ??
      DEFAULT_EXIT_PERCENT.toString(),
    takeProfitPrice: riskRule?.takeProfitPrice?.toString() ?? "",
    takeProfitExitPercent:
      riskRule?.takeProfitExitPercent?.toString() ??
      DEFAULT_EXIT_PERCENT.toString(),
    autoExitEnabled: riskRule?.autoExitEnabled ?? true,
  };
}

export function isValidExitPercent(value: string): boolean {
  const percent = Number(value);
  return Number.isInteger(percent) && percent >= 1 && percent <= 100;
}

export function calculateRiskRuleExitQuantity(
  positionQty: number,
  percent: number,
): number {
  if (!Number.isFinite(positionQty) || positionQty <= 0) return 0;
  if (!Number.isFinite(percent) || percent <= 0) return 0;

  const wholePosition = Math.floor(positionQty);
  if (wholePosition <= 0) return 0;
  if (percent >= 100) return wholePosition;

  return Math.min(
    wholePosition,
    Math.max(1, Math.floor((wholePosition * percent) / 100)),
  );
}

export function canConfigureRiskRule(positionQty: number): boolean {
  return Number.isFinite(positionQty) && positionQty > 0;
}

export async function submitRiskRuleDraft(
  positionQty: number,
  draft: RiskRuleDraft,
  saveRiskRule: (request: RiskRuleUpsertRequest) => void | Promise<void>,
): Promise<boolean> {
  if (!canConfigureRiskRule(positionQty)) return false;

  const request = riskRuleDraftToRequest(draft);
  if (!request) return false;

  await saveRiskRule(request);
  return true;
}

export function riskRuleDraftToRequest(
  draft: RiskRuleDraft,
): RiskRuleUpsertRequest | null {
  if (
    !isValidExitPercent(draft.stopLossExitPercent) ||
    !isValidExitPercent(draft.takeProfitExitPercent)
  ) {
    return null;
  }

  return {
    stopLossPrice: draft.stopLossPrice ? Number(draft.stopLossPrice) : null,
    stopLossExitPercent: Number(draft.stopLossExitPercent),
    takeProfitPrice: draft.takeProfitPrice ? Number(draft.takeProfitPrice) : null,
    takeProfitExitPercent: Number(draft.takeProfitExitPercent),
    autoExitEnabled: draft.autoExitEnabled,
  };
}
