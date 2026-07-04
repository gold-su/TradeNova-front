import { useEffect, useState } from "react";
import { reportApi } from "@/api/reportApi";
import type {
  QuickPhraseResponse,
  ReportDocumentResponse,
  ReportDraftContent,
  TrainingEventResponse,
} from "@/types/training";
import { emptyDraft } from "./training.utils";

/**
 * 훈련 화면의 "리포트/이벤트/스냅샷/빠른문구" 관련 로직을 담당하는 훅
 *
 * 담당 책임:
 * - quick phrase 로드
 * - active chart 기준 draft / snapshots / events 로드
 * - draft 저장
 * - snapshot 저장
 * - note 이벤트 저장
 */
export function useTrainingReport(activeChartId: number | null) {
  // ===== 리포트 관련 상태 =====
  const [quickPhrases, setQuickPhrases] = useState<QuickPhraseResponse[]>([]);
  const [events, setEvents] = useState<TrainingEventResponse[]>([]);

  const appendEvent = (event: TrainingEventResponse) => {
    setEvents((prev) => [event, ...prev]);
  };

  const [snapshots, setSnapshots] = useState<ReportDocumentResponse[]>([]);
  const [draft, setDraft] = useState<ReportDraftContent>(emptyDraft);

  // ===== 로딩 / 에러 =====
  const [draftSaving, setDraftSaving] = useState(false);
  const [eventLoading, setEventLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 빠른 문구 목록 로드
   */
  const loadQuickPhrases = async () => {
    try {
      const data = await reportApi.getQuickPhrases();
      setQuickPhrases(data);
    } catch (e) {
      console.error("quick phrase load failed", e);
    }
  };

  /**
   * 현재 활성 차트의 draft 로드
   * 없으면 emptyDraft로 초기화
   */
  const loadDraft = async (chartId: number) => {
    try {
      const data = await reportApi.getDraft(chartId);

      if (data?.contentJson) {
        setDraft({
          thesis: data.contentJson.thesis ?? "",
          entryReason: data.contentJson.entryReason ?? "",
          exitPlan: data.contentJson.exitPlan ?? "",
          riskNote: data.contentJson.riskNote ?? "",
          freeNote: data.contentJson.freeNote ?? "",
          tags: data.contentJson.tags ?? [],
        });
      } else {
        setDraft(emptyDraft);
      }
    } catch (e) {
      console.error("draft load failed", e);
    }
  };

  /**
   * 현재 활성 차트의 이벤트 로그 로드
   */
  const loadEvents = async (chartId: number) => {
    try {
      setEventLoading(true);
      const data = await reportApi.getEvents(chartId, 50);
      setEvents(data);
    } catch (e) {
      console.error("event load failed", e);
    } finally {
      setEventLoading(false);
    }
  };

  /**
   * 현재 활성 차트의 스냅샷 목록 로드
   */
  const loadSnapshots = async (chartId: number) => {
    try {
      const data = await reportApi.getSnapshots(chartId);
      setSnapshots(data);
    } catch (e) {
      console.error("snapshot load failed", e);
    }
  };

  /**
   * draft 저장
   */
  const onSaveDraft = async () => {
    if (!activeChartId) return;

    try {
      setDraftSaving(true);
      setError(null);

      await reportApi.upsertDraft(activeChartId, {
        contentJson: draft,
      });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "드래프트 저장 실패");
    } finally {
      setDraftSaving(false);
    }
  };

  /**
   * 현재 draft를 snapshot으로 저장하고
   * 저장된 snapshot을 목록 맨 앞에 추가한다.
   */
  const onCreateSnapshot = async () => {
    if (!activeChartId) return;

    try {
      setError(null);

      const saved = await reportApi.createSnapshot(activeChartId, {
        linkedEventId: null,
        contentJson: draft,
      });

      setSnapshots((prev) => [saved, ...prev]);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "스냅샷 저장 실패");
    }
  };

  const onCreateScenarioSnapshot = async (
    targetChartId: number,
    content: {
      thesis: string;
      entryReason: string;
      exitPlan: string;
      riskNote: string;
      freeNote: string;
    },
  ) => {
    try {
      setError(null);

      const scenarioContent: ReportDraftContent = {
        thesis: content.thesis,
        entryReason: content.entryReason,
        exitPlan: content.exitPlan,
        riskNote: content.riskNote,
        freeNote: content.freeNote,
        tags: ["SCENARIO"],
      };

      const saved = await reportApi.createSnapshot(targetChartId, {
        linkedEventId: null,
        contentJson: scenarioContent,
      });

      const event = await reportApi.createEvent(targetChartId, {
        type: "SNAPSHOT",
        title: content.thesis?.trim() || "시나리오 저장",
        payloadJson: {
          scenario: true,
          snapshotId: saved.id,
          ...scenarioContent,
        },
      });

      if (targetChartId === activeChartId) {
        appendEvent(event);
      }

      if (targetChartId === activeChartId) {
        setSnapshots((prev) => [saved, ...prev]);
      }

      return saved;
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "시나리오 저장 실패");
      return null;
    }
  };

  /**
   * 현재 draft 내용을 NOTE 이벤트로 저장
   */
  const onCreateNoteEvent = async () => {
    if (!activeChartId) return;

    try {
      setError(null);

      const event = await reportApi.createEvent(activeChartId, {
        type: "NOTE",
        title: draft.thesis?.trim() || "수동 메모",
        payloadJson: {
          thesis: draft.thesis ?? "",
          entryReason: draft.entryReason ?? "",
          exitPlan: draft.exitPlan ?? "",
          riskNote: draft.riskNote ?? "",
          freeNote: draft.freeNote ?? "",
          tags: draft.tags ?? [],
        },
      });

      appendEvent(event);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "메모 이벤트 저장 실패");
    }
  };

  /**
   * quick phrase를 freeNote 맨 아래에 붙인다.
   */
  const appendQuickPhrase = (content: string) => {
    setDraft((prev) => ({
      ...prev,
      freeNote: [prev.freeNote ?? "", content].filter(Boolean).join("\n"),
    }));
  };

  // 빠른문구는 최초 1회만 로드
  useEffect(() => {
    loadQuickPhrases();
  }, []);

  // active chart가 바뀌면 리포트 관련 데이터도 다시 로드
  useEffect(() => {
    if (!activeChartId) return;

    loadDraft(activeChartId);
    loadEvents(activeChartId);
    loadSnapshots(activeChartId);
  }, [activeChartId]);

  return {
    quickPhrases,
    events,
    snapshots,
    draft,
    setDraft,

    draftSaving,
    eventLoading,
    error,
    setError,

    loadQuickPhrases,
    loadDraft,
    loadEvents,
    loadSnapshots,

    onSaveDraft,
    onCreateSnapshot,
    onCreateNoteEvent,
    appendQuickPhrase,

    setSnapshots,
    onCreateScenarioSnapshot,
    appendEvent,
  };
}
