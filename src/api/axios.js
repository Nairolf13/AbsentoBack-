import axios from "axios";

export default axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000/api",   // ou ton backend
  withCredentials: true,
});
