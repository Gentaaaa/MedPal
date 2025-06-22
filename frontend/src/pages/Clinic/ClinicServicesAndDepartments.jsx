import { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ClinicServicesAndDepartments() {
  const [departmentName, setDepartmentName] = useState("");
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    price: "",
    departmentId: "",
  });

  const [searchDep, setSearchDep] = useState("");
  const [searchServ, setSearchServ] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const [depRes, servRes] = await Promise.all([
        axios.get("https://medpal-aqpz.onrender.com/api/clinic/departments", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://medpal-aqpz.onrender.com/api/clinic/services", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setDepartments(depRes.data);
      setServices(servRes.data);
    } catch (err) {
      console.error("❌ Gabim në marrjen e të dhënave:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!departmentName.trim()) return alert("Shkruani emrin e departamentit.");
    try {
      await axios.post(
        "https://medpal-aqpz.onrender.com/api/clinic/departments",
        { name: departmentName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDepartmentName("");
      fetchData();
      alert("✅ Departamenti u shtua me sukses!");
    } catch (err) {
      alert("❌ Gabim gjatë shtimit të departamentit.");
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm("A jeni i sigurt që doni ta fshini këtë departament?")) return;
    try {
      await axios.delete(`https://medpal-aqpz.onrender.com/api/clinic/departments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      alert("❌ Gabim gjatë fshirjes së departamentit.");
    }
  };

  const handleServiceChange = (e) => {
    const { name, value } = e.target;
    setServiceForm({ ...serviceForm, [name]: value });
  };

  const handleAddOrUpdateService = async (e) => {
    e.preventDefault();
    const { name, price, departmentId } = serviceForm;
    if (!name || !price || !departmentId) {
      return alert("Të gjitha fushat për shërbim janë të detyrueshme.");
    }

    if (Number(price) <= 0) {
      return alert("Çmimi duhet të jetë numër pozitiv.");
    }

    try {
      if (editingService) {
        await axios.put(
          `https://medpal-aqpz.onrender.com/api/clinic/services/${editingService}`,
          { name, price, departmentId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditingService(null);
      } else {
        await axios.post(
          "https://medpal-aqpz.onrender.com/api/clinic/services",
          { name, price, departmentId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setServiceForm({ name: "", price: "", departmentId: "" });
      fetchData();
      alert("✅ Shërbimi u ruajt me sukses!");
    } catch (err) {
      alert("❌ Gabim gjatë ruajtjes së shërbimit.");
    }
  };

  const handleEditService = (s) => {
    setEditingService(s._id);
    setServiceForm({
      name: s.name,
      price: s.price,
      departmentId: s.departmentId?._id || s.departmentId,
    });
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("A jeni i sigurt që doni ta fshini këtë shërbim?")) return;
    try {
      await axios.delete(`https://medpal-aqpz.onrender.com/api/clinic/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      alert("❌ Gabim gjatë fshirjes së shërbimit.");
    }
  };

  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(searchDep.toLowerCase())
  );

  const filteredServices = services.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchServ.toLowerCase());
    const matchesDepartment = filterDepartment ? s.departmentId?._id === filterDepartment : true;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="container py-5" style={{ maxWidth: "750px" }}>
      <h2 className="mb-4 text-success">🏥 Menaxho Departamentet & Shërbimet</h2>

      {/* ➕ Shto Departament */}
      <form onSubmit={handleAddDepartment} className="mb-4">
        <h5 className="mb-2">➕ Shto Departament</h5>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Emri i departamentit"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            required
          />
          <button className="btn btn-primary" type="submit">Shto</button>
        </div>
      </form>

      {/* ➕ Shto/Përditëso Shërbim */}
      <form onSubmit={handleAddOrUpdateService} className="mb-5">
        <h5 className="mb-3">{editingService ? "✏️ Përditëso Shërbim" : "➕ Shto Shërbim"}</h5>
        <div className="mb-3">
          <input
            type="text"
            name="name"
            className="form-control"
            placeholder="Emri i shërbimit"
            value={serviceForm.name}
            onChange={handleServiceChange}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="number"
            name="price"
            className="form-control"
            placeholder="Çmimi (€)"
            value={serviceForm.price}
            onChange={handleServiceChange}
            required
          />
        </div>
        <div className="mb-3">
          <select
            name="departmentId"
            className="form-select"
            value={serviceForm.departmentId}
            onChange={handleServiceChange}
            required
          >
            <option value="">Zgjedh departamentin</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-success w-100" type="submit">
          {editingService ? "Përditëso" : "Shto"}
        </button>
        {editingService && (
          <button
            type="button"
            className="btn btn-secondary w-100 mt-2"
            onClick={() => {
              setEditingService(null);
              setServiceForm({ name: "", price: "", departmentId: "" });
            }}
          >
            Anulo
          </button>
        )}
      </form>

      {/* 🔍 Kërkimi dhe Filtrimi */}
      <div className="mb-4">
        <h5>🔍 Kërko & Filtrim</h5>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Kërko në departamente..."
          value={searchDep}
          onChange={(e) => setSearchDep(e.target.value)}
        />
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Kërko në shërbime..."
          value={searchServ}
          onChange={(e) => setSearchServ(e.target.value)}
        />
        <select
          className="form-select mb-2"
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
        >
          <option value="">-- Filtrimi sipas departamentit --</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
        <button
          className="btn btn-outline-secondary"
          onClick={() => {
            setSearchDep("");
            setSearchServ("");
            setFilterDepartment("");
          }}
        >
          ♻️ Reseto filtrat
        </button>
      </div>

      {/* 📋 Lista */}
      <div>
        <h5>📋 Departamentet ekzistuese:</h5>
        <ul className="list-group mb-4">
          {filteredDepartments.map((dep) => (
            <li key={dep._id} className="list-group-item d-flex justify-content-between">
              {dep.name}
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteDepartment(dep._id)}>
                🗑
              </button>
            </li>
          ))}
        </ul>

        <h5>📄 Shërbimet ekzistuese:</h5>
        <ul className="list-group">
          {filteredServices.map((s) => (
            <li key={s._id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                {s.name} – {s.price}€ ({s.departmentId?.name || "-"})
              </div>
              <div>
                <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEditService(s)}>
                  ✏️
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteService(s._id)}>
                  🗑
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
