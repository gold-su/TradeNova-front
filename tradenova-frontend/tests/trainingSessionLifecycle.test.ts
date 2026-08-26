import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeSessionAi,
  finishTrainingAndOpenCompletion,
} from "../src/pages/training/trainingSessionLifecycle.ts";

test("session AI success does not open completion or finish the session", async () => {
  let showCompletion = false;
  let finishCalls = 0;

  await analyzeSessionAi(async () => {});

  assert.equal(showCompletion, false);
  assert.equal(finishCalls, 0);
});

test("session AI failure does not open completion", async () => {
  let showCompletion = false;

  await assert.rejects(
    analyzeSessionAi(async () => {
      throw new Error("analysis failed");
    }),
  );

  assert.equal(showCompletion, false);
});

test("successful finish loads summary and then opens completion", async () => {
  const calls: string[] = [];
  let showCompletion = false;

  const opened = await finishTrainingAndOpenCompletion({
    finishSession: async () => {
      calls.push("finish");
      return { sessionStatus: "COMPLETED" };
    },
    loadSummary: async () => {
      calls.push("summary");
      return { completedChartCount: 4 };
    },
    openCompletion: () => {
      calls.push("open");
      showCompletion = true;
    },
  });

  assert.equal(opened, true);
  assert.equal(showCompletion, true);
  assert.deepEqual(calls, ["finish", "summary", "open"]);
});

test("failed finish or summary does not open completion", async () => {
  let summaryCalls = 0;
  let openCalls = 0;

  const finishFailed = await finishTrainingAndOpenCompletion({
    finishSession: async () => null,
    loadSummary: async () => {
      summaryCalls += 1;
      return {};
    },
    openCompletion: () => {
      openCalls += 1;
    },
  });

  const summaryFailed = await finishTrainingAndOpenCompletion({
    finishSession: async () => ({}),
    loadSummary: async () => null,
    openCompletion: () => {
      openCalls += 1;
    },
  });

  assert.equal(finishFailed, false);
  assert.equal(summaryFailed, false);
  assert.equal(summaryCalls, 0);
  assert.equal(openCalls, 0);
});
