import axios from "axios";

// Automatic base URL from environment
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // no fallback here (we set fallback below)
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // For most JWT APIs (we don't use cookies)
});

// Add token to headers automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Fallback to localhost if env variable doesn't exist (ONLY local)
    if (!config.baseURL) {
      config.baseURL = "http://localhost:8080";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
