import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function DoctorReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://medpal-aqpz.onrender.com/api/reports/doctor", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(res.data);
      } catch (err) {
        console.error("❌ Gabim në marrjen e raporteve të mjekut:", err);
      } finally {
        setLoading(false);
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
      console.error("❌ Gabim gjatë shkarkimit të PDF:", err);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: "900px" }}>
      <h2 className="mb-4 text-center">📑 Raportet e Mia të Vizitave</h2>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3">⏳ Duke u ngarkuar...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="alert alert-info text-center">
          📭 Nuk ka raporte të krijuara ende.
        </div>
      ) : (
        <div className="list-group">
          {reports.map((r) => (
            <div key={r._id} className="list-group-item list-group-item-action mb-3 shadow-sm">
              <p>🧑‍💼 <strong>Pacienti:</strong> {r.patientId?.name}</p>
              <p>
                📅 <strong>Data:</strong> {r.appointmentId?.date} &nbsp;&nbsp; ⏰ <strong>Ora:</strong> {r.appointmentId?.time}
              </p>
              <p>📋 <strong>Diagnoza:</strong> {r.diagnosis}</p>
              <button className="btn btn-outline-primary mt-2" onClick={() => handleDownload(r._id)}>
                ⬇️ Shkarko Raportin PDF
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
