import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/axiosClient";

import "../styles/theme.css";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Enter username & password");
      return;
    }

    try {
      const res = await API.post("/auth/login", {
        username: email,
        password: password
      });

      console.log("Login success:", res.data);
      navigate("/home");

    } catch (err) {
      console.error("Login failed:", err);
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="theme-root">
      <div className="login-card">

        <h1 className="title">Expenses Splitter</h1>
        <p className="subtitle">Split bills smarter.</p>

        <label className="label">Username</label>
        <input
          className="input"
          value={email}
          placeholder="Enter Username"
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="label">Password</label>
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}
