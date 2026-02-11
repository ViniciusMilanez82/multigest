import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: { "Content-Type": "application/json" },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("multigest_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const companyId = localStorage.getItem("multigest_company_id");
    if (companyId) {
      config.headers["x-company-id"] = companyId;
    }
  }
  return config;
});

// Interceptor para redirecionar em caso de 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("multigest_token");
      localStorage.removeItem("multigest_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
