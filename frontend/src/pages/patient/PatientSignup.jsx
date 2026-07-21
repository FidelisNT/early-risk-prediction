import { useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { patientApi } from "../../api/client.js";
import AppNavbar from "../../components/AppNavbar.jsx";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const initialForm = {
  full_name: "",
  email: "",
  password: "",
  phone_number: "",
  date_of_birth: "",
  gender: "",
  address: "",
  emergency_phone: "",
  blood_group: "",
};

export default function PatientSignup() {
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
      const payload = { ...form };
      if (!payload.date_of_birth) delete payload.date_of_birth;
      await patientApi.signup(payload);
      navigate("/patient/login", { state: { justSignedUp: true } });
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't create your account. Please try again.");
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
                  <h4 className="mb-0">Create your patient account</h4>
                  <p className="text-secondary small mb-0">
                    Track your stroke, heart, kidney, and diabetes predictions in one place.
                  </p>
                </div>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="fullName">
                        <Form.Label>Full name</Form.Label>
                        <Form.Control
                          required
                          value={form.full_name}
                          onChange={(e) => set("full_name", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="signupEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="signupPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          required
                          value={form.password}
                          onChange={(e) => set("password", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="phoneNumber">
                        <Form.Label>Phone number</Form.Label>
                        <Form.Control
                          value={form.phone_number}
                          onChange={(e) => set("phone_number", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3" controlId="dob">
                        <Form.Label>Date of birth</Form.Label>
                        <Form.Control
                          type="date"
                          value={form.date_of_birth}
                          onChange={(e) => set("date_of_birth", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3" controlId="gender">
                        <Form.Label>Gender</Form.Label>
                        <Form.Select
                          value={form.gender}
                          onChange={(e) => set("gender", e.target.value)}
                        >
                          <option value="">Select…</option>
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                          <option value="other">Other</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3" controlId="bloodGroup">
                        <Form.Label>Blood group</Form.Label>
                        <Form.Select
                          value={form.blood_group}
                          onChange={(e) => set("blood_group", e.target.value)}
                        >
                          <option value="">Select…</option>
                          {BLOOD_GROUPS.map((bg) => (
                            <option key={bg} value={bg}>
                              {bg}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3" controlId="address">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-4" controlId="emergencyPhone">
                    <Form.Label>Emergency contact phone</Form.Label>
                    <Form.Control
                      value={form.emergency_phone}
                      onChange={(e) => set("emergency_phone", e.target.value)}
                    />
                  </Form.Group>
                  <Button type="submit" variant="primary" className="w-100" disabled={submitting}>
                    {submitting ? "Creating account…" : "Create account"}
                  </Button>
                </Form>
                <div className="text-center mt-3">
                  <Link to="/patient/login" className="small">
                    Already have an account? Sign in
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
