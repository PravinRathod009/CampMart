import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Lets non-React code (like this file) trigger toasts registered by ToastProvider
let toastHandler = null;
export const registerToastHandler = (fn) => {
  toastHandler = fn;
};

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || "Something went wrong. Please try again.";
    if (toastHandler) toastHandler(message, "error");
    return Promise.reject(err);
  }
);

export default api;
