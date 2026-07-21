import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Card, Col, Form, Nav, Row } from "react-bootstrap";
import { Heart } from "lucide-react";
import { DISEASES, DISEASE_LABELS, institutionApi } from "../../api/client.js";
import {
  DISEASE_FORM_FIELDS,
  DISEASE_FORM_TITLES,
  DISEASE_FORM_DESCRIPTIONS,
  buildInitialValues,
} from "../../config/diseaseFormFields.js";
import PatientSearchSelect from "../../components/PatientSearchSelect.jsx";
import DiseaseIcon from "../../components/DiseaseIcon.jsx";
import StatusPill from "../../components/StatusPill.jsx";

export default function InstitutionInsertData() {
  const [disease, setDisease] = useState(DISEASES[0]);
  const [valuesByDisease, setValuesByDisease] = useState(() => {
    const init = {};
    DISEASES.forEach((d) => {
      init[d] = buildInitialValues(d);
    });
    return init;
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const fields = DISEASE_FORM_FIELDS[disease];
  const values = valuesByDisease[disease];

  function setFieldValue(key, value) {
    setValuesByDisease((prev) => ({
      ...prev,
      [disease]: { ...prev[disease], [key]: value },
    }));
  }

  function handleClearForm() {
    setValuesByDisease((prev) => ({ ...prev, [disease]: buildInitialValues(disease) }));
    setResult(null);
    setError("");
  }

  function handleDiseaseChange(d) {
    setDisease(d);
    setResult(null);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!selectedPatient) {
      setError("Please search for and select a patient first.");
      return;
    }

    const data = { ...values };
    // 'Id' isn't a clinical field for stroke - the original dataset used it
    // as a row identifier. We stand in the patient's own id so the model
    // gets *something* for that column without asking staff to enter a
    // meaningless number by hand.
    if (disease === "stroke") {
      data.Id = selectedPatient.id;
    }

    setSubmitting(true);
    try {
      const res = await institutionApi.postHealthData(disease, {
        patient_id: selectedPatient.id,
        data,
      });
      setResult(res.data.prediction);
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't run this prediction. Please check the fields.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Row className="justify-content-center">
      <Col xl={10}>
        <p className="text-secondary small mb-1">
          <Link to="/institution/dashboard" className="text-secondary text-decoration-none">
            Predictions
          </Link>{" "}
          &gt; <span className="text-primary fw-medium">{DISEASE_FORM_TITLES[disease]}</span>
        </p>
        <h2 className="mb-1">{DISEASE_FORM_TITLES[disease]}</h2>
        <p className="text-secondary mb-4">{DISEASE_FORM_DESCRIPTIONS[disease]}</p>

        <Row className="g-3 mb-4">
          <Col md={7}>
            <Form.Label className="small fw-medium">Patient</Form.Label>
            <PatientSearchSelect selectedPatient={selectedPatient} onSelect={setSelectedPatient} />
          </Col>
          <Col md={5}>
            <Form.Label className="small fw-medium">Disease</Form.Label>
            <Nav variant="pills" className="gap-2 flex-wrap">
              {DISEASES.map((d) => (
                <Nav.Item key={d}>
                  <Nav.Link
                    active={disease === d}
                    onClick={() => handleDiseaseChange(d)}
                    className="d-flex align-items-center gap-2"
                  >
                    <DiseaseIcon disease={d} size={16} />
                    {DISEASE_LABELS[d]}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </Col>
        </Row>

        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center gap-2 mb-4">
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(228,87,46,0.12)",
                  color: "var(--vitalis-coral)",
                }}
              >
                <Heart size={16} />
              </div>
              <h5 className="mb-0">Patient Clinical Parameters</h5>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                {fields.map((field) => (
                  <Col md={4} key={field.key}>
                    <Form.Group controlId={`field-${disease}-${field.key}`}>
                      <Form.Label className="small fw-medium">
                        {field.label}
                        {field.unit && (
                          <span className="text-secondary fw-normal"> ({field.unit})</span>
                        )}
                      </Form.Label>
                      {field.type === "select" ? (
                        <Form.Select
                          value={values[field.key]}
                          onChange={(e) => setFieldValue(field.key, Number(e.target.value))}
                        >
                          {field.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </Form.Select>
                      ) : (
                        <Form.Control
                          type="number"
                          step={field.step || 1}
                          min={field.min}
                          max={field.max}
                          required
                          value={values[field.key]}
                          onChange={(e) => setFieldValue(field.key, e.target.value)}
                        />
                      )}
                    </Form.Group>
                  </Col>
                ))}
              </Row>

              <hr className="my-4" />

              <div className="d-flex justify-content-end gap-2">
                <Button variant="outline-secondary" type="button" onClick={handleClearForm}>
                  Clear Form
                </Button>
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? "Predicting…" : "Predict Risk"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        {result && (
          <Card className="border-0 shadow-sm mt-4">
            <Card.Body className="p-4 d-flex align-items-center gap-4 flex-wrap">
              <div>
                <p className="section-eyebrow mb-1">Result</p>
                <div className="d-flex align-items-center gap-2">
                  <StatusPill isPositive={result.prediction} />
                  <span className="font-mono fs-5">{result.percentage.toFixed(1)}%</span>
                </div>
              </div>
              {result.risk_level && (
                <div>
                  <p className="section-eyebrow mb-1">Risk Level</p>
                  <span className="fw-medium text-capitalize">{result.risk_level}</span>
                </div>
              )}
              <div className="ms-md-auto">
                <Button as={Link} to="/institution/dashboard" variant="outline-primary" size="sm">
                  Back to dashboard
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}
      </Col>
    </Row>
  );
}
