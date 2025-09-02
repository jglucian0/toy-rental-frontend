// src/services/api.ts
import axios from "axios";
import { getToken } from "../auth/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: antes de cada requisição, adiciona o token se existir
api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers["Authorization"] = `Token ${token}`;
  }
  return config;
});

export default api;