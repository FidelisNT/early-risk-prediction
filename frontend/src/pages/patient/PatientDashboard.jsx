import { useEffect, useState } from "react";
import { Alert, Card, Col, Nav, Row, Table } from "react-bootstrap";
import { DISEASES, DISEASE_LABELS, patientApi } from "../../api/client.js";
import RiskGauge from "../../components/RiskGauge.jsx";
import StatusPill from "../../components/StatusPill.jsx";
import DiseaseIcon from "../../components/DiseaseIcon.jsx";
import LoadingScreen from "../../components/LoadingScreen.js";
import { getTimeGreeting } from "../../utils/greeting.js";

export default function PatientDashboard() {
  const [profile, setProfile] = useState(null);
  const [latest, setLatest] = useState([]);
  const [allPredictions, setAllPredictions] = useState([]);
  const [healthData, setHealthData] = useState({});
  const [activeDisease, setActiveDisease] = useState(DISEASES[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [profileRes, latestRes, allRes, ...healthResArr] = await Promise.all([
          patientApi.getProfile(),
          patientApi.getLatestPredictions(),
          patientApi.getAllPredictions(),
          ...DISEASES.map((d) => patientApi.getHealthData(d)),
        ]);
        setProfile(profileRes.data);
        setLatest(latestRes.data);
        setAllPredictions(allRes.data);
        const healthMap = {};
        DISEASES.forEach((d, i) => {
          healthMap[d] = healthResArr[i].data;
        });
        setHealthData(healthMap);
      } catch (err) {
        setError("Couldn't load your dashboard data. Please try again shortly.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingScreen label="Loading your dashboard" />;

  const activeRows = healthData[activeDisease] || [];
  const activeColumns =
    activeRows.length > 0
      ? Object.keys(activeRows[0]).filter((k) => k !== "created_at")
      : [];
  const firstName = profile?.user_name?.split(" ")[0];

  return (
    <>
      <div className="mb-4">
        <h2 className="mb-1">
          {getTimeGreeting()}
          {firstName ? `, ${firstName}` : ""}
        </h2>
        <p className="text-secondary mb-0">
          Here's your latest health prediction record.
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Container 1: latest prediction per disease, as gauges */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h5" className="mb-4">
            Latest predictions
          </Card.Title>
          {latest.length === 0 ? (
            <p className="text-secondary mb-0">
              No predictions on file yet. Once a care institution submits your health
              data, results will appear here.
            </p>
          ) : (
            <Row className="g-4">
              {latest.map((p) => (
                <Col key={p.disease} xs={6} md={3} className="text-center">
                  <RiskGauge
                    label={DISEASE_LABELS[p.disease] || p.disease}
                    percentage={p.percentage}
                    isPositive={p.prediction}
                  />
                  <div className="mt-2">
                    <StatusPill isPositive={p.prediction} />
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Container 2: all predictions table */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h5" className="mb-3">
            Prediction history
          </Card.Title>
          {allPredictions.length === 0 ? (
            <p className="text-secondary mb-0">No prediction history yet.</p>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead>
                  <tr className="text-secondary small text-uppercase">
                    <th>Disease</th>
                    <th>Result</th>
                    <th className="font-mono">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {allPredictions.map((p, idx) => (
                    <tr key={idx}>
                      <td className="d-flex align-items-center gap-2">
                        <DiseaseIcon disease={p.disease} />
                        {DISEASE_LABELS[p.disease] || p.disease}
                      </td>
                      <td>
                        <StatusPill isPositive={p.prediction} />
                      </td>
                      <td className="font-mono">{p.percentage.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Container 3: per-disease health data tables */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Card.Title as="h5" className="mb-3">
            Submitted health data
          </Card.Title>
          <Nav variant="pills" className="mb-3 gap-2">
            {DISEASES.map((d) => (
              <Nav.Item key={d}>
                <Nav.Link
                  active={activeDisease === d}
                  onClick={() => setActiveDisease(d)}
                  className="d-flex align-items-center gap-2"
                >
                  <DiseaseIcon disease={d} size={16} />
                  {DISEASE_LABELS[d]}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>

          {activeRows.length === 0 ? (
            <p className="text-secondary mb-0">
              No {DISEASE_LABELS[activeDisease].toLowerCase()} health data submitted yet.
            </p>
          ) : (
            <div className="table-responsive">
              <Table hover size="sm" className="align-middle mb-0">
                <thead>
                  <tr className="text-secondary small text-uppercase">
                    <th>Recorded</th>
                    {activeColumns.map((col) => (
                      <th key={col} className="text-capitalize">
                        {col.replaceAll("_", " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeRows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="font-mono small">
                        {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}
                      </td>
                      {activeColumns.map((col) => (
                        <td key={col}>{String(row[col] ?? "—")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
}
