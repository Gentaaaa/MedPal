import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function UserGrowthChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://medpal-aqpz.onrender.com/api/admin/stats/monthly-users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const labels = res.data.map((item) => item._id);
        const counts = res.data.map((item) => item.count);

        setData({
          labels,
          datasets: [
            {
              label: "Përdorues të Regjistruar",
              data: counts,
              borderColor: "rgba(75,192,192,1)",
              backgroundColor: "rgba(75,192,192,0.2)",
              tension: 0.3,
            },
          ],
        });
        setLoading(false);
      } catch (err) {
        setError("Gabim gjatë marrjes së të dhënave");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Duke ngarkuar grafikët...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return <Line data={data} />;
}
