import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL?.toString().trim() || "http://localhost:3000";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    console.error("[API]", status ?? "network", data ?? error.message);
    return Promise.reject(error);
  }
);
