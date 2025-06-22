import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
const API = import.meta.env.VITE_API_BASE_URL;

export default function SearchDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    departmentId: "",
    serviceId: "",
  });

  useEffect(() => {
    const fetchFilters = async () => {
      const [depRes, servRes] = await Promise.all([
        axios.get("https://medpal-aqpz.onrender.com/api/departments"),
        axios.get("https://medpal-aqpz.onrender.com/api/services"),
      ]);
      setDepartments(depRes.data);
      setServices(servRes.data);
    };
    fetchFilters();
  }, []);

  const handleSearch = async () => {
    const params = new URLSearchParams(filters).toString();
    const res = await axios.get(`https://medpal-aqpz.onrender.com/api/doctors/search?${params}`);
    setDoctors(res.data);
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "800px" }}>
      <h2 className="text-center mb-4">🔎 Kërko Mjekë</h2>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Emri i mjekut"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          />
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
          >
            <option value="">Zgjedh departamentin</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            onChange={(e) => setFilters({ ...filters, serviceId: e.target.value })}
          >
            <option value="">Zgjedh shërbimin</option>
            {services.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={handleSearch} className="btn btn-primary mb-4 w-100">
        🔍 Kërko
      </button>

      <ul className="list-group">
        {doctors.map((d) => (
          <li key={d._id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{d.name}</strong> – {d?.email || "nuk ka email"}
            </div>
            <Link to={`/book-appointment?doctorId=${d._id}`} className="btn btn-outline-success">
              📅 Rezervo
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
