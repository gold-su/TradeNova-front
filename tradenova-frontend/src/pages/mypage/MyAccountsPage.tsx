import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import { paperAccountApi, type PaperAccountResponse } from "@/api/paperAccountApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatTrainingMoney,
  parseInitialBalance,
  selectTrainingAccount,
  trainingAccountDelta,
} from "./trainingAccountPresentation";

type StatusMessage = { tone: "success" | "error"; text: string } | null;

export default function MyAccountsPage() {
  const [accounts, setAccounts] = useState<PaperAccountResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createBalance, setCreateBalance] = useState("10000000");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [status, setStatus] = useState<StatusMessage>(null);

  const selected = useMemo(
    () => accounts.find((account) => account.id === selectedId) ?? null,
    [accounts, selectedId],
  );

  const syncSelection = useCallback((account: PaperAccountResponse | null) => {
    setSelectedId(account?.id ?? null);
    setEditName(account?.name ?? "");
    setEditDescription(account?.description ?? "");
  }, []);

  const loadAccounts = useCallback(async (preferredId: number | null = null) => {
    try {
      const list = await paperAccountApi.list();
      setAccounts(list);
      syncSelection(selectTrainingAccount(list, preferredId));
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [syncSelection]);

  useEffect(() => {
    let cancelled = false;

    void paperAccountApi
      .list()
      .then((list) => {
        if (cancelled) return;
        const initialAccount = selectTrainingAccount(list);
        setAccounts(list);
        setSelectedId(initialAccount?.id ?? null);
        setEditName(initialAccount?.name ?? "");
        setEditDescription(initialAccount?.description ?? "");
        setLoadError(false);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const retryLoad = () => {
    setLoading(true);
    setLoadError(false);
    void loadAccounts(selectedId);
  };

  const selectAccount = (account: PaperAccountResponse) => {
    if (busy) return;
    setStatus(null);
    syncSelection(account);
  };

  const createAccount = async () => {
    const initialBalance = parseInitialBalance(createBalance);
    if (!createName.trim() || initialBalance === null) {
      setStatus({ tone: "error", text: "계좌 이름과 0보다 큰 초기 자본을 입력해 주세요." });
      return;
    }

    setBusy(true);
    setStatus(null);
    try {
      const created = await paperAccountApi.create({
        name: createName.trim(),
        description: createDescription.trim() || null,
        initialBalance,
      });
      setCreateName("");
      setCreateDescription("");
      setCreateBalance("10000000");
      await loadAccounts(created.id);
      setStatus({ tone: "success", text: "훈련 계좌를 만들었습니다." });
    } catch {
      setStatus({ tone: "error", text: "훈련 계좌를 만들지 못했습니다. 잠시 후 다시 시도해 주세요." });
    } finally {
      setBusy(false);
    }
  };

  const updateAccount = async () => {
    if (!selected) return;
    if (!editName.trim()) {
      setStatus({ tone: "error", text: "계좌 이름을 입력해 주세요." });
      return;
    }

    setBusy(true);
    setStatus(null);
    try {
      await paperAccountApi.update(selected.id, {
        name: editName.trim(),
        description: editDescription.trim() || null,
      });
      await loadAccounts(selected.id);
      setStatus({ tone: "success", text: "훈련 계좌 정보를 저장했습니다." });
    } catch {
      setStatus({ tone: "error", text: "훈련 계좌 정보를 저장하지 못했습니다." });
    } finally {
      setBusy(false);
    }
  };

  const setDefaultAccount = async () => {
    if (!selected || selected.isDefault) return;
    setBusy(true);
    setStatus(null);
    try {
      await paperAccountApi.setDefault(selected.id);
      await loadAccounts(selected.id);
      setStatus({ tone: "success", text: "기본 훈련 계좌로 설정했습니다." });
    } catch {
      setStatus({ tone: "error", text: "기본 계좌 설정을 변경하지 못했습니다." });
    } finally {
      setBusy(false);
    }
  };

  const resetAccount = async () => {
    if (!selected || !window.confirm("이 훈련 계좌의 현금 잔액을 초기화할까요?")) return;
    setBusy(true);
    setStatus(null);
    try {
      await paperAccountApi.reset(selected.id);
      await loadAccounts(selected.id);
      setStatus({ tone: "success", text: "훈련 계좌의 현금 잔액을 초기화했습니다." });
    } catch {
      setStatus({ tone: "error", text: "훈련 계좌를 초기화하지 못했습니다." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:py-10">
      <header className="border-b border-border/45 pb-5">
        <Link to="/mypage" className="inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground">
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />마이페이지
        </Link>
        <div className="mt-3 flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary"><WalletCards className="h-5 w-5" aria-hidden="true" /></div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">훈련 계좌 관리</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">가상 훈련에 사용할 현금 계좌입니다. 실제 증권계좌나 주문 계좌와 연결되지 않습니다.</p>
          </div>
        </div>
      </header>

      {status && (
        <p
          role="status"
          className={`mt-5 rounded-lg border px-4 py-3 text-sm ${status.tone === "error" ? "border-red-400/20 bg-red-400/[0.06] text-red-200" : "border-primary/20 bg-primary/[0.06] text-foreground"}`}
        >
          {status.text}
        </p>
      )}

      {loading && <div className="mt-7 h-48 animate-pulse rounded-xl bg-muted/20" aria-label="훈련 계좌 불러오는 중" />}

      {!loading && loadError && (
        <div className="mt-7 rounded-xl border border-dashed border-border/55 px-4 py-14 text-center">
          <p className="text-sm text-muted-foreground">훈련 계좌를 불러오지 못했습니다.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={retryLoad}>다시 시도</Button>
        </div>
      )}

      {!loading && !loadError && (
        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(240px,0.7fr)_minmax(0,1.3fr)]">
          <section aria-labelledby="account-list-heading" className="min-w-0">
            <div className="flex items-center justify-between gap-3">
              <h2 id="account-list-heading" className="text-sm font-semibold">내 훈련 계좌</h2>
              <span className="text-xs tabular-nums text-muted-foreground">{accounts.length}개</span>
            </div>
            <div className="mt-3 space-y-2">
              {accounts.map((account) => {
                const isSelected = account.id === selectedId;
                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => selectAccount(account)}
                    className={`w-full rounded-xl px-4 py-3 text-left ring-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${isSelected ? "bg-primary/[0.07] ring-primary/35" : "bg-muted/[0.05] ring-border/35 hover:bg-muted/[0.12]"}`}
                    aria-pressed={isSelected}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate text-sm font-semibold">{account.name}</span>
                      {account.isDefault && <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">기본</span>}
                    </span>
                    <span className="mt-1 block text-xs tabular-nums text-muted-foreground">사용 가능 현금 {formatTrainingMoney(account.cashBalance, account.baseCurrency)}</span>
                  </button>
                );
              })}
              {accounts.length === 0 && (
                <div className="rounded-xl border border-dashed border-border/55 px-4 py-8 text-center text-sm text-muted-foreground">등록된 훈련 계좌가 없습니다.</div>
              )}
            </div>
          </section>

          <div className="min-w-0 space-y-5">
            <section aria-labelledby="selected-account-heading" className="rounded-xl bg-muted/[0.06] p-4 ring-1 ring-border/35 sm:p-5">
              <h2 id="selected-account-heading" className="text-sm font-semibold">선택 계좌</h2>
              {selected ? (
                <>
                  <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <AccountMetric label="사용 가능 현금" value={formatTrainingMoney(selected.cashBalance, selected.baseCurrency)} />
                    <AccountMetric label="초기 자본" value={formatTrainingMoney(selected.initialBalance, selected.baseCurrency)} />
                    <AccountMetric
                      label="현금 증감"
                      value={formatTrainingMoney(trainingAccountDelta(selected), selected.baseCurrency)}
                      tone={trainingAccountDelta(selected)}
                    />
                  </dl>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="training-account-name">계좌 이름</Label>
                      <Input id="training-account-name" className="mt-1.5" value={editName} onChange={(event) => setEditName(event.target.value)} maxLength={100} disabled={busy} />
                    </div>
                    <div>
                      <Label htmlFor="training-account-description">설명 <span className="font-normal text-muted-foreground">(선택)</span></Label>
                      <Input id="training-account-description" className="mt-1.5" value={editDescription} onChange={(event) => setEditDescription(event.target.value)} maxLength={255} disabled={busy} />
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button size="sm" disabled={busy || !editName.trim()} onClick={() => void updateAccount()}>변경 저장</Button>
                    <Button size="sm" variant="outline" disabled={busy || selected.isDefault} onClick={() => void setDefaultAccount()}>기본 계좌로 설정</Button>
                    <Button size="sm" variant="ghost" disabled={busy} onClick={() => void resetAccount()}>현금 초기화</Button>
                  </div>
                </>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">왼쪽에서 계좌를 선택하거나 새 계좌를 만들어 주세요.</p>
              )}
            </section>

            <section aria-labelledby="create-account-heading" className="rounded-xl bg-muted/[0.06] p-4 ring-1 ring-border/35 sm:p-5">
              <h2 id="create-account-heading" className="text-sm font-semibold">새 훈련 계좌</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="new-account-name">계좌 이름</Label>
                  <Input id="new-account-name" className="mt-1.5" value={createName} onChange={(event) => setCreateName(event.target.value)} maxLength={100} disabled={busy} placeholder="예: 기본 훈련 계좌" />
                </div>
                <div>
                  <Label htmlFor="new-account-balance">초기 자본</Label>
                  <Input id="new-account-balance" className="mt-1.5" type="number" min="1" step="100000" value={createBalance} onChange={(event) => setCreateBalance(event.target.value)} disabled={busy} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="new-account-description">설명 <span className="font-normal text-muted-foreground">(선택)</span></Label>
                  <Input id="new-account-description" className="mt-1.5" value={createDescription} onChange={(event) => setCreateDescription(event.target.value)} maxLength={255} disabled={busy} placeholder="계좌를 구분할 짧은 설명" />
                </div>
              </div>
              <Button className="mt-5" size="sm" disabled={busy} onClick={() => void createAccount()}>{busy ? "처리 중" : "훈련 계좌 만들기"}</Button>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

function AccountMetric({ label, value, tone = 0 }: { label: string; value: string; tone?: number }) {
  const toneClass = tone > 0 ? "text-emerald-300" : tone < 0 ? "text-red-200" : "text-foreground";
  return <div className="min-w-0"><dt className="text-[11px] text-muted-foreground">{label}</dt><dd className={`mt-1 truncate text-base font-semibold tabular-nums sm:text-lg ${toneClass}`} title={value}>{value}</dd></div>;
}
