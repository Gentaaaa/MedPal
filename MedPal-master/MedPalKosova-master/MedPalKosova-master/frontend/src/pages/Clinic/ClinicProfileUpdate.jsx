import { useState, useEffect } from "react";
import axios from "axios";

export default function ClinicProfileUpdate() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setForm((prev) => ({ ...prev, name: user.name, email: user.email }));
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await axios.put("http://localhost:5000/api/clinic/update", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Profili u përditësua me sukses!");
      localStorage.setItem("user", JSON.stringify(res.data.clinic));
    } catch (err) {
      alert("❌ Dështoi përditësimi. Kontrollo të dhënat.");
      console.error(err);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: "500px" }}>
      <h3 className="mb-4 text-success">⚙️ Përditëso Profilin e Klinikës</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Emri i Klinikës</label>
          <input name="name" value={form.name} onChange={handleChange} className="form-control" />
        </div>

        <div className="mb-3">
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="form-control" />
        </div>

        <div className="mb-3">
          <label>Fjalëkalim i Ri (opsional)</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} className="form-control" />
        </div>

        <button type="submit" className="btn btn-success w-100">
          💾 Ruaj Ndryshimet
        </button>
      </form>
    </div>
  );
}
