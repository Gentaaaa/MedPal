import React, { useState, useEffect } from "react";
import axios from "axios";
const API = import.meta.env.VITE_API_BASE_URL;

const VerifyEmail = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const emailParam = queryParams.get("email");
    if (emailParam) setEmail(emailParam);
  }, []);

  const handleVerify = async () => {
    try {
      const res = await axios.post("/api/auth/verify-email", { email, code });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Gabim gjatë verifikimit.");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Verifikimi i Emailit</h2>
      <p>Email: <strong>{email}</strong></p>
      <input
        className="form-control my-2"
        placeholder="Shkruani kodin e verifikimit"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button className="btn btn-primary" onClick={handleVerify}>
        Verifiko
      </button>
      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
};

export default VerifyEmail;
