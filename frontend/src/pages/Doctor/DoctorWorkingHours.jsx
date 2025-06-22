import { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function DoctorWorkingHours() {
  const [days, setDays] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("https://medpal-aqpz.onrender.com/api/working-hours/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data) {
          setDays(res.data.days || []);
          setStartTime(res.data.startTime || "");
          setEndTime(res.data.endTime || "");
        }
      })
      .catch(() => {});
  }, [token]);

  const handleCheckboxChange = (day) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startTime || !endTime || days.length === 0) {
      return alert("Plotësoni të gjitha fushat dhe zgjidhni ditët.");
    }

    try {
      await axios.post(
        "https://medpal-aqpz.onrender.com/api/working-hours",
        { days, startTime, endTime },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("✅ Orari u ruajt me sukses!");
    } catch (err) {
      alert("❌ Gabim gjatë ruajtjes së orarit.");
    }
  };

  const weekdays = [
    "E Hënë",
    "E Martë",
    "E Mërkurë",
    "E Enjte",
    "E Premte",
    "E Shtunë",
    "E Diel",
  ];

  return (
    <div className="container py-5" style={{ maxWidth: "600px" }}>
      <div className="card shadow">
        <div className="card-body">
          <h3 className="mb-4">🕐 Menaxho Orarin e Punës</h3>

          {message && <div className="alert alert-success">{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label"><strong>Zgjedh ditët e punës:</strong></label>
              <div className="row">
                {weekdays.map((day, idx) => (
                  <div className="col-6" key={idx}>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`day-${idx}`}
                        checked={days.includes(day)}
                        onChange={() => handleCheckboxChange(day)}
                      />
                      <label className="form-check-label" htmlFor={`day-${idx}`}>
                        {day}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">🕘 Ora e fillimit:</label>
              <input
                type="time"
                className="form-control"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label">🕓 Ora e përfundimit:</label>
              <input
                type="time"
                className="form-control"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-success w-100">
              💾 Ruaj Orarin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
