import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API = import.meta.env.VITE_API_BASE_URL;

export default function ClinicAddDoctor() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    departmentId: "",
    services: [],
  });

  const [departments, setDepartments] = useState([]);
  const [clinicServices, setClinicServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchData = async () => {
      try {
        const [depRes, srvRes] = await Promise.all([
          axios.get(`${API}/clinic/departments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/clinic/services`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setDepartments(depRes.data);
        setClinicServices(srvRes.data);
      } catch (err) {
        console.error("❌ Gabim gjatë marrjes së të dhënave:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceCheckboxChange = (serviceId) => {
    setFormData((prev) => {
      const isSelected = prev.services.includes(serviceId);
      const newServices = isSelected
        ? prev.services.filter((id) => id !== serviceId)
        : [...prev.services, serviceId];
      return { ...prev, services: newServices };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post(`${API}/users/register-doctor`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("👨‍⚕️ Mjeku u shtua me sukses!");
      setFormData({
        name: "",
        email: "",
        password: "",
        departmentId: "",
        services: [],
      });
    } catch (err) {
      const message = err.response?.data?.message || "Gabim gjatë shtimit të mjekut.";
      alert("❌ " + message);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: "600px" }}>
      <h2 className="mb-4 text-success">➕ Shto Mjek të Ri</h2>

      {loading ? (
        <p>🔄 Duke ngarkuar të dhënat...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Emri */}
          <div className="mb-3">
            <label className="form-label">Emri i mjekut</label>
            <input
              name="name"
              className="form-control"
              placeholder="Dr. Emri Mbiemri"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>

          {/* Emaili */}
          <div className="mb-3">
            <label className="form-label">Emaili</label>
            <input
              name="email"
              type="email"
              className="form-control"
              placeholder="email@shembull.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>

          {/* Fjalëkalimi */}
          <div className="mb-3">
            <label className="form-label">Fjalëkalimi</label>
            <input
              name="password"
              type="password"
              className="form-control"
              placeholder="Fjalëkalimi"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          {/* Departamenti */}
          <div className="mb-3">
            <label className="form-label">Departamenti</label>
            <select
              name="departmentId"
              className="form-select"
              value={formData.departmentId}
              onChange={handleChange}
              required
            >
              <option value="">-- Zgjedh Departamentin --</option>
              {departments.length === 0 ? (
                <option disabled>Nuk ka departamente të regjistruara</option>
              ) : (
                departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Shërbimet */}
          <div className="mb-4">
            <label className="form-label">Shërbimet</label>
            <div className="border rounded p-3" style={{ maxHeight: "200px", overflowY: "auto" }}>
              {clinicServices.length === 0 ? (
                <p className="text-muted">Nuk ka shërbime të regjistruara.</p>
              ) : (
                clinicServices.map((s) => (
                  <div className="form-check" key={s._id}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`service-${s._id}`}
                      checked={formData.services.includes(s._id)}
                      onChange={() => handleServiceCheckboxChange(s._id)}
                    />
                    <label className="form-check-label" htmlFor={`service-${s._id}`}>
                      {s.name} – {s.price}€
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-success w-100">
            Shto Mjekun
          </button>
        </form>
      )}
    </div>
  );
}
