import assert from "node:assert/strict";
import test from "node:test";
import { buildRandomTrainingSessionRequest } from "../src/hooks/training/trainingSessionRequest.ts";

test("new random sessions use explicit analysis and training ranges", () => {
  const request = buildRandomTrainingSessionRequest(42);

  assert.deepEqual(request, {
    accountId: 42,
    mode: "RANDOM",
    analysisBars: 200,
    trainingBars: 100,
    chartCount: 4,
  });
  assert.equal("bars" in request, false);
});
