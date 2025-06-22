import { useState, useEffect } from "react";
import axios from "axios";

export default function ClinicSetDoctorHours() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [workingHours, setWorkingHours] = useState({
    monday: { start: "", end: "" },
    tuesday: { start: "", end: "" },
    wednesday: { start: "", end: "" },
    thursday: { start: "", end: "" },
    friday: { start: "", end: "" },
    saturday: { start: "", end: "" },
    sunday: { start: "", end: "" },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("https://medpal-aqpz.onrender.com/api/clinic/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error("❌ Gabim në marrjen e mjekëve:", err));
  }, []);

  const handleChange = (day, field, value) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `https://medpal-aqpz.onrender.com/api/working-hours/${selectedDoctor}`,
        { workingHours },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Orari u ruajt me sukses!");
    } catch (err) {
      console.error("❌ Gabim në ruajtje:", err);
      alert("❌ Dështoi ruajtja e orarit.");
    }
  };

  const dayLabels = {
    monday: "E Hënë",
    tuesday: "E Martë",
    wednesday: "E Mërkurë",
    thursday: "E Enjte",
    friday: "E Premte",
    saturday: "E Shtunë",
    sunday: "E Diel",
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto" }}>
      <h2 className="mb-4 text-success">🕐 Vendos Orarin për Mjekun</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Zgjedh Mjekun</label>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="form-select"
            required
          >
            <option value="">-- Zgjedh Mjekun --</option>
            {doctors.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.name}
              </option>
            ))}
          </select>
        </div>

        {Object.entries(workingHours).map(([day, hours]) => (
          <div key={day} className="mb-3">
            <label className="form-label fw-bold">{dayLabels[day]}:</label>
            <div className="d-flex gap-2">
              <input
                type="time"
                value={hours.start}
                onChange={(e) => handleChange(day, "start", e.target.value)}
                className="form-control"
              />
              <span className="align-self-center">deri</span>
              <input
                type="time"
                value={hours.end}
                onChange={(e) => handleChange(day, "end", e.target.value)}
                className="form-control"
              />
            </div>
          </div>
        ))}

        <button className="btn btn-success w-100" type="submit" disabled={!selectedDoctor}>
          💾 Ruaj Orarin
        </button>
      </form>
    </div>
  );
}
