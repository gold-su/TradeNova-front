import type {
  RiskRuleResponse,
  RiskRuleUpsertRequest,
} from "../../../types/training.ts";

export const EXIT_PERCENT_CHOICES = [25, 50, 75, 100] as const;
export const DEFAULT_EXIT_PERCENT = 100;

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
