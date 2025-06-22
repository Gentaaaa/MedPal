import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("https://medpal-aqpz.onrender.com/api/appointments/doctor", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data);
    } catch (err) {
      console.error("❌ Gabim në fetchAppointments:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const togglePresence = async (id, currentStatus) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `https://medpal-aqpz.onrender.com/api/appointments/${id}/presence`,
        { isPresent: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAppointments();
    } catch (err) {
      console.error("❌ Gabim gjatë ndryshimit të prezencës:", err);
    }
  };

  const downloadPDF = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`https://medpal-aqpz.onrender.com/api/appointments/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `raporti_${id}.pdf`;
      link.click();
    } catch (err) {
      console.error("❌ Gabim gjatë shkarkimit të PDF:", err);
    }
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm("A jeni të sigurt që doni ta fshini këtë termin?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`https://medpal-aqpz.onrender.com/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAppointments();
    } catch (err) {
      console.error("❌ Gabim gjatë fshirjes së terminit:", err);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">📅 Terminet e Pacientëve</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Pacienti</th>
              <th>Email</th>
              <th>Data</th>
              <th>Ora</th>
              <th>Prezent</th>
              <th>Dokumente</th>
              <th>Statusi</th>
              <th>Raport</th>
              <th>🗑️</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a._id}>
                <td>{a.patientId?.name}</td>
                <td>{a.patientId?.email}</td>
                <td>{a.date}</td>
                <td>{a.time}</td>
                <td>
                  <button
                    className={`btn btn-sm btn-${a.isPresent ? "success" : "secondary"}`}
                    onClick={() => togglePresence(a._id, a.isPresent)}
                  >
                    {a.isPresent ? "Po" : "Jo"}
                  </button>
                </td>
                <td>
                  {a.documents?.length > 0 ? (
                    <ul className="mb-0">
                      {a.documents.map((d, i) => (
                        <li key={i}>
                          <a
                            href={`https://medpal-aqpz.onrender.com${d.fileUrl}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            📎 {d.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td>
                  <span className={`badge bg-${a.status === "approved" ? "success" : "secondary"}`}>
                    {a.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => downloadPDF(a._id)}
                  >
                    📄
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deleteAppointment(a._id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
