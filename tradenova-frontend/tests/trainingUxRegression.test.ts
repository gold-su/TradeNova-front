import assert from "node:assert/strict";
import test from "node:test";
import { SCENARIO_FIELDS } from "../src/hooks/training/trainingDecisionHistory.ts";
import {
  emptyScenario,
  scenarioDraftForChart,
  storeScenarioDraft,
} from "../src/components/training/common/scenarioDraftState.ts";
import {
  getTrainingChartTileState,
  hasOpenChartPosition,
} from "../src/components/training/chart/trainingChartTileState.ts";
import { getEventLogBodyMode } from "../src/components/training/report/eventLogDisplay.ts";

test("scenario fields expose the beta QA labels and prompts without changing field keys", () => {
  assert.deepEqual(SCENARIO_FIELDS.map(({ key, label }) => [key, label]), [
    ["thesis", "현재 판단"],
    ["entryReason", "진입 기준"],
    ["exitPlan", "리스크·청산 기준"],
    ["riskNote", "계획 변경 조건"],
    ["freeNote", "메모"],
  ]);
  assert.ok(SCENARIO_FIELDS.every(({ helper, example }) => helper.length > 10 && example.length > 10));
});

test("scenario drafts remain isolated while switching charts", () => {
  const chartOne = { ...emptyScenario(), thesis: "Chart 1 판단" };
  const chartTwo = { ...emptyScenario(), thesis: "Chart 2 판단" };
  const drafts = storeScenarioDraft(storeScenarioDraft({}, 1, chartOne), 2, chartTwo);

  assert.equal(scenarioDraftForChart(drafts, 1).thesis, "Chart 1 판단");
  assert.equal(scenarioDraftForChart(drafts, 2).thesis, "Chart 2 판단");
  assert.equal(scenarioDraftForChart(drafts, 3).thesis, "");
});

test("selected chart styling outranks holding and completed charts cannot show holding", () => {
  const inProgress = { status: "IN_PROGRESS" as const };
  const completed = { status: "COMPLETED" as const };
  const holding = { chartStatus: "IN_PROGRESS" as const, positionQty: 3 };

  assert.equal(hasOpenChartPosition(inProgress, holding), true);
  assert.equal(getTrainingChartTileState(false, inProgress, holding), "holding");
  assert.equal(getTrainingChartTileState(true, inProgress, holding), "selected");
  assert.equal(hasOpenChartPosition(completed, holding), false);
});

test("NEXT log synchronization preserves existing recent-log content", () => {
  assert.equal(getEventLogBodyMode(true, 3), "content");
  assert.equal(getEventLogBodyMode(true, 0), "loading");
  assert.equal(getEventLogBodyMode(false, 0), "empty");
});
