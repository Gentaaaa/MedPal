// src/pages/Doctor/AddVisitReport.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Form, Button, Alert, Card, Spinner } from "react-bootstrap";

export default function AddVisitReport() {
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({
    appointmentId: "",
    diagnosis: "",
    recommendation: "",
    temperature: "",
    bloodPressure: "",
    symptoms: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://medpal-aqpz.onrender.com/api/appointments/doctor", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data.filter(a => a.status === "approved"));
      } catch (err) {
        console.error("❌ Gabim në marrjen e termineve:", err);
      }
    })();
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: "", type: "" });
    try {
      const token = localStorage.getItem("token");
      await axios.post("https://medpal-aqpz.onrender.com/api/reports", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage({ text: "✅ Raporti u ruajt me sukses!", type: "success" });
      setForm({
        appointmentId: "",
        diagnosis: "",
        recommendation: "",
        temperature: "",
        bloodPressure: "",
        symptoms: "",
      });
    } catch (err) {
      console.error("❌ Gabim gjatë ruajtjes së raportit:", err);
      setMessage({ text: "❌ Dështoi ruajtja e raportit.", type: "danger" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto my-5" style={{ maxWidth: "600px" }}>
      <Card.Body>
        <Card.Title className="mb-4">🧾 Krijo Raport Vizite</Card.Title>

        {message.text && (
          <Alert variant={message.type}>
            {message.text}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>📋 Zgjedh Terminin</Form.Label>
            <Form.Select
              name="appointmentId"
              value={form.appointmentId}
              onChange={handleChange}
              required
            >
              <option value="">-- Zgjidh --</option>
              {appointments.map(a => (
                <option key={a._id} value={a._id}>
                  {a.patientId?.name} – {a.date} {a.time}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Diagnoza</Form.Label>
            <Form.Control
              as="textarea"
              name="diagnosis"
              value={form.diagnosis}
              onChange={handleChange}
              placeholder="Përshkruaj diagnozën"
              rows={3}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Rekomandime</Form.Label>
            <Form.Control
              as="textarea"
              name="recommendation"
              value={form.recommendation}
              onChange={handleChange}
              placeholder="Rekomandimet për pacientin"
              rows={2}
            />
          </Form.Group>

          <Form.Group className="row mb-3">
            <div className="col">
              <Form.Label>Temperatura (°C)</Form.Label>
              <Form.Control
                type="number"
                name="temperature"
                value={form.temperature}
                onChange={handleChange}
                placeholder="p.sh. 37.5"
              />
            </div>
            <div className="col">
              <Form.Label>Tensioni</Form.Label>
              <Form.Control
                type="text"
                name="bloodPressure"
                value={form.bloodPressure}
                onChange={handleChange}
                placeholder="p.sh. 120/80"
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Simptomat</Form.Label>
            <Form.Control
              type="text"
              name="symptoms"
              value={form.symptoms}
              onChange={handleChange}
              placeholder="Listo simptomat"
            />
          </Form.Group>

          <Button variant="primary" type="submit" disabled={submitting} className="w-100">
            {submitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                /> Po ruhet...
              </>
            ) : (
              "💾 Ruaj Raportin"
            )}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}
