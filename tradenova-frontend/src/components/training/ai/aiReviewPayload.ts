import type { ChartAiPayload, SessionAiPayload } from "@/types/training";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function parseChartAiPayload(value: unknown): ChartAiPayload | null {
  if (!value || typeof value !== "object") return null;
  const payload = value as Record<string, unknown>;
  if (payload.analysisScope !== "CHART" || typeof payload.score !== "number" || typeof payload.summary !== "string" || !isStringArray(payload.strengths) || !isStringArray(payload.warnings)) return null;
  if (payload.analysisType !== "FAST" && payload.analysisType !== "DEEP") return null;
  return payload as ChartAiPayload;
}

export function parseSessionAiPayload(value: unknown): SessionAiPayload | null {
  if (!value || typeof value !== "object") return null;
  const payload = value as Record<string, unknown>;
  if (payload.analysisScope !== "SESSION" || typeof payload.sessionId !== "number" || typeof payload.score !== "number" || typeof payload.summary !== "string" || !isStringArray(payload.strengths) || !isStringArray(payload.warnings)) return null;
  return payload as SessionAiPayload;
}
