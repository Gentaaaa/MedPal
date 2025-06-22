// 📁 src/layouts/ClinicLayout.jsx
import React from "react";
import { Link, Outlet } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ClinicLayout() {
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="container-fluid">
      <div className="row vh-100">
        <aside className="col-md-3 bg-dark text-white p-4 d-flex flex-column">
          <h4 className="mb-4">🏥 Klinika {user?.name}</h4>
          <nav className="nav flex-column gap-2">
            <Link className="text-white nav-link" to="doctors">👨‍⚕️ Lista e Mjekëve</Link>
            <Link className="text-white nav-link" to="add-doctor">➕ Shto Mjek</Link>
            <Link className="text-white nav-link" to="calendar">📅 Kalendar</Link>
            <Link className="text-white nav-link" to="services">🏥 Shërbimet</Link>
            <Link className="text-white nav-link" to="set-working-hours">🕒 Orari i Mjekëve</Link>
            <Link className="text-white nav-link" to="reports">📑 Raportet</Link>
            <button className="btn btn-light mt-4" onClick={handleLogout}>🚪 Dil</button>
          </nav>
        </aside>
        <main className="col-md-9 bg-light p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
