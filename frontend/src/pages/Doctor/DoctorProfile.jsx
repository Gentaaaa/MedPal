import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState(null);
  const [workingHours, setWorkingHours] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 🔹 Merr të dhënat e mjekut
    axios
      .get("https://medpal-aqpz.onrender.com/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setDoctor(res.data))
      .catch((err) =>
        console.error("❌ Gabim gjatë marrjes së profilit:", err)
      );

    // 🔹 Merr orarin e punës
    axios
      .get("https://medpal-aqpz.onrender.com/api/working-hours/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("✅ Orari:", res.data);
        setWorkingHours(res.data);
      })
      .catch((err) =>
        console.error("❌ Gabim gjatë marrjes së orarit të punës:", err)
      );
  }, []);

  if (!doctor) return <p className="text-center mt-4">⏳ Duke u ngarkuar...</p>;

  return (
    <div className="container py-5" style={{ maxWidth: "700px" }}>
      <div className="card shadow">
        <div className="card-body">
          <h3 className="mb-4 text-primary">👨‍⚕️ Profili i Mjekut</h3>

          <ul className="list-group mb-3">
            <li className="list-group-item">
              <strong>Emri:</strong> {doctor.name}
            </li>
            <li className="list-group-item">
              <strong>Email:</strong> {doctor.email}
            </li>
            <li className="list-group-item">
              <strong>Kodi i Mjekut:</strong> {doctor.doctorCode}
            </li>
            <li className="list-group-item">
              <strong>Roli:</strong> {doctor.role}
            </li>
            <li className="list-group-item">
              <strong>Departamenti:</strong>{" "}
              {doctor.departmentId?.name || "—"}
            </li>
            <li className="list-group-item">
              <strong>Shërbimet:</strong>{" "}
              {Array.isArray(doctor.services) && doctor.services.length > 0
                ? doctor.services.map((s) => s.name).join(", ")
                : "—"}
            </li>
          </ul>

          {workingHours && (
            <div className="mt-4">
              <h5 className="text-success">🕐 Orari i Punës</h5>
              <ul className="list-group">
                {Object.entries(workingHours).map(([day, time]) => (
                  <li
                    key={day}
                    className="list-group-item d-flex justify-content-between"
                  >
                    <span style={{ textTransform: "capitalize" }}>{day}</span>
                    <span>
                      {time.start && time.end
                        ? `${time.start} - ${time.end}`
                        : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
