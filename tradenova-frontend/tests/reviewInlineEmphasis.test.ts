import assert from "node:assert/strict";
import test from "node:test";
import { parseInlineEmphasis } from "../src/components/training/ai/inlineEmphasis.ts";

test("parses only paired double-asterisk emphasis", () => {
  assert.deepEqual(parseInlineEmphasis("가격은 **SMA20 위**에 있었습니다."), [
    { text: "가격은 ", emphasized: false },
    { text: "SMA20 위", emphasized: true },
    { text: "에 있었습니다.", emphasized: false },
  ]);
});

test("supports multiple emphasized phrases without inferring importance", () => {
  assert.deepEqual(parseInlineEmphasis("**계획 준수**와 **청산 근거**"), [
    { text: "계획 준수", emphasized: true },
    { text: "와 ", emphasized: false },
    { text: "청산 근거", emphasized: true },
  ]);
});

test("leaves malformed emphasis markers as plain text", () => {
  assert.deepEqual(parseInlineEmphasis("계획은 **끝나지 않았습니다."), [
    { text: "계획은 **끝나지 않았습니다.", emphasized: false },
  ]);
});

test("keeps raw HTML as inert text tokens", () => {
  assert.deepEqual(parseInlineEmphasis("<script>alert(1)</script> **검토**"), [
    { text: "<script>alert(1)</script> ", emphasized: false },
    { text: "검토", emphasized: true },
  ]);
});
