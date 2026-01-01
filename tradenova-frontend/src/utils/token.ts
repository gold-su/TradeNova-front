const KEY = "accessToken";

export function getAccessToken() {
    return localStorage.getItem(KEY);
}

export function setAccessToken(token: string) {
    localStorage.setItem(KEY, token);
}

export function clearAccessToken() {
    localStorage.removeItem(KEY);
}

export function isLoggedIn() {
    return !!getAccessToken();
}
