import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, ShieldPlus } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";

export default function AppNavbar({ roleLabel, links = [], showLogout = false }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <Navbar expand="md" variant="dark" className="app-navbar px-3" sticky="top">
      <Container fluid className="px-lg-4">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <span className="brand-mark">
            <ShieldPlus size={18} color="#fff" />
          </span>
          Vitalis
          {roleLabel && (
            <span className="ms-2 fw-normal opacity-75" style={{ fontSize: "0.85rem" }}>
              / {roleLabel}
            </span>
          )}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto align-items-md-center gap-md-2">
            {links.map((link) => (
              <Nav.Link
                as={NavLink}
                key={link.to}
                to={link.to}
                end={link.end}
                className="fw-medium"
              >
                {link.label}
              </Nav.Link>
            ))}
            {showLogout && (
              <Nav.Link onClick={handleLogout} className="fw-medium d-flex align-items-center gap-1">
                <LogOut size={16} /> Log out
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
