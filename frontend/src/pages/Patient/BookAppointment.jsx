import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
const API = import.meta.env.VITE_API_BASE_URL;


export default function BookAppointment() {
  const [form, setForm] = useState({
    doctorId: "",
    serviceId: "",
    date: "",
    time: "",
  });

  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [workingHours, setWorkingHours] = useState(null);
  const [takenTimes, setTakenTimes] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [loadingServices, setLoadingServices] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get("https://medpal-aqpz.onrender.com/api/doctors/public");
        setDoctors(res.data);
      } catch (err) {
        console.error("❌ Gabim në marrjen e mjekëve:", err);
      }
    };
    fetchDoctors();
  }, []);

  const fetchServicesAndHours = async (doctorId) => {
    setLoadingServices(true);
    try {
      const [servicesRes, hoursRes] = await Promise.all([
        axios.get(`https://medpal-aqpz.onrender.com/api/doctors/${doctorId}/services`), // Vetëm shërbimet e doktorit
        axios.get(`https://medpal-aqpz.onrender.com/api/working-hours/${doctorId}`),
      ]);
      setServices(servicesRes.data);
      setWorkingHours(hoursRes.data);
    } catch (err) {
      console.error("❌ Gabim në marrjen e shërbimeve ose orarit:", err);
      setServices([]);
      setWorkingHours(null);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchTakenTimes = async (doctorId, date) => {
    try {
      const res = await axios.get(
        `https://medpal-aqpz.onrender.com/api/appointments/taken?doctorId=${doctorId}&date=${date}`
      );
      setTakenTimes(res.data);
    } catch (err) {
      console.error("❌ Gabim në kontrollin e orëve të zëna:", err);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "doctorId") {
      await fetchServicesAndHours(value);
      setForm((prev) => ({ ...prev, serviceId: "", date: "", time: "" }));
    }

    if (name === "date" && form.doctorId) {
      await fetchTakenTimes(form.doctorId, value);
      setForm((prev) => ({ ...prev, time: "" }));
    }
  };

  const currentDaySchedule = () => {
    if (!form.date || !workingHours) return null;
    const weekday = new Date(form.date).toLocaleDateString("en-US", {
      weekday: "long",
    }).toLowerCase();
    return workingHours[weekday] || null;
  };

  const isTimeAvailable = (time) => !takenTimes.includes(time);

  const timeOptions = () => {
    const schedule = currentDaySchedule();
    if (!schedule || !schedule.start || !schedule.end) return [];

    const [startH, startM] = schedule.start.split(":").map(Number);
    const [endH, endM] = schedule.end.split(":").map(Number);

    const times = [];
    let current = new Date(0, 0, 0, startH, startM);
    const end = new Date(0, 0, 0, endH, endM);

    while (current < end) {
      const hh = current.getHours().toString().padStart(2, "0");
      const mm = current.getMinutes().toString().padStart(2, "0");
      const time = `${hh}:${mm}`;
      if (isTimeAvailable(time)) times.push(time);
      current.setMinutes(current.getMinutes() + 30);
    }

    return times;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setSuccessMessage("");

    // ⛔ Kontroll nëse mjeku nuk punon atë ditë
    if (!currentDaySchedule()) {
      setSuccessMessage("❌ Mjeku nuk punon këtë ditë. Ju lutemi zgjidhni një ditë tjetër.");
      return;
    }

    try {
      await axios.post("https://medpal-aqpz.onrender.com/api/appointments", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMessage("✅ Termini u regjistrua me sukses!");
      setTimeout(() => {
        navigate("/patient");
      }, 1500);
    } catch (err) {
      if (err.response?.status === 409) {
        setSuccessMessage("❌ Ky orar është i zënë për këtë mjek.");
      } else if (err.response?.data?.message) {
        setSuccessMessage("❌ " + err.response.data.message);
      } else {
        setSuccessMessage("❌ Gabim gjatë rezervimit.");
      }
      console.error(err);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">📅 Rezervo Terminin</h2>

          {successMessage && (
            <div
              className={`alert ${successMessage.startsWith("✅") ? "alert-success" : "alert-danger"}`}
              role="alert"
            >
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="d-grid gap-3">
            <select
              name="doctorId"
              value={form.doctorId}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Zgjedh Mjekun</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>

            <select
              name="serviceId"
              value={form.serviceId}
              onChange={handleChange}
              className="form-select"
              required
              disabled={!services.length}
            >
              <option value="">Zgjedh Shërbimin</option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} – {s.price}€
                </option>
              ))}
            </select>

            {!loadingServices && services.length === 0 && form.doctorId && (
              <div className="text-danger small">❗ Ky mjek nuk ka shërbime të publikuara.</div>
            )}

            <input
              name="date"
              type="date"
              className="form-control"
              value={form.date}
              onChange={handleChange}
              required
              disabled={!form.doctorId}
              min={new Date().toISOString().split("T")[0]}
            />

            {form.date && (
              currentDaySchedule() ? (
                <div className="text-muted small">
                  Orari për këtë ditë: {currentDaySchedule().start} - {currentDaySchedule().end}
                </div>
              ) : (
                <div className="text-danger small">❌ Mjeku nuk punon këtë ditë.</div>
              )
            )}

            <select
              name="time"
              value={form.time}
              onChange={handleChange}
              className="form-select"
              required
              disabled={!currentDaySchedule()}
            >
              <option value="">Zgjedh Orën</option>
              {timeOptions().map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100"
              disabled={!form.time}
            >
              ✅ Rezervo Terminin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
