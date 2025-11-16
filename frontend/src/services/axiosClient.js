import axios from "axios";

// Correct backend base URL
const API_BASE_URL = "http://localhost:8080";

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false
});

export default API;
