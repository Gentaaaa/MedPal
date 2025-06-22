import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!user || !token || user.role !== "admin") {
    return <Navigate to="/" />; // kthe në homepage nëse nuk je admin
  }

  return children;
}
