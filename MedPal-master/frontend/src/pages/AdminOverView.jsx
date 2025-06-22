import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const token = localStorage.getItem("token"); // ose adminToken, varësisht si e ruan
        const res = await axios.get("http://localhost:5000/api/admin/overview", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        setError("Nuk mund të ngarkohen statistikat.");
      }
    };

    fetchOverview();
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!stats) return <div>Ngarkohet...</div>;

  return (
    <div className="container py-4">
      <h2>📊 Përmbledhje Admini</h2>

      <div className="row my-4">
        <div className="col-md-3">
          <div className="card text-white bg-primary mb-3">
            <div className="card-body">
              <h5 className="card-title">Totali i Përdoruesve</h5>
              <p className="card-text fs-3">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        {Object.entries(stats.usersByRole).map(([role, count]) => (
          <div key={role} className="col-md-3">
            <div className="card text-white bg-secondary mb-3">
              <div className="card-body">
                <h6 className="card-title text-capitalize">{role}</h6>
                <p className="card-text fs-4">{count}</p>
              </div>
            </div>
          </div>
        ))}

        <div className="col-md-3">
          <div className="card text-white bg-success mb-3">
            <div className="card-body">
              <h6 className="card-title">Verifikuar</h6>
              <p className="card-text fs-4">{stats.verifiedUsers}</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-white bg-danger mb-3">
            <div className="card-body">
              <h6 className="card-title">Jo Verifikuar</h6>
              <p className="card-text fs-4">{stats.unverifiedUsers}</p>
            </div>
          </div>
        </div>
      </div>

      <h3>💰 Pagesat</h3>
      <div className="row">
        <div className="col-md-4">
          <div className="card border-success mb-3">
            <div className="card-body">
              <h6 className="card-title">Të Ardhurat Totale</h6>
              <p className="card-text fs-4">${stats.payments.totalRevenue}</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-warning mb-3">
            <div className="card-body">
              <h6 className="card-title">Pagesa në Pritje</h6>
              <p className="card-text fs-4">${stats.payments.pendingPayments}</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-danger mb-3">
            <div className="card-body">
              <h6 className="card-title">Pagesa të Dështuar</h6>
              <p className="card-text fs-4">${stats.payments.failedPayments}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
