import type { PaperAccountResponse } from "@/api/paperAccountApi";

export function selectTrainingAccount(
  accounts: PaperAccountResponse[],
  preferredId: number | null = null,
) {
  return (
    accounts.find((account) => account.id === preferredId) ??
    accounts.find((account) => account.isDefault) ??
    accounts[0] ??
    null
  );
}

export function trainingAccountDelta(
  account: Pick<PaperAccountResponse, "cashBalance" | "initialBalance">,
) {
  return account.cashBalance - account.initialBalance;
}

export function parseInitialBalance(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function formatTrainingMoney(
  value: number,
  currency: PaperAccountResponse["baseCurrency"] = "KRW",
) {
  const currencyCode = currency === "YEN" ? "JPY" : currency;
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(value);
}
