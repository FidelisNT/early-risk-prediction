import { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { institutionApi } from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import AuthSplitLayout from "../../components/AuthSplitLayout";

export default function InstitutionLogin() {
  const navigate = useNavigate();
  const { setAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // Note: rememberMe is currently UI-only - see PatientLogin.jsx for
      // the same caveat.
      await institutionApi.login(form.email, form.password);
      setAuthenticated("institution");
      navigate("/institution/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout
      badgeLabel="Health Institution"
      headline="Early risk detection, powered by machine learning."
      description="Sign in to manage patients, run heart disease, kidney, stroke, and diabetes risk predictions, and keep every care team aligned."
    >
      <h3 className="mb-1">Welcome back</h3>
      <p className="text-secondary mb-4">Log in to your Vitalis account to continue.</p>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="institutionEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="institutionPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Form.Group>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <Form.Check
            type="checkbox"
            id="institutionRememberMe"
            label="Remember me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          {/* Placeholder - no password-reset endpoint exists yet. */}
          <span
            className="small text-secondary"
            style={{ cursor: "not-allowed" }}
            title="Not available yet"
          >
            Forgot password?
          </span>
        </div>

        <Button type="submit" variant="primary" className="w-100" disabled={submitting}>
          {submitting ? "Signing in…" : "Log in"}
        </Button>
      </Form>

      <div className="auth-divider">or continue with</div>

      {/* Visual placeholders only - no OAuth is wired up on the backend. */}
      <div className="d-flex gap-3 mb-4">
        <button type="button" className="auth-social-btn flex-grow-1" disabled title="Not available yet">
          Google
        </button>
        <button type="button" className="auth-social-btn flex-grow-1" disabled title="Not available yet">
          Microsoft
        </button>
      </div>

      <p className="text-center text-secondary mb-0">
        Don't have an account?{" "}
        <Link to="/signup?role=institution">Register</Link>
      </p>
    </AuthSplitLayout>
  );
}
