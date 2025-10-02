import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "./auth";
import { Layout } from "../components/Layout";

export default function PrivateRoute() {
  return isAuthenticated() ? (
    <Layout>
      <Outlet />
    </Layout>
  ) : (
    <Navigate to="/login" replace />
  );
}