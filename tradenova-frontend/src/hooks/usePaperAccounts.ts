import { useCallback, useEffect, useState } from "react";
import { paperAccountApi, type PaperAccountResponse } from "@/api/paperAccountApi";

export function usePaperAccounts() {
  const [accounts, setAccounts] = useState<PaperAccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try { setAccounts(await paperAccountApi.list()); } catch { setError(true); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  return { accounts, loading, error, load, setAccounts };
}
