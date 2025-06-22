import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API = import.meta.env.VITE_API_BASE_URL;

export default function Login() {
  const [step, setStep] = useState("select");
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    doctorCode: "",
    code: "",
    newPassword: "",
    adminSecret: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep("login");
    setError("");
    setMessage("");
    setFormData({
      email: "",
      password: "",
      doctorCode: "",
      code: "",
      newPassword: "",
      adminSecret: "",
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let res;
      if (role === "doctor") {
        res = await axios.post(`${API}/api/auth/login-doctor`, {
          doctorCode: formData.doctorCode,
          password: formData.password,
        });
      } else {
        res = await axios.post(`${API}/api/auth/login`, {
          email: formData.email,
          password: formData.password,
          expectedRole: role,
        });
      }

      const { token, user } = res.data;
      if (role === "patient" && !user.isVerified) {
        return setError("📧 Ju lutemi verifikoni emailin përpara se të qaseni.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || "Gabim gjatë qasjes.");
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await axios.post(`${API}/api/auth/forgot-password`, {
        email: formData.email,
        role,
      });
      setMessage("✅ Një kod është dërguar në email. Kontrollo inbox-in.");
      setStep("reset");
    } catch (err) {
      setError(err.response?.data?.message || "Gabim gjatë dërgimit të kodit.");
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await axios.post(`${API}/api/auth/reset-password`, {
        email: formData.email,
        role,
        code: formData.code,
        newPassword: formData.newPassword,
      });
      setMessage("🔒 Fjalëkalimi u ndryshua me sukses. Mund të qaseni tani.");
      setStep("login");
    } catch (err) {
      setError(err.response?.data?.message || "Gabim gjatë ndryshimit të fjalëkalimit.");
    }
  };

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <div className="card p-4 shadow-lg" style={{ maxWidth: "480px", width: "100%" }}>
        {/* pjesa e return është e njëjtë si më herët */}
        {/* Nuk e përsëris të gjithë HTML sepse s’ka ndryshuar – vetëm axios.post URLs janë përditësuar me API */}
      </div>
    </div>
  );
}
