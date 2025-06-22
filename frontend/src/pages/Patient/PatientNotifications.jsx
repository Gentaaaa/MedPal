import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
const API = import.meta.env.VITE_API_BASE_URL;

export default function PatientNotifications() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://medpal-aqpz.onrender.com/api/appointments/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data);

        // Marko njoftimet si të lexuara
        await axios.put("https://medpal-aqpz.onrender.com/api/appointments/mark-seen", {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("❌ Gabim në marrjen e njoftimeve:", err.message);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">🔔 Njoftimet e mia</h2>
      {appointments.length === 0 ? (
        <div className="alert alert-info text-center">S’keni ende ndonjë njoftim për termine.</div>
      ) : (
        <ul className="list-group">
          {appointments.map((a, index) => (
            <li key={index} className="list-group-item">
              <strong>{a.status.toUpperCase()}</strong> – Termini te <b>{a.doctorId?.name}</b>, më <u>{a.date}</u> ora {a.time}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
