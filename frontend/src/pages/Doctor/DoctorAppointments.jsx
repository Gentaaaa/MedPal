import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import "bootstrap/dist/css/bootstrap.min.css";

Modal.setAppElement("#root");

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [fileTitle, setFileTitle] = useState("");
  const [file, setFile] = useState(null);

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

  const openModal = (id) => {
    setSelectedId(id);
    setModalIsOpen(true);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileTitle || !file) return alert("Plotëso të dhënat e dokumentit.");

    const formData = new FormData();
    formData.append("title", fileTitle);
    formData.append("file", file);

    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `https://medpal-aqpz.onrender.com/api/documents/upload/${selectedId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setModalIsOpen(false);
      setFileTitle("");
      setFile(null);
      fetchAppointments();
    } catch (err) {
      console.error("❌ Gabim gjatë ngarkimit të dokumentit:", err);
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
              <th>📎</th>
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
                    className="btn btn-sm btn-outline-success"
                    onClick={() => openModal(a._id)}
                  >
                    📎
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

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Ngarko Dokument"
        style={{ content: { maxWidth: "500px", margin: "auto" } }}
      >
        <h4 className="mb-3">📎 Shto Dokument</h4>
        <form onSubmit={handleUpload}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Titulli i dokumentit"
              value={fileTitle}
              onChange={(e) => setFileTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="file"
              className="form-control"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
          </div>
          <div className="d-flex justify-content-end">
            <button className="btn btn-primary me-2">🚀 Ngarko</button>
            <button type="button" className="btn btn-secondary" onClick={() => setModalIsOpen(false)}>
              ❌ Anulo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
