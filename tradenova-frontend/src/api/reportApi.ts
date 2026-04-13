// src/api/reportApi.ts
import http from "./http";
import type {
    QuickPhraseCreateRequest,
    QuickPhraseResponse,
    QuickPhraseUpdateRequest,
    ReportDocumentResponse,
    ReportDraftUpsertRequest,
    ReportSnapshotCreateRequest,
    TrainingEventAppendRequest,
    TrainingEventResponse,
} from "@/types/training";

export const reportApi = {
  // ===== Quick Phrase =====
  getQuickPhrases: () =>
    http
      .get<QuickPhraseResponse[]>("/api/reports/quick-phrases")
      .then((r) => r.data),

  createQuickPhrase: (body: QuickPhraseCreateRequest) =>
    http
      .post<QuickPhraseResponse>("/api/reports/quick-phrases", body)
      .then((r) => r.data),

  updateQuickPhrase: (id: number, body: QuickPhraseUpdateRequest) =>
    http
      .patch<QuickPhraseResponse>(`/api/reports/quick-phrases/${id}`, body)
      .then((r) => r.data),

  deleteQuickPhrase: (id: number) =>
    http.delete(`/api/reports/quick-phrases/${id}`).then((r) => r.data),

  // ===== Draft =====
  getDraft: (chartId: number) =>
    http
      .get<ReportDocumentResponse | null>(
        `/api/reports/charts/${chartId}/draft`,
      )
      .then((r) => r.data),

  upsertDraft: (chartId: number, body: ReportDraftUpsertRequest) =>
    http
      .put<ReportDocumentResponse>(`/api/reports/charts/${chartId}/draft`, body)
      .then((r) => r.data),

  // ===== Snapshot =====
  createSnapshot: (chartId: number, body: ReportSnapshotCreateRequest) =>
    http
      .post<ReportDocumentResponse>(
        `/api/reports/charts/${chartId}/snapshots`,
        body,
      )
      .then((r) => r.data),

  getSnapshots: (chartId: number) =>
    http
      .get<ReportDocumentResponse[]>(`/api/reports/charts/${chartId}/snapshots`)
      .then((r) => r.data),

  // ===== Events =====
  getEvents: (chartId: number, size = 50) =>
    http
      .get<TrainingEventResponse[]>(`/api/reports/charts/${chartId}/events`, {
        params: { size },
      })
      .then((r) => r.data),

  createEvent: (chartId: number, body: TrainingEventAppendRequest) =>
    http
      .post<TrainingEventResponse>(
        `/api/reports/charts/${chartId}/events`,
        body,
      )
      .then((r) => r.data),

  getEvent: (eventId: number) =>
    http
      .get<TrainingEventResponse>(`/api/reports/events/${eventId}`)
      .then((r) => r.data),

  analyzeChartAi: async (chartId: number) => {
    const res = await http.post<TrainingEventResponse>(
      `/api/reports/charts/${chartId}/analyze`,
    );
    return res.data;
  },

  getLatestChartAi: async (chartId: number) => {
    const res = await http.get<TrainingEventResponse | null>(
      `/api/reports/charts/${chartId}/ai/latest`,
    );
    return res.data;
  },

  analyzeSessionAi: async (sessionId: number) => {
    const res = await http.post<TrainingEventResponse>(
      `/api/reports/sessions/${sessionId}/analyze`,
    );
    return res.data;
  },

  getLatestSessionAi: async (sessionId: number) => {
    const res = await http.get<TrainingEventResponse | null>(
      `/api/reports/sessions/${sessionId}/ai/latest`,
    );
    return res.data;
  },

  analyzeSessionAi: async (sessionId: number) => {
    const res = await http.post<TrainingEventResponse>(
      `/api/reports/sessions/${sessionId}/analyze`,
    );
    return res.data;
  },

  getLatestSessionAi: async (sessionId: number) => {
    const res = await http.get<TrainingEventResponse | null>(
      `/api/reports/sessions/${sessionId}/ai/latest`,
    );
    return res.data;
  },
  analyzeSessionAi: async (sessionId: number) => {
    const res = await http.post<TrainingEventResponse>(
      `/api/reports/sessions/${sessionId}/analyze`,
    );
    return res.data;
  },

  getLatestSessionAi: async (sessionId: number) => {
    const res = await http.get<TrainingEventResponse | null>(
      `/api/reports/sessions/${sessionId}/ai/latest`,
    );
    return res.data;
  },
};