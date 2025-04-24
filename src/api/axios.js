import axios from "axios";

export default axios.create({
  baseURL: process.env.AXIOS_URL || "http://localhost:3000/api",   // ou ton backend
  withCredentials: true,
});
