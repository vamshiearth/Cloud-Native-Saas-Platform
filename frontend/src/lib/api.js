import axios from "axios";
import {
  getAccessToken,
  getOrgId,
  getRefreshToken,
  setAccessToken,
  clearAccessToken,
  clearOrgId,
  clearRefreshToken,
} from "./auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  const orgId = getOrgId();

  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (orgId) config.headers["X-Org-Id"] = orgId;

  return config;
});

let refreshing = false;
let queue = [];

function resolveQueue(err, token = null) {
  queue.forEach((p) => (err ? p.reject(err) : p.resolve(token)));
  queue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    const refresh = getRefreshToken();
    if (!refresh) {
      clearAccessToken();
      clearRefreshToken();
      clearOrgId();
      return Promise.reject(error);
    }

    if (refreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    refreshing = true;
    try {
      const r = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/refresh/`, { refresh });
      setAccessToken(r.data.access);
      resolveQueue(null, r.data.access);
      original.headers.Authorization = `Bearer ${r.data.access}`;
      return api(original);
    } catch (err) {
      resolveQueue(err, null);
      clearAccessToken();
      clearRefreshToken();
      clearOrgId();
      return Promise.reject(err);
    } finally {
      refreshing = false;
    }
  }
);
