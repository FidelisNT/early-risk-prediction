import { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import AuthSplitLayout from "../../components/AuthSplitLayout";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await adminApi.login(form.email, form.password);
      setAuthenticated("admin");
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout
      badgeLabel="Admin Console"
      headline="Oversee every patient and partner institution."
      description="Sign in to manage registered accounts across the Vitalis platform."
    >
      <h3 className="mb-1">Welcome back</h3>
      <p className="text-secondary mb-4">Log in to your admin account to continue.</p>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="adminEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-4" controlId="adminPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Form.Group>
        <Button type="submit" variant="primary" className="w-100" disabled={submitting}>
          {submitting ? "Signing in…" : "Log in"}
        </Button>
      </Form>
    </AuthSplitLayout>
  );
}
