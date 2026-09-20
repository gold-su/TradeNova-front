import type { PaperAccountResponse } from "@/api/paperAccountApi";

export function selectPrimaryAccount(accounts: PaperAccountResponse[]) {
  return accounts.find((account) => account.isDefault) ?? accounts[0] ?? null;
}

export function cashDelta(account: Pick<PaperAccountResponse, "initialBalance" | "cashBalance">) {
  return account.cashBalance - account.initialBalance;
}

export function formatWon(value: number, signed = false) {
  const prefix = signed && value > 0 ? "+" : "";
  return `${prefix}${new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 }).format(value)}원`;
}
