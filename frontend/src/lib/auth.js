const ACCESS_KEY = "access_token";
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

export function setOrgId(orgId) {
  localStorage.setItem(ORG_KEY, orgId);
}
export function getOrgId() {
  return localStorage.getItem(ORG_KEY);
}
export function clearOrgId() {
  localStorage.removeItem(ORG_KEY);
}
