import axios from "axios";
import store from "../redux/store";
import { logoutSuccess } from "../redux/slices/authSlice";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

// Auto logout if backend returns 403 blocked
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 &&
        error.response?.data?.error === "Your account has been blocked") {
      store.dispatch(logoutSuccess());
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;