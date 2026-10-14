const AUTH_SESSION_CHANGED = "tradenova:auth-session-changed";

type JwtPayload = { exp?: number };

function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(atob(normalized)) as JwtPayload;
  } catch {
    return null;
  }
}

export function hasValidAccessToken(storage: Storage, nowMs = Date.now()) {
  const token = storage.getItem("accessToken");
  if (!token) return false;
  const payload = parseJwtPayload(token);
  return typeof payload?.exp === "number" && payload.exp * 1000 > nowMs;
}

export function saveAuthSession(accessToken: string, email: string, nickname: string) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("userEmail", email);
  localStorage.setItem("userNickname", nickname);
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED));
}

export function clearAuthSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userNickname");
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED));
}

export function subscribeToAuthSession(listener: () => void) {
  window.addEventListener(AUTH_SESSION_CHANGED, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(AUTH_SESSION_CHANGED, listener);
    window.removeEventListener("storage", listener);
  };
}
