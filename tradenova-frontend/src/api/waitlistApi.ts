import type { CampaignAttribution } from "@/lib/landing/analytics";

export type InvestmentExperience =
  | "NONE"
  | "UNDER_6_MONTHS"
  | "SIX_MONTHS_TO_TWO_YEARS"
  | "OVER_TWO_YEARS";

export type InvestmentChallenge =
  | "ENTRY_DECISION"
  | "EXIT_DECISION"
  | "PLAN_DISCIPLINE"
  | "EMOTIONAL_TRADING"
  | "CHART_ANALYSIS"
  | "OTHER";

export type ParticipationIntent = "YES" | "CONSIDERING";

export type BetaApplication = {
  email: string;
  investmentExperience: InvestmentExperience;
  primaryChallenge: InvestmentChallenge;
  participationIntent: ParticipationIntent;
  attribution: CampaignAttribution;
};

export class WaitlistUnavailableError extends Error {
  constructor() {
    super("Waitlist endpoint is not configured");
    this.name = "WaitlistUnavailableError";
  }
}

export const waitlistApi = {
  submit: async (application: BetaApplication) => {
    const endpoint = import.meta.env.VITE_WAITLIST_API_URL?.trim();
    if (!endpoint) throw new WaitlistUnavailableError();

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(application),
    });

    if (!response.ok) {
      throw new Error(`Waitlist request failed: ${response.status}`);
    }
  },
};
