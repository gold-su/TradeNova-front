const KOREAN_MOBILE_PATTERN = /^010\d{8}$/;

export function normalizeKoreanMobileNumber(value: string) {
  return value.replace(/-/g, "").trim();
}

export function isValidKoreanMobileNumber(value: string) {
  return KOREAN_MOBILE_PATTERN.test(normalizeKoreanMobileNumber(value));
}

export function normalizeSmsSubscription(smsOptIn: boolean, phoneNumber: string) {
  return {
    smsOptIn,
    phoneNumber: smsOptIn ? normalizeKoreanMobileNumber(phoneNumber) : null,
  };
}
