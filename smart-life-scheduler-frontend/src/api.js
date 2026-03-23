import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://smart-life-scheduler-api.onrender.com/api",
  timeout: 15000, // 15s timeout to prevent indefinite hangs
  headers: {
    "Content-Type": "application/json"
  }
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
    if (error.code === 'ECONNABORTED') {
      console.error("Request timed out. The backend might be starting up.");
    } else if (!error.response) {
      console.error("Network Error Details:", {
        message: error.message,
        code: error.code,
        config: error.config
      });
    }
    return Promise.reject(error);
  }
);

export default api;