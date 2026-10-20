export const PUBLIC_BETA_CLOSED_ERROR = "PUBLIC_BETA_CLOSED";
export const PUBLIC_BETA_CLOSED_EVENT = "tradenova:public-beta-closed";
export const BETA_WAITLIST_PATH = "/#beta-apply";

export type BetaAccessResponse = {
  publicBetaEnabled: boolean;
  accessAllowed: boolean;
};

export type PublicBetaAccessView = "ALLOWED" | "CLOSED";

export function resolvePublicBetaAccessView(response: BetaAccessResponse): PublicBetaAccessView {
  return response.publicBetaEnabled || response.accessAllowed ? "ALLOWED" : "CLOSED";
}

export function isPublicBetaClosedResponse(status: unknown, errorCode: unknown) {
  return status === 403 && errorCode === PUBLIC_BETA_CLOSED_ERROR;
}

export function notifyPublicBetaClosed() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PUBLIC_BETA_CLOSED_EVENT));
  }
}
