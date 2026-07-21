import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Badge, Card, Col, Row } from "react-bootstrap";
import { Building2, UserRound } from "lucide-react";
import { adminApi } from "../../api/client.js";
import LoadingScreen from "../../components/LoadingScreen.jsx";

export default function AdminDashboard() {
  const [patients, setPatients] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [patientsRes, institutionsRes] = await Promise.all([
          adminApi.getPatients(),
          adminApi.getInstitutions(),
        ]);
        setPatients(patientsRes.data);
        setInstitutions(institutionsRes.data);
      } catch (err) {
        setError("Couldn't load the overview. Please try again shortly.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingScreen label="Loading overview" />;

  const activePatients = patients.filter((p) => p.is_active).length;
  const activeInstitutions = institutions.filter((i) => i.is_active).length;

  const recentPatients = [...patients]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);
  const recentInstitutions = [...institutions]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <>
      <div className="mb-4">
        <p className="section-eyebrow mb-1">Admin</p>
        <h2 className="mb-0">Overview</h2>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card as={Link} to="/admin/patients" className="border-0 shadow-sm text-decoration-none h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "0.85rem",
                  background: "var(--vitalis-sky)",
                  color: "var(--vitalis-navy)",
                }}
              >
                <UserRound size={26} />
              </div>
              <div>
                <p className="section-eyebrow mb-1">Patients</p>
                <h3 className="font-mono mb-1">{patients.length}</h3>
                <span className="text-secondary small">{activePatients} active</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card as={Link} to="/admin/institutions" className="border-0 shadow-sm text-decoration-none h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "0.85rem",
                  background: "var(--vitalis-sky)",
                  color: "var(--vitalis-navy)",
                }}
              >
                <Building2 size={26} />
              </div>
              <div>
                <p className="section-eyebrow mb-1">Institutions</p>
                <h3 className="font-mono mb-1">{institutions.length}</h3>
                <span className="text-secondary small">{activeInstitutions} active</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title as="h5" className="mb-0">
                  Recently joined patients
                </Card.Title>
                <Link to="/admin/patients" className="small">
                  View all
                </Link>
              </div>
              {recentPatients.length === 0 ? (
                <p className="text-secondary mb-0">No patients registered yet.</p>
              ) : (
                <ul className="list-unstyled mb-0">
                  {recentPatients.map((p, idx) => (
                    <li
                      key={idx}
                      className="d-flex justify-content-between align-items-center py-2 border-bottom"
                    >
                      <div>
                        <div className="fw-medium">{p.name}</div>
                        <div className="text-secondary small">{p.email}</div>
                      </div>
                      <Badge bg={p.is_active ? "success" : "secondary"}>
                        {p.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title as="h5" className="mb-0">
                  Recently joined institutions
                </Card.Title>
                <Link to="/admin/institutions" className="small">
                  View all
                </Link>
              </div>
              {recentInstitutions.length === 0 ? (
                <p className="text-secondary mb-0">No institutions registered yet.</p>
              ) : (
                <ul className="list-unstyled mb-0">
                  {recentInstitutions.map((inst, idx) => (
                    <li
                      key={idx}
                      className="d-flex justify-content-between align-items-center py-2 border-bottom"
                    >
                      <div>
                        <div className="fw-medium">{inst.name}</div>
                        <div className="text-secondary small">{inst.email}</div>
                      </div>
                      <Badge bg={inst.is_active ? "success" : "secondary"}>
                        {inst.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
