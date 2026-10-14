import type { CampaignAttribution } from "@/lib/landing/analytics";
import { normalizeSmsSubscription } from "@/lib/landing/waitlistSms";
import axios from "axios";
import http from "./http";

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
  smsOptIn: boolean;
  phoneNumber: string | null;
  attribution: CampaignAttribution;
};

export function createBetaApplication(
  application: Omit<BetaApplication, "phoneNumber"> & { phoneNumber?: string },
): BetaApplication {
  return {
    ...application,
    ...normalizeSmsSubscription(application.smsOptIn, application.phoneNumber ?? ""),
  };
}

export class DuplicateWaitlistEmailError extends Error {
  constructor() {
    super("Email already joined the beta waitlist");
    this.name = "DuplicateWaitlistEmailError";
  }
}

export const waitlistApi = {
  submit: async (application: BetaApplication) => {
    try {
      const endpoint = import.meta.env.VITE_WAITLIST_API_URL?.trim() || "/api/waitlist";
      await http.post(endpoint, application);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409 && error.response.data?.error === "WAITLIST_EMAIL_ALREADY_EXISTS") {
        throw new DuplicateWaitlistEmailError();
      }
      throw error;
    }
  },
};
