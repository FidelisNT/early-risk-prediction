import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Form, Row } from "react-bootstrap";
import { institutionApi } from "../../api/client";
import LoadingScreen from "../../components/LoadingScreen";

export default function InstitutionProfile() {
  const [form, setForm] = useState(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    institutionApi
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
      const res = await institutionApi.updateProfile(payload);
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
        <p className="section-eyebrow mb-1">Institution profile</p>
        <h2 className="mb-4">Your details</h2>
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="instName">
                    <Form.Label>Institution name</Form.Label>
                    <Form.Control
                      value={form.institution_name || ""}
                      onChange={(e) => set("institution_name", e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="instEmail">
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
                  <Form.Group className="mb-3" controlId="instPhone">
                    <Form.Label>Phone number</Form.Label>
                    <Form.Control
                      value={form.phone_number || ""}
                      onChange={(e) => set("phone_number", e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="instLicense">
                    <Form.Label>License number</Form.Label>
                    <Form.Control
                      value={form.license_number || ""}
                      onChange={(e) => set("license_number", e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="instCity">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      value={form.city || ""}
                      onChange={(e) => set("city", e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="instCountry">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                      value={form.country || ""}
                      onChange={(e) => set("country", e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="instPassword">
                    <Form.Label>New password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Leave blank to keep current"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-4" controlId="instAddress">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  value={form.address || ""}
                  onChange={(e) => set("address", e.target.value)}
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
