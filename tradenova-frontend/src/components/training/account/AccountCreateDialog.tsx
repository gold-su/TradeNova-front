import { useState } from "react";
import { paperAccountApi } from "@/api/paperAccountApi";
import { useI18n } from "@/i18n/LanguageProvider";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (accountId: number) => Promise<void>;
};

export function AccountCreateDialog({ open, onClose, onCreated }: Props) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [initialBalance, setInitialBalance] = useState(10000000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleCreate = async () => {
    if (!name.trim()) {
      setError(t("training.account.nameRequired"));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const created = await paperAccountApi.create({
        name: name.trim(),
        description: description.trim() || null,
        initialBalance,
      });

      setName("");
      setDescription("");
      setInitialBalance(10000000);

      await onCreated(created.id);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? t("training.account.createFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-background p-5 shadow-xl">
        <div className="mb-4">
          <div className="text-lg font-semibold">{t("training.account.createTitle")}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {t("training.account.createBody")}
          </div>
        </div>

        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("training.account.name")}
            className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
          />

          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("training.account.description")}
            className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
          />

          <input
            type="number"
            value={initialBalance}
            onChange={(e) => setInitialBalance(Number(e.target.value))}
            placeholder={t("training.account.initialBalance")}
            className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
          />
        </div>

        {error && <div className="mt-3 text-sm text-red-400">{error}</div>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-border/60 px-4 py-2 text-sm disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>

          <button
            type="button"
            onClick={handleCreate}
            disabled={loading}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {loading ? t("training.account.creating") : t("training.account.create")}
          </button>
        </div>
      </div>
    </div>
  );
}
