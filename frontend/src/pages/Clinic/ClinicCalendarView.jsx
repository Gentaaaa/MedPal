import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ClinicCalendarView() {
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/appointments/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data);
      } catch (err) {
        console.error("❌ Gabim në marrjen e termineve:", err);
      }
    };
    fetchAppointments();
  }, []);

  const selectedDateStr = date.toISOString().split("T")[0];
  const filteredAppointments = appointments.filter(app => app.date === selectedDateStr);

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const formatted = date.toISOString().split("T")[0];
      const found = appointments.find(a => a.date === formatted);
      if (found) {
        return (
          <div
            style={{
              backgroundColor: "#28a745",
              borderRadius: "50%",
              width: "8px",
              height: "8px",
              margin: "auto",
              marginTop: "2px",
            }}
          />
        );
      }
    }
    return null;
  };

  return (
    <div className="container py-5" style={{ maxWidth: "700px" }}>
      <h2 className="mb-4 text-success">📅 Kalendar për Klinikën</h2>

      <div className="mb-4">
        <Calendar
          value={date}
          onChange={setDate}
          tileContent={tileContent}
          className="w-100 border rounded shadow-sm"
        />
      </div>

      <h5 className="mt-3">Terminet për: <strong>{date.toDateString()}</strong></h5>
      {filteredAppointments.length > 0 ? (
        <ul className="list-group mt-3">
          {filteredAppointments.map((a, i) => (
            <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
              <span>⏰ {a.time}</span>
              <span>👨‍⚕️ Dr. <strong>{a.doctorName}</strong></span>
              <span>🧑‍🤝‍🧑 Pacient: <strong>{a.patientId?.name}</strong></span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted mt-3">S'ka termine për këtë datë.</p>
      )}
    </div>
  );
}
