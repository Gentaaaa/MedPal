import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function DoctorCalendarView() {
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://medpal-aqpz.onrender.com/api/appointments/doctor", {
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
              backgroundColor: "#0d6efd",
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
      <div className="card shadow">
        <div className="card-body">
          <h3 className="mb-4 text-primary">
            🗓️ Terminet për Dr. {JSON.parse(localStorage.getItem("user"))?.name}
          </h3>

          <div className="mb-4">
            <Calendar
              value={date}
              onChange={setDate}
              tileContent={tileContent}
            />
          </div>

          <h5 className="text-secondary">
            Terminet për datën <strong>{date.toDateString()}</strong>:
          </h5>

          {filteredAppointments.length > 0 ? (
            <ul className="list-group mt-3">
              {filteredAppointments.map((a, i) => (
                <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                  ⏰ {a.time} – <strong>{a.patientId?.name}</strong>
                  <span className="text-muted">{a.patientId?.email}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="alert alert-info mt-3">
              Nuk ka termine për këtë datë.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
