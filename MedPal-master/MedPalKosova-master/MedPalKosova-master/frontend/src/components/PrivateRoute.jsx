import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // ⛔ Nëse s'ka token ose user, dërgo në login
  if (!token || !user) return <Navigate to="/login" />;

  // ⛔ Nëse user-i s’ka një nga rolet e lejuara
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  // ✅ Akses i lejuar
  return children;
}
