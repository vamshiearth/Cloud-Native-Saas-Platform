import axios from "axios";
import { getAccessToken, getOrgId } from "./auth";

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
