// Browser integration audit. Run against `npm run dev` with Playwright installed,
// or set PLAYWRIGHT_MODULE to an existing Playwright package. All API traffic is mocked.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_EXECUTABLE
    ? { executablePath: process.env.BROWSER_EXECUTABLE }
    : {}),
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (
    message.type() === "error" &&
    /same key|unique.*key/i.test(message.text())
  )
    errors.push(message.text());
});
const output =
  process.env.AUDIT_OUTPUT || path.join(tmpdir(), "tradenova-ux-audit");
await mkdir(output, { recursive: true });
const screenshot = (name) =>
  page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true });
const charts = [1, 2, 3, 4].map((id) => ({
  chartId: id,
  chartIndex: id - 1,
  symbolId: id,
  symbolTicker: "TEST",
  symbolName: "Test",
  trainingSector: ["PLATFORM", "BIO", "FINANCE", "DEFENSE"][id - 1],
  bars: 240,
  progressIndex: 100,
  status: "IN_PROGRESS",
  startDate: "2025-01-01",
  endDate: "2025-12-01",
}));
const candles = Array.from({ length: 101 }, (_, i) => {
  const price = 34500 + i * 24 + Math.sin(i / 5) * 700;
  return {
    idx: i,
    t: Date.UTC(2025, 0, 1 + i),
    o: price,
    c: price + Math.cos(i) * 180,
    h: price + 300,
    l: price - 300,
    v: 15000 + i * 400,
  };
});
const progress = Object.fromEntries(
  charts.map((chart) => [
    chart.chartId,
    {
      chartId: chart.chartId,
      progressIndex: 100,
      maxIndex: 239,
      remainingBars: 139,
      atLastBar: false,
      currentPrice: 37200,
      chartStatus: "IN_PROGRESS",
      sessionStatus: "IN_PROGRESS",
      cashBalance: 1974086,
      positionQty: 0,
      avgPrice: 0,
      autoExited: false,
      reason: null,
      revealedCandles: [],
    },
  ]),
);
const snapshots = { 1: [], 2: [], 3: [], 4: [] };
const events = { 1: [], 2: [], 3: [], 4: [] };
const requests = [];
let nextId = 100;
let failTrade = false;
let generatedChart4 = false;
let releaseChart2;
const delayedChart2 = new Promise((resolve) => {
  releaseChart2 = resolve;
});
const aiEvent = (cid) => ({
  id: cid,
  chartId: cid,
  type: "AI",
  title: "Review",
  createdAt: new Date().toISOString(),
  payloadJson: {
    analysisScope: "CHART",
    analysisType: "FAST",
    score: 80 + cid,
    summary: `Chart ${cid} review only`,
    strengths: ["계획을 기록했습니다."],
    warnings: [],
    generatedAt: new Date().toISOString(),
    analysisVersion: 1,
  },
});
await page.route("**/api/**", async (route) => {
  const request = route.request();
  const url = new URL(request.url());
  const endpoint = url.pathname;
  if (!endpoint.startsWith("/api/")) return route.continue();
  const cid = Number(endpoint.match(/charts\/(\d+)/)?.[1]);
  const body = request.postDataJSON();
  const send = (data, status = 200) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  if (request.method() === "OPTIONS") return send({});
  requests.push({ endpoint, method: request.method(), body });
  if (endpoint === "/api/paper-accounts")
    return send([
      {
        id: 1,
        name: "UX 검증 계좌",
        initialBalance: 2000000,
        cashBalance: 1974086,
        baseCurrency: "KRW",
        isDefault: true,
      },
    ]);
  if (endpoint === "/api/training/sessions/active")
    return send({
      sessionId: 1,
      accountId: 1,
      mode: "RANDOM",
      status: "IN_PROGRESS",
      charts,
    });
  if (endpoint.endsWith("/candles")) return send(candles);
  if (endpoint.endsWith("/progress")) return send(progress[cid]);
  if (endpoint.endsWith("/risk-rule")) return send(null);
  if (endpoint.endsWith("/trades")) return send([]);
  if (endpoint.endsWith("/quick-phrases"))
    return send([{ id: 1, content: "거래량 증가 확인" }]);
  if (endpoint.endsWith("/draft")) return send(null);
  if (endpoint.includes("/sessions/") && endpoint.endsWith("/ai/latest"))
    return send(null);
  if (endpoint.endsWith("/analyze")) {
    generatedChart4 = true;
    return send(aiEvent(cid));
  }
  if (endpoint.endsWith("/ai/latest")) {
    if (cid === 4 && !generatedChart4) return send(null);
    if (cid === 2) await delayedChart2;
    return send(aiEvent(cid));
  }
  if (endpoint.endsWith("/snapshots")) {
    if (request.method() === "POST") {
      const saved = {
        id: nextId++,
        chartId: cid,
        createdAt: new Date().toISOString(),
        contentJson: body.contentJson,
      };
      snapshots[cid].unshift(saved);
      return send(saved);
    }
    return send(snapshots[cid]);
  }
  if (endpoint.endsWith("/events")) {
    if (request.method() === "POST") {
      const saved = {
        id: nextId++,
        chartId: cid,
        createdAt: new Date().toISOString(),
        ...body,
      };
      events[cid].unshift(saved);
      return send(saved);
    }
    return send(events[cid]);
  }
  if (endpoint.includes("/trades/")) {
    if (failTrade) {
      failTrade = false;
      return send({ message: "Test rejection" }, 400);
    }
    const p = progress[cid];
    const buying = endpoint.endsWith("/buy");
    const qty = body?.qty ?? p.positionQty;
    p.positionQty += buying ? qty : -qty;
    p.cashBalance += buying ? -qty * 37200 : qty * 37200;
    p.avgPrice = p.positionQty ? 37200 : 0;
    return send({
      chartId: cid,
      tradeId: nextId++,
      cashBalance: p.cashBalance,
      positionQty: p.positionQty,
      avgPrice: p.avgPrice,
      executedPrice: 37200,
      candleTime: candles[100].t,
    });
  }
  return send(null);
});
await page.addInitScript(() => {
  localStorage.setItem("accessToken", "test-only-token");
  localStorage.setItem("tradenova.training.viewMode", "grid");
});
try {
  await page.goto(process.env.AUDIT_URL || "http://127.0.0.1:5175/training");
  const left = page.locator("aside").first();
  const right = page.locator("aside").last();
  const ai = left.locator("section").filter({ hasText: "AI REVIEW" });
  await page.getByRole("button", { name: "BUY", exact: true }).waitFor();
  assert.equal(await page.getByRole("dialog").count(), 0);
  await ai.getByText("81점 · FAST").waitFor();
  assert.ok((await ai.innerText()).includes("Chart 1 · 플랫폼"));
  assert.equal(await ai.locator("select").count(), 0);
  await left.getByRole("button", { name: /Chart 2 -/ }).click();
  await ai.getByText("Chart 2 · 바이오").waitFor();
  assert.ok(!(await ai.innerText()).includes("81점"));
  await left.getByRole("button", { name: /Chart 3 -/ }).click();
  await ai.getByText("83점 · FAST").waitFor();
  releaseChart2();
  await ai.getByRole("button", { name: "보기", exact: true }).click();
  await page.getByText("Chart 3 review only").waitFor();
  assert.equal(await page.getByText("Chart 2 review only").count(), 0);
  await page.getByRole("button", { name: "AI 리뷰 닫기", exact: true }).click();
  await left.getByRole("button", { name: /Chart 1 -/ }).click();
  await right.getByText("아직 작성된 계획이 없습니다.").waitFor();
  await screenshot("01-default-1080p");
  await right
    .getByRole("button", { name: "+ 첫 계획 작성", exact: true })
    .click();
  let dialog = page.getByRole("dialog");
  assert.equal(await dialog.locator("textarea[placeholder]").count(), 5);
  const editorOverflow = await dialog
    .getByRole("tabpanel")
    .evaluate((node) => node.scrollHeight - node.clientHeight);
  assert.ok(editorOverflow <= 1, `Editor overflow: ${editorOverflow}px`);
  await screenshot("02-scenario-editor");
  await dialog
    .getByRole("textbox", { name: /시장 관점/ })
    .fill("거래량 증가와 단기 추세 전환 기대");
  await dialog
    .getByRole("textbox", { name: /진입 조건/ })
    .fill("전고점 돌파 후 지지 확인");
  await dialog
    .getByRole("textbox", { name: /청산 계획/ })
    .fill("목표 구간에서 일부 청산");
  await dialog
    .getByRole("textbox", { name: /계획 무효화/ })
    .fill("최근 저점 이탈");
  await dialog.getByRole("button", { name: "새 버전 저장" }).click();
  await dialog
    .getByRole("status")
    .getByText("v1 계획이 저장되었습니다.")
    .waitFor();
  assert.equal(
    await dialog.getByRole("textbox", { name: /시장 관점/ }).inputValue(),
    "",
  );
  await right.getByText("거래량 증가와 단기 추세 전환 기대").first().waitFor();
  await dialog.getByRole("button", { name: "현재 계획 불러오기" }).click();
  assert.equal(
    await dialog.getByRole("textbox", { name: /시장 관점/ }).inputValue(),
    "거래량 증가와 단기 추세 전환 기대",
  );
  await dialog
    .getByRole("textbox", { name: /시장 관점/ })
    .fill("거래량 증가와 단기 추세 전환 — 수정");
  await dialog.getByRole("button", { name: "새 버전 저장" }).click();
  await dialog
    .getByRole("status")
    .getByText("v2 계획이 저장되었습니다.")
    .waitFor();
  const editorHeight = (await dialog.boundingBox()).height;
  await dialog.getByRole("tab", { name: "시나리오 기록", exact: true }).click();
  assert.ok(Math.abs((await dialog.boundingBox()).height - editorHeight) <= 1);
  await dialog
    .getByText("거래량 증가와 단기 추세 전환 기대", { exact: true })
    .waitFor();
  assert.equal(await dialog.locator("article").count(), 2);
  await screenshot("03-scenario-history");
  await dialog
    .getByRole("tab", { name: "매매 근거 기록", exact: true })
    .click();
  assert.ok(Math.abs((await dialog.boundingBox()).height - editorHeight) <= 1);
  await dialog.getByText("아직 기록된 매매 근거가 없습니다.").waitFor();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "BUY", exact: true }).click();
  dialog = page.getByRole("dialog", { name: "BUY", exact: true });
  await dialog.waitFor();
  const bounds = await dialog.boundingBox();
  assert.ok(bounds.width >= 420 && bounds.width <= 500);
  assert.equal(
    await dialog
      .getByRole("combobox", { name: "적용 계획" })
      .getAttribute("aria-expanded"),
    "false",
  );
  await dialog.getByRole("button", { name: "취소", exact: true }).click();
  await dialog.waitFor({ state: "detached" });
  await page.getByRole("button", { name: "BUY", exact: true }).click();
  await dialog.getByRole("button", { name: "25%", exact: true }).click();
  assert.equal(
    await dialog
      .getByRole("spinbutton", { name: "수량", exact: true })
      .inputValue(),
    "13",
  );
  await dialog.getByRole("spinbutton", { name: "수량", exact: true }).fill("4");
  await dialog.getByRole("combobox", { name: "적용 계획" }).click();
  await screenshot("04-plan-select-open");
  await dialog.getByRole("option", { name: /v1 ·/ }).click();
  await dialog
    .getByRole("textbox", { name: "이번 매수 근거", exact: true })
    .fill("돌파 이후 지지 확인");
  await screenshot("04-buy-dialog");
  failTrade = true;
  await dialog.getByRole("button", { name: "매수 실행", exact: true }).click();
  await dialog.getByRole("alert").waitFor();
  assert.equal(
    await dialog
      .getByRole("textbox", { name: "이번 매수 근거", exact: true })
      .inputValue(),
    "돌파 이후 지지 확인",
  );
  await dialog.getByRole("button", { name: "매수 실행", exact: true }).click();
  await dialog.waitFor({ state: "detached" });
  assert.equal(
    events[1].find((event) => event.type === "TRADE").payloadJson.reasons
      .length,
    2,
  );
  assert.equal(
    events[1].find((event) => event.type === "TRADE").payloadJson
      .scenarioSnapshotId,
    snapshots[1][1].id,
  );
  const errorToastClose = page.getByRole("button", {
    name: "오류 메시지 닫기",
    exact: true,
  });
  if (await errorToastClose.isVisible()) await errorToastClose.click();
  assert.deepEqual(
    requests.filter((r) => r.endpoint.endsWith("/trades/buy")).at(-1).body,
    { qty: 4 },
  );
  await page.getByRole("button", { name: "BUY", exact: true }).click();
  assert.equal(
    await dialog
      .getByRole("textbox", { name: "이번 매수 근거", exact: true })
      .inputValue(),
    "",
  );
  assert.equal(
    await dialog.getByRole("combobox", { name: "적용 계획" }).innerText(),
    `v2 · 거래량 증가와 단기 추세 전환 — 수정 (현재 계획)`,
  );
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "SELL", exact: true }).click();
  dialog = page.getByRole("dialog", { name: "SELL", exact: true });
  await dialog.getByText("4주", { exact: true }).waitFor();
  await dialog.getByRole("button", { name: "50%", exact: true }).click();
  assert.equal(
    await dialog
      .getByRole("spinbutton", { name: "수량", exact: true })
      .inputValue(),
    "2",
  );
  await dialog.getByRole("combobox", { name: "적용 계획" }).click();
  await dialog.getByRole("option", { name: "계획 없이 거래" }).click();
  await dialog
    .getByRole("textbox", { name: "이번 매도 근거", exact: true })
    .fill("목표 구간 일부 청산");
  await screenshot("05-sell-dialog");
  await dialog.getByRole("button", { name: "매도 실행", exact: true }).click();
  await dialog.waitFor({ state: "detached" });
  assert.equal(
    events[1].find((event) => event.type === "TRADE").payloadJson.reasonMode,
    "MANUAL",
  );
  await page.getByRole("button", { name: "SELL", exact: true }).click();
  await dialog.getByRole("button", { name: "ALL", exact: true }).click();
  assert.equal(
    await dialog.getByRole("combobox", { name: "적용 계획" }).innerText(),
    `v2 · 거래량 증가와 단기 추세 전환 — 수정 (현재 계획)`,
  );
  await dialog
    .getByRole("button", { name: "전량 매도 실행", exact: true })
    .click();
  await dialog.waitFor({ state: "detached" });
  assert.ok(requests.some((r) => r.endpoint.endsWith("/trades/sell-all")));
  assert.equal(progress[1].positionQty, 0);
  assert.equal(snapshots[1].length, 2);
  await right.getByRole("button", { name: "계획 관리" }).click();
  dialog = page.getByRole("dialog");
  await dialog
    .getByRole("textbox", { name: /시장 관점/ })
    .fill("매매 후 새 계획");
  await dialog.getByRole("button", { name: "새 버전 저장" }).click();
  await dialog
    .getByRole("status")
    .getByText("v3 계획이 저장되었습니다.")
    .waitFor();
  assert.equal(snapshots[1].length, 3);
  await dialog
    .getByRole("tab", { name: "매매 근거 기록", exact: true })
    .click();
  await dialog.getByText(/PLAN v1/).waitFor();
  await dialog.getByText("계획 없이 거래", { exact: true }).waitFor();
  assert.equal(await dialog.locator("article").count(), 3);
  await screenshot("06-trade-reason-history");
  await page.keyboard.press("Escape");
  const layout = await right.evaluate((panel) => ({
    height: panel.clientHeight,
    scrollHeight: panel.scrollHeight,
    topHeight: panel.firstElementChild.clientHeight,
    topScrollHeight: panel.firstElementChild.scrollHeight,
    bottom: panel.getBoundingClientRect().bottom,
  }));
  assert.ok(layout.topScrollHeight <= layout.topHeight, JSON.stringify(layout));
  assert.ok(layout.bottom <= 1080, JSON.stringify(layout));
  await screenshot("07-complete-1080p");
  await page.setViewportSize({ width: 1366, height: 768 });
  await screenshot("08-1366x768");
  const recentBounds = await right
    .locator("div")
    .filter({ hasText: /^RECENT LOGS/ })
    .first()
    .evaluate((node) => ({
      height: node.clientHeight,
      scroll: node.scrollHeight,
    }));
  assert.ok(
    recentBounds.scroll <= recentBounds.height,
    JSON.stringify(recentBounds),
  );
  await page
    .locator("main [role=button]")
    .filter({ hasText: "Chart 2" })
    .first()
    .click({ position: { x: 20, y: 20 } });
  await ai.getByText("82점 · FAST").waitFor();
  await left.getByRole("button", { name: /Chart 4 -/ }).click();
  await ai.getByRole("button", { name: "분석 생성", exact: true }).click();
  await ai.getByText("84점 · FAST").waitFor();
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        result: "PASS",
        checks:
          "AI active chart/stale response, Scenario create/edit/history/helpers, BUY/SELL/cancel/failure/success/reset, quantity/percent/ALL, explicit plan/manual reasons/payload, saved plans, 1080p layout",
        layout,
        screenshots: output,
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(errors);
  await screenshot("failure");
  console.error((await page.locator("body").innerText()).slice(0, 7000));
  throw error;
} finally {
  releaseChart2();
  await browser.close();
}
