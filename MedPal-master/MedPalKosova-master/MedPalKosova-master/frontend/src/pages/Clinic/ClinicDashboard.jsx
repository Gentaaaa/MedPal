import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/Dashboard.css";

export default function ClinicDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const cards = [
  { to: "/clinic/doctors", icon: "📋", title: "Lista e Mjekëve", desc: "Shiko të gjithë mjekët e klinikës" },
  { to: "/clinic/add-doctor", icon: "➕", title: "Shto Mjek", desc: "Regjistro një mjek të ri" },
  { to: "/clinic/calendar", icon: "📅", title: "Kalendar", desc: "Shiko terminet e klinikës" },
  { to: "/clinic/appointments", icon: "📆", title: "Terminet", desc: "Shiko dhe shkarko raportet e termineve" },
  { to: "/clinic/services", icon: "🏥", title: "Departamente & Shërbime", desc: "Menaxho departamentet" },
  { to: "/clinic/set-working-hours", icon: "🕒", title: "Orari i Mjekëve", desc: "Cakto orarin për mjekët" },
  { to: "/clinic/reports", icon: "📑", title: "Raportet", desc: "Shiko dhe shkarko raportet" },
  { to: "/clinic/invite-patient", icon: "📧", title: "Fto Pacient", desc: "Dërgo ftesë për verifikim pacientit" }, // 🆕 SHTUAR
  { to: "/clinic/profile", icon: "⚙️", title: "Profili i Klinikës", desc: "Përditëso emrin, emailin ose fjalëkalimin" },
];


  return (
    <div className="container py-4">
      <div
        className="d-flex justify-content-between align-items-center p-4 rounded shadow mb-5"
        style={{ background: "linear-gradient(to right, #2d8f4e, #6bcf98)", color: "white" }}
      >
        <h2 className="m-0">Mirësevini në Klinikën {user?.name || "🏥"}</h2>
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
                  background: "#e8f9f0",
                  transition: "transform 0.3s ease",
                  borderRadius: "16px",
                  padding: "30px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <div className="card-body">
                  <h4 className="card-title fw-bold mb-3" style={{ fontSize: "1.5rem", color: "#2d8f4e" }}>
                    {card.icon} {card.title}
                  </h4>
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
