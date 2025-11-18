import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

export default function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/signup`, form);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Signup</h2>

        <form onSubmit={handleSignup}>
          <input
            name="username"
            placeholder="Username"
            className="auth-input"
            onChange={handleChange}
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            className="auth-input"
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="auth-input"
            onChange={handleChange}
          />

          <button className="auth-btn">Signup</button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <span className="auth-link" onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
