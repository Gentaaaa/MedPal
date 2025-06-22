import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import axios from "axios";

export default function CalendarView() {
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://medpal-aqpz.onrender.com/api/appointments/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data);
      } catch (err) {
        console.error("❌ Gabim në marrjen e termineve:", err);
      }
    };
    fetchAppointments();
  }, []);

  // Filtrimi për datën e zgjedhur
  const selectedDateStr = date.toISOString().split("T")[0];
  const filteredAppointments = appointments.filter(app => app.date === selectedDateStr);

  // Pika e gjelbër në ditët me termine
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const formatted = date.toISOString().split("T")[0];
      const found = appointments.find(a => a.date === formatted);
      if (found) {
        return (
          <div
            style={{
              backgroundColor: "#4CAF50",
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
    <div style={{ padding: "30px", maxWidth: "600px", margin: "auto" }}>
      <h2>📅 Kalendar i Termineve</h2>
      <Calendar value={date} onChange={setDate} tileContent={tileContent} />

      <p style={{ marginTop: "20px" }}>
        Terminet për datën <strong>{date.toDateString()}</strong>:
      </p>

      {filteredAppointments.length > 0 ? (
        <ul style={{ marginTop: "10px" }}>
          {filteredAppointments.map((a, index) => (
            <li key={index}>
              ⏰ Ora: <strong>{a.time}</strong> – Klinika: <strong>{a.clinicName}</strong> – Mjeku: <strong>{a.doctorName}</strong> – Statusi: <em>{a.status}</em>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "#888" }}>Nuk ka termine për këtë datë.</p>
      )}
    </div>
  );
}
