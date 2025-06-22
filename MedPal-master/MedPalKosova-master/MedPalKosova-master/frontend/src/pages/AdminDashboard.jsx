import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

import UserGrowthChart from "./userGrowthChart";
import RevenueChart from "./RevenueChart";

export default function AdminDashboard() {
  const [data, setData] = useState({ users: [], total: 0, page: 1, pages: 1 });
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Profile admini
  const [profile, setProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  const fetchUsers = async (page = 1, searchTerm = "", role = "") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = { page, limit: 10 };
      if (searchTerm) params.search = searchTerm;
      if (role) params.role = role;

      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setData(res.data);
      setLoading(false);
    } catch (err) {
      setError("⛔️ Nuk mund të merren përdoruesit.");
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const statsRes = await axios.get("http://localhost:5000/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(statsRes.data);
    } catch {
      setError("⛔️ Nuk mund të merren statistikat.");
    }
  };

  // Merr profilin e adminit aktual
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setProfileName(res.data.name);
      setProfileEmail(res.data.email);
    } catch {
      setError("⛔️ Nuk mund të merret profili.");
    }
  };

  const updateProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/api/admin/profile",
        { name: profileName, email: profileEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingProfile(false);
      fetchProfile();
      alert("✅ Profili u përditësua me sukses!");
    } catch {
      alert("❌ Gabim gjatë përditësimit të profilit.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchProfile();
  }, []);

  useEffect(() => {
    fetchUsers(1, search, roleFilter);
  }, [search, roleFilter]);

  const handleVerify = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/admin/verify/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u._id === id ? { ...u, isVerified: true } : u)),
      }));
    } catch {
      alert("❌ Verifikimi dështoi");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("A je i sigurt që dëshiron ta fshish këtë përdorues?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/admin/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u._id !== id),
      }));
    } catch {
      alert("❌ Fshirja dështoi");
    }
  };

  if (loading) return <div className="container py-4">Duke ngarkuar...</div>;
  if (error) return <div className="container py-4 alert alert-danger">{error}</div>;

  return (
    <div className="container py-4">
      <h2 className="mb-4">📋 Paneli i Adminit</h2>

      {/* --- Settings/Profile Section --- */}
      <section className="mb-4 p-3 border rounded">
        <h4>👤 Profili im</h4>
        {!profile ? (
          <p>Duke ngarkuar profilin...</p>
        ) : editingProfile ? (
          <>
            <div className="mb-3">
              <label className="form-label">Emri</label>
              <input
                type="text"
                className="form-control"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                disabled
              />
              <small className="text-muted">Email nuk mund të ndryshohet.</small>
            </div>
            <button className="btn btn-success me-2" onClick={updateProfile}>
              Ruaj Ndryshimet
            </button>
            <button className="btn btn-secondary" onClick={() => setEditingProfile(false)}>
              Anulo
            </button>
          </>
        ) : (
          <>
            <p>
              <strong>Emri:</strong> {profile.name}
            </p>
            <p>
              <strong>Email:</strong> {profile.email}
            </p>
            <p>
              <strong>Roli:</strong> {profile.role}
            </p>
            <button className="btn btn-primary me-2" onClick={() => setEditingProfile(true)}>
              Edito Profilin
            </button>
            <button className="btn btn-danger" onClick={logout}>
              Dil
            </button>
          </>
        )}
      </section>

      {/* Statistikat */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        <div className="card bg-primary text-white p-3 flex-grow-1" style={{ minWidth: "180px" }}>
          <h5>Përdorues Total</h5>
          <p className="fs-3">{stats?.totalUsers || 0}</p>
        </div>
        <div className="card bg-success text-white p-3 flex-grow-1" style={{ minWidth: "180px" }}>
          <h5>Të Verifikuar</h5>
          <p className="fs-3">{stats?.verifiedUsers || 0}</p>
        </div>
        <div className="card bg-warning text-dark p-3 flex-grow-1" style={{ minWidth: "180px" }}>
          <h5>Të Pa Verifikuar</h5>
          <p className="fs-3">{stats?.unverifiedUsers || 0}</p>
        </div>
        <div className="card bg-info text-white p-3 flex-grow-1" style={{ minWidth: "180px" }}>
          <h5>Të Ardhurat</h5>
          <p className="fs-3">${stats?.totalRevenue?.toFixed(2) || "0.00"}</p>
        </div>
      </div>

      {/* Filterat */}
      <div className="mb-3 d-flex gap-2 align-items-center">
        <input
          type="text"
          placeholder="Kërko emër ose email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
          style={{ maxWidth: 300 }}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="form-select"
          style={{ maxWidth: 200 }}
        >
          <option value="">Të gjitha rolet</option>
          <option value="admin">Admin</option>
          <option value="clinic">Klinikë</option>
          <option value="user">Përdorues</option>
        </select>
      </div>

      {/* Tabela me përdoruesit */}
      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>Emri</th>
            <th>Email</th>
            <th>Roli</th>
            <th>Verifikuar</th>
            <th>Veprime</th>
          </tr>
        </thead>
        <tbody>
          {data.users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email || "-"}</td>
              <td>{u.role}</td>
              <td>
                {u.isVerified ? (
                  "✔️"
                ) : (
                  <button
                    onClick={() => handleVerify(u._id)}
                    className="btn btn-sm btn-outline-success"
                  >
                    Verifiko
                  </button>
                )}
              </td>
              <td>
                <button
                  onClick={() => handleDelete(u._id)}
                  className="btn btn-sm btn-outline-danger"
                >
                  Fshi
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <nav>
        <ul className="pagination">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
            <li key={p} className={`page-item ${p === data.page ? "active" : ""}`}>
              <button className="page-link" onClick={() => fetchUsers(p, search, roleFilter)}>
                {p}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Grafiqet */}
      <div className="my-4">
        <h4>📈 Rritja e Përdoruesve</h4>
        <UserGrowthChart />
      </div>

      <div className="my-4">
        <h4>💰 Të Ardhurat Mujore</h4>
        <RevenueChart />
      </div>
    </div>
  );
}
