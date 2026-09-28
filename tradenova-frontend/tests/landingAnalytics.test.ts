import assert from "node:assert/strict";
import test from "node:test";
import {
  hasCampaignAttribution,
  LANDING_EVENT_NAMES,
  parseCampaignAttribution,
} from "../src/lib/landing/analytics.ts";

test("landing attribution maps supported UTM parameters", () => {
  const attribution = parseCampaignAttribution(
    "?utm_source=instagram&utm_medium=reels&utm_campaign=blind_chart&utm_content=reel_01&ignored=value",
  );

  assert.deepEqual(attribution, {
    utmSource: "instagram",
    utmMedium: "reels",
    utmCampaign: "blind_chart",
    utmContent: "reel_01",
  });
  assert.equal(hasCampaignAttribution(attribution), true);
});

test("landing attribution normalizes empty and missing values", () => {
  const attribution = parseCampaignAttribution("?utm_source=%20%20&utm_medium=threads");

  assert.deepEqual(attribution, {
    utmSource: null,
    utmMedium: "threads",
    utmCampaign: null,
    utmContent: null,
  });
});

test("conversion event contract includes the complete landing funnel", () => {
  assert.deepEqual(LANDING_EVENT_NAMES, [
    "landing_view",
    "hero_beta_cta_click",
    "how_it_works_view",
    "beta_form_start",
    "beta_form_submit",
    "beta_form_success",
    "beta_form_error",
  ]);
});
