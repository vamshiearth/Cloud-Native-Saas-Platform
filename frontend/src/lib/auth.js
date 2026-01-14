const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const ORG_KEY = "org_id";

export function setAccessToken(token) {
  localStorage.setItem(ACCESS_KEY, token);
}
export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}
export function clearAccessToken() {
  localStorage.removeItem(ACCESS_KEY);
}

export function setRefreshToken(token) {
  localStorage.setItem(REFRESH_KEY, token);
}
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}
export function clearRefreshToken() {
  localStorage.removeItem(REFRESH_KEY);
}

export function setOrgId(orgId) {
  localStorage.setItem(ORG_KEY, orgId);
}
export function getOrgId() {
  return localStorage.getItem(ORG_KEY);
}
export function clearOrgId() {
  localStorage.removeItem(ORG_KEY);
}
