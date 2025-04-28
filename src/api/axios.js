import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.AXIOS_URL || "http://localhost:3000/api", // ou ton backend
  withCredentials: true,
});

// Ajout de l'intercepteur pour le token JWT
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
