import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [clinicServices, setClinicServices] = useState([]);

  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedDepartmentId, setEditedDepartmentId] = useState("");
  const [editedServices, setEditedServices] = useState([]);

  useEffect(() => {
    fetchDoctors();
    fetchDepartments();
    fetchServices();
  }, []);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://medpal-aqpz.onrender.com/api/clinic/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(res.data);
    } catch (err) {
      console.error("❌ Gabim në marrjen e mjekëve:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://medpal-aqpz.onrender.com/api/clinic/departments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(res.data);
    } catch (err) {
      console.error("❌ Gabim në marrjen e departamenteve:", err);
    }
  };

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://medpal-aqpz.onrender.com/api/clinic/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClinicServices(res.data);
    } catch (err) {
      console.error("❌ Gabim në marrjen e shërbimeve:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("A jeni të sigurt që doni ta fshini mjekun?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://medpal-aqpz.onrender.com/api/clinic/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDoctors();
    } catch (err) {
      console.error("❌ Gabim gjatë fshirjes:", err);
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor._id);
    setEditedName(doctor.name);
    setEditedEmail(doctor.email);
    setEditedDepartmentId(doctor.departmentId?._id || "");
    setEditedServices(doctor.services?.map((s) => s._id) || []);
  };

  const handleServiceCheckboxChange = (serviceId) => {
    setEditedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSave = async (id) => {
    try {
      const token = localStorage.getItem("token");

      // Emri & emaili
      await axios.put(
        `https://medpal-aqpz.onrender.com/api/clinic/users/${id}`,
        { name: editedName, email: editedEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Departamenti & shërbimet
      await axios.put(
        `https://medpal-aqpz.onrender.com/api/clinic/doctors/${id}`,
        { departmentId: editedDepartmentId, services: editedServices },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditingDoctor(null);
      fetchDoctors();
    } catch (err) {
      console.error("❌ Gabim gjatë ruajtjes së mjekut:", err);
    }
  };

  const filteredServices = clinicServices.filter(
    (s) => s.departmentId?._id === editedDepartmentId
  );

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-success">📋 Lista e Mjekëve të Klinikës</h2>
      {doctors.length > 0 ? (
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Emri</th>
              <th>Email</th>
              <th>Departamenti</th>
              <th>Shërbimet</th>
              <th>Veprime</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doc) => (
              <tr key={doc._id}>
                <td>
                  {editingDoctor === doc._id ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                    />
                  ) : (
                    doc.name
                  )}
                </td>
                <td>
                  {editingDoctor === doc._id ? (
                    <input
                      type="email"
                      className="form-control"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                    />
                  ) : (
                    doc.email
                  )}
                </td>
                <td>
                  {editingDoctor === doc._id ? (
                    <select
                      className="form-select"
                      value={editedDepartmentId}
                      onChange={(e) => setEditedDepartmentId(e.target.value)}
                    >
                      <option value="">-- Zgjedh Departamentin --</option>
                      {departments.map((dep) => (
                        <option key={dep._id} value={dep._id}>
                          {dep.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    doc.departmentId?.name || "⛔ Pa Departament"
                  )}
                </td>
                <td>
                  {editingDoctor === doc._id ? (
                    <div style={{ maxHeight: "120px", overflowY: "auto" }}>
                      {filteredServices.map((s) => (
                        <div className="form-check" key={s._id}>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`edit-service-${s._id}`}
                            checked={editedServices.includes(s._id)}
                            onChange={() => handleServiceCheckboxChange(s._id)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`edit-service-${s._id}`}
                          >
                            {s.name} – {s.price}€
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : doc.services?.length > 0 ? (
                    <ul className="mb-0">
                      {doc.services.map((s) => (
                        <li key={s._id}>{s.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted">⛔ Pa shërbime</span>
                  )}
                </td>
                <td>
                  {editingDoctor === doc._id ? (
                    <>
                      <button className="btn btn-success btn-sm me-2" onClick={() => handleSave(doc._id)}>
                        💾 Ruaj
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditingDoctor(null)}>
                        Anulo
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-outline-primary btn-sm me-2" onClick={() => handleEdit(doc)}>
                        ✏️ Edito
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(doc._id)}>
                        🗑️ Fshij
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-muted">Nuk ka mjekë të regjistruar.</p>
      )}
    </div>
  );
}
