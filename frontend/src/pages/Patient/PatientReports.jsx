import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
const API = import.meta.env.VITE_API_BASE_URL;

export default function PatientReports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://medpal-aqpz.onrender.com/api/reports/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(res.data);
      } catch (err) {
        console.error("❌ Gabim në marrjen e raporteve:", err);
      }
    };

    fetchReports();
  }, []);

  const handleDownload = async (reportId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`https://medpal-aqpz.onrender.com/api/reports/${reportId}/pdf`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `raporti-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("❌ Gabim gjatë shkarkimit:", err);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "800px" }}>
      <h2 className="text-center mb-4">📋 Raportet e Mia</h2>

      {reports.length === 0 ? (
        <div className="alert alert-info text-center">📭 Nuk ka raporte ende.</div>
      ) : (
        <div className="list-group">
          {reports.map((r) => (
            <div key={r._id} className="list-group-item mb-3">
              <p>👨‍⚕️ <strong>{r.doctorId?.name}</strong></p>
              <p>📅 {r.appointmentId?.date} ora {r.appointmentId?.time}</p>
              <button
                className="btn btn-outline-primary"
                onClick={() => handleDownload(r._id)}
              >
                ⬇️ Shkarko Raportin PDF
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
