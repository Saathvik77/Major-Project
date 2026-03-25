import axios from "axios";

const getBaseURL = () => {
  let url = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
  
  // Ensure the URL ends with /api
  if (!url.endsWith('/api') && !url.endsWith('/api/')) {
    url = url.endsWith('/') ? `${url}api` : `${url}/api`;
  }
  
  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000, 
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