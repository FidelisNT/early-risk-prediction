import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import AppNavbar from "../../components/AppNavbar";

export default function AdminLayout() {
  return (
    <>
      <AppNavbar
        roleLabel="Admin"
        links={[
          { to: "/admin/dashboard", label: "Dashboard" },
          { to: "/admin/patients", label: "Patients" },
          { to: "/admin/institutions", label: "Institutions" },
        ]}
      />
      <Container className="py-4 py-lg-5">
        <Outlet />
      </Container>
    </>
  );
}
