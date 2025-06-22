import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Modal from "react-modal";
import "bootstrap/dist/css/bootstrap.min.css";

Modal.setAppElement("#root");

export default function ClinicAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDocUrl, setSelectedDocUrl] = useState("");

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/appointments/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data);
    } catch (err) {
      console.error("❌ Gabim gjatë marrjes së termineve:", err);
    }
  };

  const updateStatus = async (appointmentId, status) => {
    if (!window.confirm(`A dëshironi të ${status === "approved" ? "aprovoni" : "anuloni"} këtë termin?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/appointments/${appointmentId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAppointments();
    } catch (err) {
      console.error("❌ Gabim gjatë përditësimit të statusit:", err);
    }
  };

  const downloadPDF = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/appointments/${appointmentId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `raporti_${appointmentId}.pdf`;
      link.click();
    } catch (err) {
      console.error("❌ Gabim gjatë shkarkimit të PDF:", err);
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredAppointments.map((a) => ({
      Pacienti: a.patientId?.name || "",
      Email: a.patientId?.email || "",
      Data: a.date,
      Ora: a.time,
      Doktori: a.doctorId?.name || "",
      Statusi: a.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Terminet");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, "Terminet_Klinikes.xlsx");
  };

  const openModal = (fileUrl) => {
    setSelectedDocUrl("http://localhost:5000" + fileUrl);
    setModalIsOpen(true);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((a) => {
    const query = searchTerm.toLowerCase();
    return (
      a.patientId?.name?.toLowerCase().includes(query) ||
      a.patientId?.email?.toLowerCase().includes(query) ||
      a.doctorId?.name?.toLowerCase().includes(query) ||
      a.date?.includes(query)
    );
  });

  return (
    <div className="container py-5" style={{ maxWidth: "1000px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-success">📅 Terminet për Klinikën</h2>
        <button className="btn btn-success" onClick={exportToExcel}>
          ⬇️ Eksporto Excel
        </button>
      </div>

      <input
        type="text"
        className="form-control mb-4"
        placeholder="🔍 Kërko sipas pacientit, doktorit, datës apo emailit..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredAppointments.length === 0 ? (
        <p className="text-muted">Nuk ka termine të regjistruara ose kërkimi nuk përputhet me asnjë rezultat.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Pacienti</th>
                <th>Email</th>
                <th>Data</th>
                <th>Ora</th>
                <th>Doktori</th>
                <th>Dokumente</th>
                <th>Statusi</th>
                <th>Raport</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((a) => (
                <tr key={a._id}>
                  <td>{a.patientId?.name}</td>
                  <td>{a.patientId?.email}</td>
                  <td>{a.date}</td>
                  <td>{a.time}</td>
                  <td>{a.doctorId?.name || "-"}</td>
                  <td>
                    {a.documents && a.documents.length > 0 ? (
                      <ul>
                        {a.documents.map((doc, i) => (
                          <li key={i}>
                            <button
                              className="btn btn-link p-0"
                              onClick={() => openModal(doc.fileUrl)}
                            >
                              📎 {doc.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span style={{ color: "gray" }}>Nuk ka dokumente</span>
                    )}
                  </td>
                  <td>
                    {a.status === "pending" ? (
                      <>
                        <button className="btn btn-success btn-sm me-2" onClick={() => updateStatus(a._id, "approved")}>
                          ✅ Aprovo
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => updateStatus(a._id, "canceled")}>
                          ❌ Anulo
                        </button>
                      </>
                    ) : (
                      <span className={`badge bg-${a.status === "approved" ? "success" : "secondary"}`}>
                        {a.status}
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => downloadPDF(a._id)}
                    >
                      📄 Shkarko
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal për dokumentin PDF */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Dokumenti"
        style={{ content: { width: "80%", height: "80%", margin: "auto" } }}
      >
        <button className="btn btn-danger mb-2" onClick={() => setModalIsOpen(false)}>❌ Mbyll</button>
        <iframe src={selectedDocUrl} title="Dokument" width="100%" height="90%"></iframe>
      </Modal>
    </div>
  );
}
