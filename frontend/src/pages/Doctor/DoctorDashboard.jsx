import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";


export default function DoctorDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const cards = [
    { to: "/doctor/appointments", icon: "📋", title: "Terminet", desc: "Shiko pacientët që kanë rezervuar" },
    { to: "/doctor/calendar", icon: "📅", title: "Kalendar", desc: "Shiko terminet me kalendar" },
    { to: "/doctor/add-report", icon: "🧾", title: "Krijo Raport", desc: "Shto raportin për termin" },
    { to: "/doctor/reports", icon: "📑", title: "Raportet", desc: "Shiko të gjitha raportet që ke krijuar" },
    { to: "/doctor/profile", icon: "👤", title: "Profili Im", desc: "Shiko dhe edito të dhënat personale" },
  ];

  return (
    <div className="container py-4">
      <div
        className="d-flex justify-content-between align-items-center p-4 rounded shadow mb-5"
        style={{ background: "linear-gradient(to right, #2c3e50, #2980b9)", color: "white" }}
      >
        <h2 className="m-0">Mirësevini Dr. {user?.name || "Mjek"} 👨‍⚕️</h2>
        <button
          className="btn btn-outline-light"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
        >
          Dil
        </button>
      </div>

      <div className="row g-4">
        {cards.map((card, index) => (
          <div className="col-md-6 col-lg-4" key={index}>
            <Link to={card.to} className="text-decoration-none">
              <div
                className="card h-100 shadow border-0"
                style={{
                  background: "#e9f2fb",
                  transition: "transform 0.3s ease",
                  borderRadius: "16px",
                  padding: "30px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <div className="card-body">
                  <h4 className="card-title fw-bold mb-3" style={{ fontSize: "1.5rem" }}>{card.icon} {card.title}</h4>
                  <p className="card-text text-muted" style={{ fontSize: "1.1rem" }}>{card.desc}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}