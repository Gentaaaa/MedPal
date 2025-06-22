import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
const API = import.meta.env.VITE_API_BASE_URL;


export default function AppointmentHistory() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("https://medpal-aqpz.onrender.com/api/appointments/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data);
      } catch (err) {
        console.error("❌ Gabim:", err);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">📖 Historiku i Termineve</h2>
      {appointments.length === 0 ? (
        <div className="alert alert-info text-center">
          Nuk keni termine të regjistruara.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th scope="col">Mjeku</th>
                <th scope="col">Shërbimi</th>
                <th scope="col">Data</th>
                <th scope="col">Ora</th>
                <th scope="col">Statusi</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a._id}>
                  <td>{a.doctorId?.name || "-"}</td>
                  <td>{a.serviceId?.name || "-"}</td>
                  <td>{a.date}</td>
                  <td>{a.time}</td>
                  <td>
                    <span
                      className={
                        a.status === "approved"
                          ? "badge bg-success"
                          : a.status === "pending"
                          ? "badge bg-warning text-dark"
                          : "badge bg-danger"
                      }
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
