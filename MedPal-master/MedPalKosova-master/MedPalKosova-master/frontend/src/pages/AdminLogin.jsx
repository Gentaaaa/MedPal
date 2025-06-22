import React, { useState } from "react";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          expectedRole: "admin",
          adminSecret,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gabim në login");

      // Ruaj token dhe user në localStorage për PrivateRoute
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Thërrit onLogin pa parametra, sepse tokenin e ruajtëm vetë
      if (onLogin) onLogin();

    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login Admin</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Fjalëkalimi"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Kodi sekret i adminit"
        value={adminSecret}
        onChange={e => setAdminSecret(e.target.value)}
        required
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit">Kyçu</button>
    </form>
  );
}
