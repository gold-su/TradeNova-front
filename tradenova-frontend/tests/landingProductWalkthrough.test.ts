import assert from "node:assert/strict";
import test from "node:test";
import {
  AI_REVIEW_POINTS,
  PRODUCT_WALKTHROUGH_STEPS,
} from "../src/lib/landing/productWalkthrough.ts";

test("product walkthrough covers the complete decision-training flow", () => {
  assert.deepEqual(
    PRODUCT_WALKTHROUGH_STEPS.map(({ number, stage }) => [number, stage]),
    [
      ["01", "BLIND"],
      ["02", "PLAN"],
      ["03", "NEXT"],
      ["04", "TRADE"],
      ["05", "AI REVIEW"],
    ],
  );
  assert.ok(
    PRODUCT_WALKTHROUGH_STEPS.every(
      ({ title, description, imageAlt }) =>
        title.length > 8 && description.length > 20 && imageAlt.length > 15,
    ),
  );
});

test("AI review copy stays focused on process quality", () => {
  assert.equal(AI_REVIEW_POINTS.length, 4);
  const copy = AI_REVIEW_POINTS.join(" ");
  assert.match(copy, /판단 근거/);
  assert.match(copy, /계획과 실제 실행/);
  assert.match(copy, /리스크/);
  assert.doesNotMatch(copy, /종목 추천|수익 보장|매수 시점/);
});
