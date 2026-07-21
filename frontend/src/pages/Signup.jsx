import { useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { patientApi, institutionApi } from "../api/client";
import AuthSplitLayout from "../components/AuthSplitLayout";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const initialPatientForm = {
  full_name: "",
  email: "",
  password: "",
  confirm_password: "",
  phone_number: "",
  date_of_birth: "",
  gender: "",
  address: "",
  emergency_phone: "",
  blood_group: "",
};

const initialInstitutionForm = {
  name: "",
  email: "",
  password: "",
  confirm_password: "",
  license_number: "",
  phone: "",
  address: "",
  city: "",
  country: "",
};

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // "institution" is the only non-patient account type the backend
  // supports (a care-org account, not an individual clinician record) - the
  // "Doctor / Staff" label matches the reference design, but on submit it
  // maps to institution signup since that's the only role that exists.
  const [role, setRole] = useState(
    searchParams.get("role") === "institution" ? "institution" : "patient"
  );

  const [patientForm, setPatientForm] = useState(initialPatientForm);
  const [institutionForm, setInstitutionForm] = useState(initialInstitutionForm);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function setPatientField(field, value) {
    setPatientForm((f) => ({ ...f, [field]: value }));
  }
  function setInstitutionField(field, value) {
    setInstitutionForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const form = role === "patient" ? patientForm : institutionForm;
    if (form.password !== form.confirm_password) {
      setError("Passwords don't match.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }

    setSubmitting(true);
    try {
      if (role === "patient") {
        const payload = { ...patientForm };
        delete payload.confirm_password;
        if (!payload.date_of_birth) delete payload.date_of_birth;
        await patientApi.signup(payload);
        navigate("/patient/login", { state: { justSignedUp: true } });
      } else {
        const payload = { ...institutionForm };
        delete payload.confirm_password;
        await institutionApi.signup(payload);
        navigate("/institution/login", { state: { justSignedUp: true } });
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout
      badgeLabel={role === "patient" ? "Patient Portal" : "Health Institution"}
      headline={
        role === "patient"
          ? "Track your health, one prediction at a time."
          : "Bring your care team onto Vitalis."
      }
      description={
        role === "patient"
          ? "Register to see your stroke, heart, kidney, and diabetes risk predictions in one place."
          : "Register to submit patient health data and access risk predictions across your institution."
      }
    >
      <h3 className="mb-1">Create your account</h3>
      <p className="text-secondary mb-4">
        Register to access patient records, risk predictions, and care coordination tools.
      </p>

      <Form.Label className="small fw-medium">I am registering as</Form.Label>
      <div className="auth-role-toggle mb-4">
        <button
          type="button"
          className={role === "patient" ? "active" : ""}
          onClick={() => setRole("patient")}
        >
          Patient
        </button>
        <button
          type="button"
          className={role === "institution" ? "active" : ""}
          onClick={() => setRole("institution")}
        >
          Doctor / Staff
        </button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        {role === "patient" ? (
          <>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="signupFullName">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    required
                    value={patientForm.full_name}
                    onChange={(e) => setPatientField("full_name", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="signupDob">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    value={patientForm.date_of_birth}
                    onChange={(e) => setPatientField("date_of_birth", e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="signupEmail">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    required
                    value={patientForm.email}
                    onChange={(e) => setPatientField("email", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="signupPhone">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    value={patientForm.phone_number}
                    onChange={(e) => setPatientField("phone_number", e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="signupGender">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    value={patientForm.gender}
                    onChange={(e) => setPatientField("gender", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="signupBloodGroup">
                  <Form.Label>Blood Group</Form.Label>
                  <Form.Select
                    value={patientForm.blood_group}
                    onChange={(e) => setPatientField("blood_group", e.target.value)}
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
            <Form.Group className="mb-3" controlId="signupAddress">
              <Form.Label>Address</Form.Label>
              <Form.Control
                value={patientForm.address}
                onChange={(e) => setPatientField("address", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="signupEmergencyPhone">
              <Form.Label>Emergency Contact Phone</Form.Label>
              <Form.Control
                value={patientForm.emergency_phone}
                onChange={(e) => setPatientField("emergency_phone", e.target.value)}
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="signupPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    required
                    value={patientForm.password}
                    onChange={(e) => setPatientField("password", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="signupConfirmPassword">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    required
                    value={patientForm.confirm_password}
                    onChange={(e) => setPatientField("confirm_password", e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </>
        ) : (
          <>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="signupInstName">
                  <Form.Label>Institution Name</Form.Label>
                  <Form.Control
                    required
                    value={institutionForm.name}
                    onChange={(e) => setInstitutionField("name", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="signupLicense">
                  <Form.Label>License Number</Form.Label>
                  <Form.Control
                    required
                    value={institutionForm.license_number}
                    onChange={(e) => setInstitutionField("license_number", e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="signupInstEmail">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    required
                    value={institutionForm.email}
                    onChange={(e) => setInstitutionField("email", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="signupInstPhone">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    value={institutionForm.phone}
                    onChange={(e) => setInstitutionField("phone", e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="signupInstCity">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    value={institutionForm.city}
                    onChange={(e) => setInstitutionField("city", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="signupInstCountry">
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    value={institutionForm.country}
                    onChange={(e) => setInstitutionField("country", e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3" controlId="signupInstAddress">
              <Form.Label>Address</Form.Label>
              <Form.Control
                value={institutionForm.address}
                onChange={(e) => setInstitutionField("address", e.target.value)}
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="signupInstPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    required
                    value={institutionForm.password}
                    onChange={(e) => setInstitutionField("password", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="signupInstConfirmPassword">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    required
                    value={institutionForm.confirm_password}
                    onChange={(e) => setInstitutionField("confirm_password", e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </>
        )}

        <Form.Group className="mb-4" controlId="signupTerms">
          <Form.Check
            type="checkbox"
            required
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            label={
              <span>
                I agree to the{" "}
                <a href="#" onClick={(e) => e.preventDefault()} title="Not available yet">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" onClick={(e) => e.preventDefault()} title="Not available yet">
                  Privacy Policy
                </a>
                , and consent to my health data being used for risk prediction.
              </span>
            }
          />
        </Form.Group>

        <Button type="submit" variant="primary" className="w-100" disabled={submitting}>
          {submitting ? "Creating account…" : "Create Account"}
        </Button>
      </Form>

      <p className="text-center text-secondary mt-3 mb-0">
        Already have an account?{" "}
        <Link to={role === "patient" ? "/patient/login" : "/institution/login"}>Log in</Link>
      </p>
    </AuthSplitLayout>
  );
}
