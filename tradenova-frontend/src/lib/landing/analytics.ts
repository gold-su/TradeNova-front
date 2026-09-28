export const LANDING_EVENT_NAMES = [
  "landing_view",
  "hero_beta_cta_click",
  "how_it_works_view",
  "beta_form_start",
  "beta_form_submit",
  "beta_form_success",
  "beta_form_error",
] as const;

export type LandingEventName = (typeof LANDING_EVENT_NAMES)[number];

export type CampaignAttribution = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
};

type AnalyticsPayload = CampaignAttribution & Record<string, unknown>;

const UTM_STORAGE_KEY = "tradenova:landing-attribution";

export function parseCampaignAttribution(search: string): CampaignAttribution {
  const params = new URLSearchParams(search);
  const value = (key: string) => params.get(key)?.trim() || null;

  return {
    utmSource: value("utm_source"),
    utmMedium: value("utm_medium"),
    utmCampaign: value("utm_campaign"),
    utmContent: value("utm_content"),
  };
}

export function hasCampaignAttribution(attribution: CampaignAttribution) {
  return Object.values(attribution).some(Boolean);
}

export function getCampaignAttribution(): CampaignAttribution {
  const current = parseCampaignAttribution(window.location.search);
  if (hasCampaignAttribution(current)) {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(current));
    return current;
  }

  const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
  if (!stored) return current;

  try {
    return { ...current, ...JSON.parse(stored) } as CampaignAttribution;
  } catch {
    sessionStorage.removeItem(UTM_STORAGE_KEY);
    return current;
  }
}

export function trackLandingEvent(
  event: LandingEventName,
  properties: Record<string, unknown> = {},
) {
  const detail: AnalyticsPayload & { event: LandingEventName } = {
    event,
    ...getCampaignAttribution(),
    ...properties,
  };

  window.dispatchEvent(new CustomEvent("tradenova:analytics", { detail }));

  const analyticsWindow = window as Window & {
    dataLayer?: Array<Record<string, unknown>>;
  };
  analyticsWindow.dataLayer?.push(detail);
}
