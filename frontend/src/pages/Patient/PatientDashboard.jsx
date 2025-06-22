import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
const API = import.meta.env.VITE_API_BASE_URL;


export default function PatientDashboard() {
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://medpal-aqpz.onrender.com/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };
    getUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const cards = [
    {
      to: "/patient/book-appointment",
      icon: "📅",
      title: "Rezervo Terminin",
      desc: "Shiko mjekët dhe cakto vizitën",
    },
    {
      to: "/patient/profile",
      icon: "👤",
      title: "Profili Im",
      desc: "Shiko dhe edito të dhënat",
    },
    {
      to: "/patient/history",
      icon: "📖",
      title: "Historiku",
      desc: "Terminet dhe vizitat e kaluara",
    },
    {
      to: "/patient/notifications",
      icon: "🔔",
      title: "Njoftime",
      desc: "Kujtesa dhe rekomandime",
    },
    {
      to: "/patient/reports",
      icon: "📋",
      title: "Raportet e Mia",
      desc: "Shiko dhe shkarko raportet",
    },
    {
      to: "/patient/documents",
      icon: "📁",
      title: "Dokumentet",
      desc: "Recetat, analizat etj.",
    },
  ];

  return (
    <div className="container py-4">
      <div
        className="d-flex justify-content-between align-items-center p-4 rounded shadow mb-5"
        style={{
          background: "linear-gradient(to right, #00b09b, #96c93d)",
          color: "white",
        }}
      >
        <h2 className="m-0">
          Mirësevini në MedPal, {user?.name || "Pacient"} 👋
        </h2>
        <button className="btn btn-outline-light" onClick={handleLogout}>
          Dil
        </button>
      </div>

      <div className="row g-4">
        {cards.map((card, i) => (
          <div className="col-md-6 col-lg-4" key={i}>
            <Link to={card.to} className="text-decoration-none">
              <div
                className="card h-100 shadow border-0"
                style={{
                  background: "#e8f5e9",
                  transition: "transform 0.3s ease",
                  borderRadius: "16px",
                  padding: "30px",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <div className="card-body">
                  <h4
                    className="card-title fw-bold mb-3"
                    style={{ fontSize: "1.5rem", color: "#2e7d32" }}
                  >
                    {card.icon} {card.title}
                  </h4>
                  <p
                    className="card-text text-muted"
                    style={{ fontSize: "1.1rem" }}
                  >
                    {card.desc}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
