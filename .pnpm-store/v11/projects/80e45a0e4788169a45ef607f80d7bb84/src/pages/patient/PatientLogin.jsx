import { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { patientApi } from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import AuthSplitLayout from "../../components/AuthSplitLayout";

export default function PatientLogin() {
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
      // Note: rememberMe is currently UI-only - the backend issues a fixed
      // 24h session regardless of this toggle. Wire it into the login
      // request / session TTL on the backend if you want it to actually
      // extend or shorten how long the session lasts.
      await patientApi.login(form.email, form.password);
      setAuthenticated("patient");
      navigate("/patient/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout
      badgeLabel="Patient Portal"
      headline="Your health signals, all in one place."
      description="Sign in to see your latest stroke, heart, kidney, and diabetes predictions and manage your profile."
    >
      <h3 className="mb-1">Welcome back</h3>
      <p className="text-secondary mb-4">Log in to your Vitalis account to continue.</p>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="patientEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="patientPassword">
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
            id="patientRememberMe"
            label="Remember me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          {/* No password-reset endpoint exists on the backend yet - this is
              a placeholder so the layout matches the design, not a working
              flow. Wire up a real /forgot-password route before enabling it. */}
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

      {/* Visual placeholders only - no OAuth is wired up on the backend.
          Disabled rather than faked, so this doesn't look functional when
          it isn't. */}
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
        <Link to="/signup?role=patient">Register</Link>
      </p>
    </AuthSplitLayout>
  );
}
