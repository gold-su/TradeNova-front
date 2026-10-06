export type ScenarioContent = {
  thesis: string;
  entryReason: string;
  exitPlan: string;
  riskNote: string;
  freeNote: string;
};

export const emptyScenario = (): ScenarioContent => ({
  thesis: "",
  entryReason: "",
  exitPlan: "",
  riskNote: "",
  freeNote: "",
});

export function scenarioDraftForChart(
  drafts: Record<number, ScenarioContent>,
  chartId: number,
) {
  return drafts[chartId] ?? emptyScenario();
}

export function storeScenarioDraft(
  drafts: Record<number, ScenarioContent>,
  chartId: number,
  draft: ScenarioContent,
) {
  return { ...drafts, [chartId]: draft };
}
