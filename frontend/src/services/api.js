import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: false,
});

export default API;

// ---------------------
// Expense APIs
// ---------------------
export const getExpenses = () => API.get("/expenses/all");
export const addExpense = (expense) => API.post("/expenses/add", expense);
export const updateExpense = (id, expense) =>
  API.put(`/expenses/update/${id}`, expense);
export const deleteExpense = (id) =>
  API.delete(`/expenses/delete/${id}`);
export const getSummary = () => API.get("/expenses/summary");

// ---------------------
// Auth API
// ---------------------
export const login = (data) => API.post("/auth/login", data);
// simple toast helper — no library
export function showToast(text, kind = "ok") {
  const wrapId = "app-theme-toast-wrap";
  let wrap = document.getElementById(wrapId);
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = wrapId;
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }

  const t = document.createElement("div");
  t.className = `toast ${kind === "error" ? "toast--error" : "toast--ok"}`;
  t.textContent = text;
  wrap.appendChild(t);

  setTimeout(() => t.style.opacity = "0", 3500);
  setTimeout(() => t.remove(), 4200);
}
