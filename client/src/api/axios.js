import axios from "axios";

const defaultApiUrl = import.meta.env.DEV
  ? "http://127.0.0.1:8000"
  : "https://movie-recommendation-engine-backend.onrender.com";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
  headers: { "Content-Type": "application/json" },
});

// Read the token at request time so login/logout changes are immediately reflected.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
