import { Link } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";
import { Building2, ShieldCheck, UserRound } from "lucide-react";
import DiseaseIcon from "../components/DiseaseIcon.jsx";
import { DISEASES, DISEASE_LABELS } from "../api/client.js";
import AppNavbar from "../components/AppNavbar.jsx";

const ROLES = [
  {
    key: "patient",
    title: "Patient",
    description: "See your latest risk predictions and manage your health profile.",
    icon: UserRound,
    loginTo: "/patient/login",
    signupTo: "/signup?role=patient",
  },
  {
    key: "institution",
    title: "Institution",
    description: "Submit patient health data and review prediction history.",
    icon: Building2,
    loginTo: "/institution/login",
    signupTo: "/signup?role=institution",
  },
  {
    key: "admin",
    title: "Admin",
    description: "Oversee registered patients and partner institutions.",
    icon: ShieldCheck,
    loginTo: "/admin/login",
    signupTo: null,
  },
];

export default function Landing() {
  return (
    <>
      <AppNavbar />
      <div className="auth-shell">
        <Container className="py-5">
          <Row className="justify-content-center text-center mb-5">
            <Col lg={8}>
              <p className="section-eyebrow mb-2">Four models, one record</p>
              <h1 className="display-5 mb-3">
                Early signals for stroke, heart, kidney &amp; diabetes risk.
              </h1>
              <p className="text-secondary fs-5">
                Vitalis brings patients, care institutions, and administrators onto a
                single prediction record — sign in below to pick up where you left off.
              </p>
              <div className="d-flex justify-content-center gap-3 gap-md-4 mt-4 flex-wrap">
                {DISEASES.map((d) => (
                  <div key={d} className="d-flex flex-column align-items-center text-secondary">
                    <div
                      className="d-flex align-items-center justify-content-center mb-1"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: "var(--vitalis-sky)",
                        color: "var(--vitalis-blue)",
                      }}
                    >
                      <DiseaseIcon disease={d} size={20} />
                    </div>
                    <small className="fw-medium">{DISEASE_LABELS[d]}</small>
                  </div>
                ))}
              </div>
            </Col>
          </Row>

          <Row className="g-4 justify-content-center">
            {ROLES.map((role) => {
              const Icon = role.icon;
              return (
                <Col key={role.key} md={6} lg={4}>
                  <div className="role-landing-card bg-white rounded-4 p-4 h-100 shadow-sm d-flex flex-column">
                    <div
                      className="d-flex align-items-center justify-content-center mb-3"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "0.85rem",
                        background: "var(--vitalis-sky)",
                        color: "var(--vitalis-navy)",
                      }}
                    >
                      <Icon size={24} />
                    </div>
                    <h5 className="mb-2">{role.title}</h5>
                    <p className="text-secondary flex-grow-1">{role.description}</p>
                    <div className="d-flex gap-2 mt-2">
                      <Link to={role.loginTo} className="btn btn-primary flex-grow-1">
                        Log in
                      </Link>
                      {role.signupTo && (
                        <Link to={role.signupTo} className="btn btn-outline-secondary flex-grow-1">
                          Sign up
                        </Link>
                      )}
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </Container>
      </div>
    </>
  );
}
