import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ClinicPatientReports() {
  const [raportet, setRaportet] = useState([]);
  const [mjeket, setMjeket] = useState([]);
  const [filtrat, setFiltrat] = useState({
    from: "",
    to: "",
    doctorId: "",
  });

  const merrRaportet = async () => {
    try {
      const token = localStorage.getItem("token");
      const query = new URLSearchParams();
      if (filtrat.from) query.append("from", filtrat.from);
      if (filtrat.to) query.append("to", filtrat.to);
      if (filtrat.doctorId) query.append("doctorId", filtrat.doctorId);

      const res = await axios.get(`http://localhost:5000/api/reports/clinic?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRaportet(res.data);
    } catch (err) {
      console.error("❌ Gabim në marrjen e raporteve të klinikës:", err);
    }
  };

  const merrMjeket = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/users/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMjeket(res.data);
    } catch (err) {
      console.error("❌ Gabim në marrjen e mjekëve:", err);
    }
  };

  useEffect(() => {
    merrMjeket();
    merrRaportet();
  }, []);

  const ndryshoFiltrin = (e) => {
    setFiltrat({ ...filtrat, [e.target.name]: e.target.value });
  };

  const filtroRaportet = (e) => {
    e.preventDefault();
    merrRaportet();
  };

  const shkarkoPDF = async (reportId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/reports/${reportId}/pdf`, {
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
      console.error("❌ Gabim gjatë shkarkimit të raportit të klinikës:", err);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-success">📑 Raportet e Vizitave të Pacientëve</h2>

      {/* Formë për filtrat */}
      <form className="row g-3 mb-4" onSubmit={filtroRaportet}>
        <div className="col-md-3">
          <label className="form-label">📅 Nga data</label>
          <input
            type="date"
            name="from"
            className="form-control"
            value={filtrat.from}
            onChange={ndryshoFiltrin}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">📅 Deri më</label>
          <input
            type="date"
            name="to"
            className="form-control"
            value={filtrat.to}
            onChange={ndryshoFiltrin}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">👨‍⚕️ Mjeku</label>
          <select
            name="doctorId"
            className="form-select"
            value={filtrat.doctorId}
            onChange={ndryshoFiltrin}
          >
            <option value="">Të gjithë mjekët</option>
            {mjeket.map((mjek) => (
              <option key={mjek._id} value={mjek._id}>
                {mjek.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <button type="submit" className="btn btn-success w-100">
            🔍 Kërko
          </button>
        </div>
      </form>

      {/* Lista e raporteve */}
      {raportet.length === 0 ? (
        <div className="alert alert-warning">📭 Nuk u gjetën raporte për këto kritere.</div>
      ) : (
        <div className="list-group">
          {raportet.map((r) => (
            <div key={r._id} className="list-group-item list-group-item-action mb-2 shadow-sm">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-1"><strong>👨‍⚕️ Mjeku:</strong> {r.doctorId?.name}</p>
                  <p className="mb-1"><strong>🧑‍💼 Pacienti:</strong> {r.patientId?.name}</p>
                  <p className="mb-1"><strong>📅 Data:</strong> {r.appointmentId?.date} &nbsp;&nbsp;
                    <strong>🕒 Ora:</strong> {r.appointmentId?.time}
                  </p>
                </div>
                <button
                  onClick={() => shkarkoPDF(r._id)}
                  className="btn btn-outline-primary btn-sm"
                >
                  ⬇️ Shkarko PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
