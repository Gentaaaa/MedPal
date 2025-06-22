import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function PatientProfile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    address: "",
    bloodType: "",
    medicalHistory: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ ...form, ...res.data });
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.put("http://localhost:5000/api/users/me", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Profili u përditësua me sukses!");
    } catch (err) {
      alert("❌ Gabim në përditësim.");
      console.error(err);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <h2 className="text-center mb-4">👤 Profili i Pacientit</h2>
      <form onSubmit={handleSubmit} className="p-4 border rounded bg-light shadow-sm">
        {[
          { label: "Emri", name: "name" },
          { label: "Email", name: "email", type: "email" },
          { label: "Data e Lindjes", name: "dateOfBirth", type: "date" },
          { label: "Telefoni", name: "phone" },
          { label: "Adresa", name: "address" },
          { label: "Grupi i gjakut", name: "bloodType", placeholder: "p.sh. A+" },
        ].map(({ label, name, type = "text", placeholder }) => (
          <div className="mb-3" key={name}>
            <label className="form-label">{label}</label>
            <input
              type={type}
              name={name}
              className="form-control"
              value={form[name] || ""}
              placeholder={placeholder}
              onChange={handleChange}
            />
          </div>
        ))}

        <div className="mb-3">
          <label className="form-label">Gjinia</label>
          <select
            name="gender"
            className="form-select"
            value={form.gender || ""}
            onChange={handleChange}
          >
            <option value="">Zgjedh Gjinine</option>
            <option value="male">Mashkull</option>
            <option value="female">Femër</option>
            <option value="other">Tjetër</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Historia mjekësore</label>
          <textarea
            name="medicalHistory"
            className="form-control"
            rows="3"
            value={form.medicalHistory || ""}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">💾 Ruaj Ndryshimet</button>
      </form>
    </div>
  );
}
