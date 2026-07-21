import { useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { institutionApi } from "../../api/client";
import AppNavbar from "../../components/AppNavbar";

const initialForm = {
  name: "",
  email: "",
  password: "",
  license_number: "",
  phone: "",
  address: "",
  city: "",
  country: "",
};

export default function InstitutionSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await institutionApi.signup(form);
      navigate("/institution/login", { state: { justSignedUp: true } });
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't create the institution account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <AppNavbar />
      <div className="auth-shell py-5">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} md={9} lg={7}>
              <Card className="p-4 shadow-sm border-0">
                <div className="mb-4">
                  <h4 className="mb-0">Register your institution</h4>
                  <p className="text-secondary small mb-0">
                    Submit patient health data and review prediction history.
                  </p>
                </div>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="institutionName">
                        <Form.Label>Institution name</Form.Label>
                        <Form.Control
                          required
                          value={form.name}
                          onChange={(e) => set("name", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="licenseNumber">
                        <Form.Label>License number</Form.Label>
                        <Form.Control
                          required
                          value={form.license_number}
                          onChange={(e) => set("license_number", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="institutionEmailSignup">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="institutionPasswordSignup">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          required
                          value={form.password}
                          onChange={(e) => set("password", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3" controlId="institutionPhone">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          value={form.phone}
                          onChange={(e) => set("phone", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3" controlId="institutionCity">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                          value={form.city}
                          onChange={(e) => set("city", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3" controlId="institutionCountry">
                        <Form.Label>Country</Form.Label>
                        <Form.Control
                          value={form.country}
                          onChange={(e) => set("country", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-4" controlId="institutionAddress">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                    />
                  </Form.Group>
                  <Button type="submit" variant="primary" className="w-100" disabled={submitting}>
                    {submitting ? "Creating account…" : "Create account"}
                  </Button>
                </Form>
                <div className="text-center mt-3">
                  <Link to="/institution/login" className="small">
                    Already registered? Sign in
                  </Link>
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}
