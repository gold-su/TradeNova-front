import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { PaperAccountDto } from "@/hooks/training/training.types";
import { AccountCreateDialog } from "./AccountCreateDialog";

type Props = {
  accounts: PaperAccountDto[];
  accountId: number | null;
  setAccountId: Dispatch<SetStateAction<number | null>>;
  hasSession: boolean;
  loadAccounts: (selectAccountId?: number) => Promise<void>;
};

function money(v: number | null | undefined) {
  if (v === null || v === undefined) return "-";
  return new Intl.NumberFormat("ko-KR").format(v);
}

export function AccountSelectorCard({
  accounts,
  accountId,
  setAccountId,
  hasSession,
  loadAccounts,
}: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const selected = useMemo(
    () => accounts.find((a) => a.id === accountId) ?? null,
    [accounts, accountId],
  );

  const initialBalance = Number(selected?.initialBalance ?? 0);
  const cashBalance = Number(selected?.cashBalance ?? 0);

  const returnRate =
    initialBalance > 0
      ? ((cashBalance - initialBalance) / initialBalance) * 100
      : 0;

  const showLockedNotice = () => {
    if (!hasSession) return;

    setNotice(
      "진행 중인 훈련에서는 계좌를 변경할 수 없습니다. 훈련을 종료한 뒤 새 계좌로 시작하세요.",
    );

    window.setTimeout(() => setNotice(null), 2500);
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold">
              {selected?.name ?? "계좌 선택"}
            </div>
            {selected?.description && (
              <div className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                {selected.description}
              </div>
            )}
          </div>

          {!hasSession && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="rounded-lg bg-background/40 px-2 py-1 text-[11px] hover:bg-background/60"
            >
              + 생성
            </button>
          )}
        </div>

        <div onClick={showLockedNotice}>
          <select
            value={accountId ?? ""}
            disabled={hasSession}
            onChange={(e) =>
              setAccountId(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full rounded-xl border border-border/50 bg-background/40 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {selected && (
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-background/30 p-3 text-[11px] text-muted-foreground">
            <div>
              <div>잔액</div>
              <div className="mt-0.5 text-sm font-semibold text-foreground">
                ₩{money(selected.cashBalance)}
              </div>
            </div>
            <div>
              <div>현금 기준 수익률</div>
              <div
                className={
                  returnRate >= 0
                    ? "mt-0.5 text-sm font-semibold text-green-400"
                    : "mt-0.5 text-sm font-semibold text-red-400"
                }
              >
                {returnRate >= 0 ? "+" : ""}
                {returnRate.toFixed(2)}%
              </div>
            </div>
          </div>
        )}

        {notice && (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-[11px] text-yellow-200">
            {notice}
          </div>
        )}

        {!hasSession && (
          <div className="text-[11px] leading-5 text-muted-foreground">
            훈련을 시작할 계좌를 선택하세요.
          </div>
        )}
      </div>

      <AccountCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={async (createdId) => {
          await loadAccounts(hasSession ? undefined : createdId);
        }}
      />
    </>
  );
}
