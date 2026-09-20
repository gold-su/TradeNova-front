import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { paperAccountApi, type PaperAccountResponse } from "@/api/paperAccountApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePaperAccounts } from "@/hooks/usePaperAccounts";
import { cashDelta, formatWon, selectPrimaryAccount } from "./accountPerformance";

export default function MyAccountsPage() {
  const { accounts, loading: listLoading, error, load, setAccounts } = usePaperAccounts();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [initialBalance, setInitialBalance] = useState("10000000");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const selected = useMemo(() => accounts.find((account) => account.id === selectedId) ?? selectPrimaryAccount(accounts), [accounts, selectedId]);

  const mutate = async (action: () => Promise<unknown>, success: string) => { setBusy(true); setMessage(null); try { await action(); await load(); setMessage(success); } catch { setMessage("요청을 처리하지 못했습니다."); } finally { setBusy(false); } };
  const create = async () => { const balance = Number(initialBalance); if (!name.trim() || !Number.isFinite(balance) || balance <= 0) { setMessage("계좌 이름과 올바른 초기 자본을 입력하세요."); return; } await mutate(async () => { await paperAccountApi.create({ name: name.trim(), description: description.trim() || null, initialBalance: balance }); setName(""); setDescription(""); }, "계좌를 생성했습니다."); };
  const update = async () => { if (!selected) return; await mutate(() => paperAccountApi.update(selected.id, { name: selected.name, description: selected.description ?? null }), "계좌 정보를 저장했습니다."); };
  const reset = async () => { if (!selected || !window.confirm("계좌 현금을 초기 자본으로 되돌릴까요?")) return; await mutate(() => paperAccountApi.reset(selected.id), "계좌를 초기화했습니다."); };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
      <header><Link to="/mypage" className="text-xs text-muted-foreground hover:text-foreground">마이페이지</Link><h1 className="mt-2 text-2xl font-semibold tracking-tight">훈련 계좌 관리</h1><p className="mt-1 text-sm text-muted-foreground">훈련에 사용할 계좌를 만들고 기본 계좌를 관리합니다.</p></header>
      {message && <p role="status" className="mt-5 rounded-lg bg-muted/15 px-3 py-2 text-sm text-muted-foreground">{message}</p>}
      {listLoading && <div className="mt-7 h-40 animate-pulse rounded-xl bg-muted/20" />}
      {error && <div className="mt-7 py-12 text-center"><p className="text-sm text-muted-foreground">계좌를 불러오지 못했습니다.</p><Button variant="outline" size="sm" className="mt-3" onClick={() => void load()}>다시 시도</Button></div>}
      {!listLoading && !error && <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <section><div className="flex items-center justify-between gap-3"><h2 className="text-sm font-semibold">내 계좌</h2><span className="text-xs text-muted-foreground">{accounts.length}개</span></div>{accounts.length ? <div className="mt-3 space-y-3">{accounts.map((account) => <AccountEditor key={account.id} account={account} selected={selected?.id === account.id} busy={busy} onSelect={() => setSelectedId(account.id)} onChange={(next) => setAccounts((current) => current.map((item) => item.id === next.id ? next : item))} onSave={update} onDefault={() => void mutate(() => paperAccountApi.setDefault(account.id), "기본 계좌를 변경했습니다.")} onReset={reset} />)}</div> : <p className="mt-4 text-sm text-muted-foreground">등록된 계좌가 없습니다.</p>}</section>
        <section className="h-fit rounded-xl bg-muted/[0.08] p-4 ring-1 ring-border/35"><h2 className="text-sm font-semibold">새 계좌</h2><div className="mt-4 space-y-3"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="계좌 이름" /><Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="설명 (선택)" /><div><label className="text-xs text-muted-foreground" htmlFor="initial-balance">초기 자본</label><Input id="initial-balance" type="number" min="1" value={initialBalance} onChange={(event) => setInitialBalance(event.target.value)} className="mt-1" /></div><Button className="w-full" disabled={busy} onClick={() => void create()}>계좌 생성</Button></div></section>
      </div>}
    </div>
  );
}

function AccountEditor({ account, selected, busy, onSelect, onChange, onSave, onDefault, onReset }: { account: PaperAccountResponse; selected: boolean; busy: boolean; onSelect: () => void; onChange: (account: PaperAccountResponse) => void; onSave: () => void; onDefault: () => void; onReset: () => void }) {
  const delta = cashDelta(account);
  return <div className={`rounded-xl p-4 ring-1 ${selected ? "bg-primary/[0.04] ring-primary/30" : "bg-muted/[0.05] ring-border/35"}`} onClick={onSelect}><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><p className="text-sm font-semibold">{account.name}</p>{account.isDefault && <span className="text-[10px] text-primary">기본</span>}</div><p className="mt-1 text-xs text-muted-foreground">사용 가능 현금 {formatWon(account.cashBalance)} · 현금 증감 <span className={delta > 0 ? "text-emerald-400" : delta < 0 ? "text-red-300" : ""}>{formatWon(delta, true)}</span></p></div>{!account.isDefault && <Button variant="ghost" size="sm" disabled={busy} onClick={(event) => { event.stopPropagation(); onDefault(); }}>기본 계좌로 설정</Button>}</div>{selected && <div className="mt-4 grid gap-3 sm:grid-cols-2"><Input value={account.name} onChange={(event) => onChange({ ...account, name: event.target.value })} /><Input value={account.description ?? ""} placeholder="설명" onChange={(event) => onChange({ ...account, description: event.target.value })} /><div className="sm:col-span-2 flex flex-wrap gap-2"><Button size="sm" disabled={busy || !account.name.trim()} onClick={onSave}>저장</Button><Button size="sm" variant="outline" disabled={busy} onClick={onReset}>현금 초기화</Button></div></div>}</div>;
}
