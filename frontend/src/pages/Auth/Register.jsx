import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API = import.meta.env.VITE_API_BASE_URL;

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
    clinicCode: "",
  });

  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [resendMessage, setResendMessage] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/api/auth/register`, formData);
      if (formData.role === "patient" && res.data.message.includes("Verifikoni")) {
        setVerificationStep(true);
      } else {
        alert(res.data.message || "Regjistrimi u krye me sukses!");
        navigate("/login");
      }
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Gabim gjatë regjistrimit!"));
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/api/auth/verify-email`, {
        email: formData.email,
        code: verificationCode,
      });
      setVerificationMessage("✅ " + res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setVerificationMessage("❌ " + (err.response?.data?.message || "Gabim në verifikim."));
    }
  };

  const resendCode = async () => {
    try {
      const res = await axios.post(`${API}/api/auth/resend-verification`, {
        email: formData.email,
      });
      setResendMessage("📧 " + res.data.message);
    } catch (err) {
      setResendMessage("❌ " + (err.response?.data?.message || "Gabim në ridërgim."));
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <div className="card p-4 shadow-lg" style={{ maxWidth: "480px", width: "100%" }}>
        <h2 className="text-center mb-4">Regjistrohu në MedPal</h2>

        {!verificationStep ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input name="name" className="form-control form-control-lg" placeholder="Emri i plotë" onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <input name="email" type="email" className="form-control form-control-lg" placeholder="Email" onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <input name="password" type="password" className="form-control form-control-lg" placeholder="Fjalëkalimi" onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <select name="role" className="form-select form-select-lg" value={formData.role} onChange={handleChange}>
                <option value="patient">Pacient</option>
                <option value="clinic">Klinikë</option>
              </select>
            </div>

            {formData.role === "clinic" && (
              <div className="mb-3">
                <input name="clinicCode" className="form-control form-control-lg" placeholder="Kodi i Klinikës" value={formData.clinicCode} onChange={handleChange} required />
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg w-100">Regjistrohu</button>
          </form>
        ) : (
          <div>
            <h4 className="mb-3 text-center">Verifiko Emailin</h4>
            <form onSubmit={verifyCode}>
              <div className="mb-3">
                <input type="text" className="form-control form-control-lg" placeholder="Kodi i verifikimit" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-success btn-lg w-100 mb-2">Verifiko</button>
            </form>
            <button className="btn btn-link" onClick={resendCode}>📩 Ridërgo Kodin</button>
            <p>{verificationMessage}</p>
            <p>{resendMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
