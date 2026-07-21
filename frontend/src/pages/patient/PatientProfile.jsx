import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Form, Row } from "react-bootstrap";
import { patientApi } from "../../api/client";
import LoadingScreen from "../../components/LoadingScreen";

export default function PatientProfile() {
  const [form, setForm] = useState(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    patientApi
      .getProfile()
      .then((res) => setForm(res.data))
      .catch(() => setError("Couldn't load your profile."))
      .finally(() => setLoading(false));
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const payload = { ...form };
      if (password) payload.password = password;
      const res = await patientApi.updateProfile(payload);
      setForm(res.data);
      setPassword("");
      setSuccess("Profile updated.");
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't save your changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingScreen label="Loading your profile" />;
  if (!form) return <Alert variant="danger">{error || "Profile not found."}</Alert>;

  return (
    <Row className="justify-content-center">
      <Col lg={7}>
        <p className="section-eyebrow mb-1">Patient profile</p>
        <h2 className="mb-4">Your details</h2>
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="profileName">
                    <Form.Label>Full name</Form.Label>
                    <Form.Control
                      value={form.user_name || ""}
                      onChange={(e) => set("user_name", e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="profileEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      value={form.email || ""}
                      onChange={(e) => set("email", e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="profilePhone">
                    <Form.Label>Phone number</Form.Label>
                    <Form.Control
                      value={form.phone_number || ""}
                      onChange={(e) => set("phone_number", e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="profileBloodGroup">
                    <Form.Label>Blood group</Form.Label>
                    <Form.Control
                      value={form.blood_group || ""}
                      onChange={(e) => set("blood_group", e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3" controlId="profileAddress">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  value={form.address || ""}
                  onChange={(e) => set("address", e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-4" controlId="profilePassword">
                <Form.Label>New password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Leave blank to keep your current password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
