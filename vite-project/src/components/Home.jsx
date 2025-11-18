import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    axios
      .get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  return (
    <div className="home-wrapper">

      {/* Top Navbar */}
      <nav className="navbar">
        <h1 className="logo">CollabZen</h1>

        <div className="nav-right">
          {user && <span className="user-badge">Hello, {user.username}</span>}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            className="logout-btn"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <h2 className="hero-title">Smart Team Management, Simplified.</h2>
        <p className="hero-subtitle">
          Collaborate effortlessly. Track tasks, manage projects, and stay aligned with your team —
          all in one place.
        </p>

        <div className="hero-buttons">
          <button className="primary-btn" onClick={() => alert("Create Project Coming Soon!")}>
            + Create Project
          </button>
          <button className="secondary-btn" onClick={() => alert("Tasks Coming Soon!")}>
            View Tasks
          </button>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="features-section">
        <div className="feature-card">
          <h3>📌 Task Management</h3>
          <p>Create, assign & track tasks with ease using a powerful workflow system.</p>
        </div>

        <div className="feature-card">
          <h3>⚡ Real-time Collaboration</h3>
          <p>Stay in sync with instant updates and team activity dashboards.</p>
        </div>

        <div className="feature-card">
          <h3>📊 Smart Analytics</h3>
          <p>Gain insights on productivity, deadlines, and team performance.</p>
        </div>
      </section>

    </div>
  );
}
