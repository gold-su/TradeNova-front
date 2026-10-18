import assert from "node:assert/strict";
import test from "node:test";
import {
  resizeScenarioTextarea,
  SCENARIO_TEXTAREA_MAX_HEIGHT,
  SCENARIO_TEXTAREA_MIN_HEIGHT,
} from "../src/components/training/common/scenarioTextarea.ts";

function textarea(scrollHeight: number) {
  return {
    scrollHeight,
    style: { height: "", overflowY: "" },
  } as unknown as Pick<HTMLTextAreaElement, "scrollHeight" | "style">;
}

test("scenario textarea grows with content and shrinks back to one line", () => {
  const element = textarea(92);

  resizeScenarioTextarea(element);
  assert.equal(element.style.height, "92px");
  assert.equal(element.style.overflowY, "hidden");

  Object.defineProperty(element, "scrollHeight", { value: 20 });
  resizeScenarioTextarea(element);
  assert.equal(element.style.height, `${SCENARIO_TEXTAREA_MIN_HEIGHT}px`);
  assert.equal(element.style.overflowY, "hidden");
});

test("scenario textarea caps its height and scrolls only after the cap", () => {
  const element = textarea(240);

  resizeScenarioTextarea(element);

  assert.equal(element.style.height, `${SCENARIO_TEXTAREA_MAX_HEIGHT}px`);
  assert.equal(element.style.overflowY, "auto");
});
