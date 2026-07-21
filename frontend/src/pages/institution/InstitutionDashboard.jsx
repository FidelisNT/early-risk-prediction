import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Card, Col, Nav, Row, Table } from "react-bootstrap";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { AlertTriangle, PlusCircle, Stethoscope, Users } from "lucide-react";
import { DISEASES, DISEASE_LABELS, institutionApi } from "../../api/client";
import StatusPill from "../../components/StatusPill";
import DiseaseIcon from "../../components/DiseaseIcon";
import LoadingScreen from "../../components/LoadingScreen";
import { getTimeGreeting } from "../../utils/greeting";

const RISK_COLORS = {
  low: "var(--vitalis-teal)",
  moderate: "var(--vitalis-amber)",
  high: "var(--vitalis-coral)",
  critical: "var(--vitalis-coral)",
};

function buildLast7DaysSeries(predictions) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days.map((day) => {
    const label = day.toLocaleDateString(undefined, { weekday: "short" });
    const count = predictions.filter((p) => {
      if (!p.created_at) return false;
      const created = new Date(p.created_at);
      return (
        created.getFullYear() === day.getFullYear() &&
        created.getMonth() === day.getMonth() &&
        created.getDate() === day.getDate()
      );
    }).length;
    return { label, count };
  });
}

function buildRiskBreakdown(predictions) {
  // Predictions without a risk_level (older rows, or a model that didn't
  // return one) fall back to a simple positive/negative split so they
  // still show up somewhere rather than vanishing from the chart.
  const buckets = { low: 0, moderate: 0, high: 0 };
  predictions.forEach((p) => {
    const level = p.risk_level === "critical" ? "high" : p.risk_level;
    if (level && buckets[level] !== undefined) {
      buckets[level] += 1;
    } else {
      buckets[p.prediction ? "high" : "low"] += 1;
    }
  });
  return Object.entries(buckets)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));
}

export default function InstitutionDashboard() {
  const [profile, setProfile] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [healthData, setHealthData] = useState({});
  const [activeDisease, setActiveDisease] = useState(DISEASES[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [profileRes, predRes, ...healthResArr] = await Promise.all([
          institutionApi.getProfile(),
          institutionApi.getPredictions(),
          ...DISEASES.map((d) => institutionApi.getHealthData(d)),
        ]);
        setProfile(profileRes.data);
        setPredictions(predRes.data);
        const healthMap = {};
        DISEASES.forEach((d, i) => {
          healthMap[d] = healthResArr[i].data;
        });
        setHealthData(healthMap);
      } catch (err) {
        setError("Couldn't load the dashboard. Please try again shortly.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = useMemo(() => {
    const healthRows = Object.values(healthData).flat();
    const distinctPatients = new Set(healthRows.map((r) => r.patient_id));
    const highRisk = predictions.filter(
      (p) => p.risk_level === "high" || p.risk_level === "critical" || (!p.risk_level && p.prediction)
    ).length;
    return {
      totalPatients: distinctPatients.size,
      predictionsRun: predictions.length,
      highRisk,
      healthRecords: healthRows.length,
    };
  }, [healthData, predictions]);

  const weeklySeries = useMemo(() => buildLast7DaysSeries(predictions), [predictions]);
  const riskBreakdown = useMemo(() => buildRiskBreakdown(predictions), [predictions]);

  if (loading) return <LoadingScreen label="Loading dashboard" />;

  const activeRows = healthData[activeDisease] || [];
  const activeColumns =
    activeRows.length > 0
      ? Object.keys(activeRows[0]).filter((k) => k !== "created_at" && k !== "patient_id")
      : [];

  return (
    <>
      <div className="mb-4">
        <h2 className="mb-1">
          {getTimeGreeting()}
          {profile?.institution_name ? `, ${profile.institution_name}` : ""}
        </h2>
        <p className="text-secondary mb-0">
          Here's what's happening across your submissions today.
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Stat cards - all computed from real submitted data, nothing fabricated */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon" style={{ background: "var(--vitalis-sky)", color: "var(--vitalis-navy)" }}>
              <Users size={20} />
            </div>
            <p className="section-eyebrow mb-1">Patients Tracked</p>
            <h3 className="font-mono mb-0">{stats.totalPatients}</h3>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon" style={{ background: "rgba(27,153,139,0.12)", color: "var(--vitalis-teal)" }}>
              <Stethoscope size={20} />
            </div>
            <p className="section-eyebrow mb-1">Predictions Run</p>
            <h3 className="font-mono mb-0">{stats.predictionsRun}</h3>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon" style={{ background: "rgba(228,87,46,0.12)", color: "var(--vitalis-coral)" }}>
              <AlertTriangle size={20} />
            </div>
            <p className="section-eyebrow mb-1">High-Risk Patients</p>
            <h3 className="font-mono mb-0">{stats.highRisk}</h3>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon" style={{ background: "rgba(47,111,237,0.12)", color: "var(--vitalis-blue)" }}>
              <PlusCircle size={20} />
            </div>
            <p className="section-eyebrow mb-1">Health Records Submitted</p>
            <h3 className="font-mono mb-0">{stats.healthRecords}</h3>
          </div>
        </Col>
      </Row>

      {/* Charts - both derived client-side from real prediction data */}
      <Row className="g-3 mb-4">
        <Col lg={7}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <Card.Title as="h6" className="mb-3">
                Predictions Run — Last 7 Days
              </Card.Title>
              {predictions.length === 0 ? (
                <p className="text-secondary mb-0">No predictions yet this week.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={weeklySeries}>
                    <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--vitalis-blue)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <Card.Title as="h6" className="mb-3">
                Patient Risk Breakdown
              </Card.Title>
              {riskBreakdown.length === 0 ? (
                <p className="text-secondary mb-0">No predictions yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={riskBreakdown}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {riskBreakdown.map((entry) => (
                        <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Legend
                      formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Section 1: predictions */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h5" className="mb-3">
            Past predictions
          </Card.Title>
          {predictions.length === 0 ? (
            <p className="text-secondary mb-0">No predictions recorded yet.</p>
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
                  {predictions.map((p, idx) => (
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

      {/* Section 2: health data entered by this institution */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Card.Title as="h5" className="mb-3">
            Health data you've submitted
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
            <p className="text-secondary">
              No {DISEASE_LABELS[activeDisease].toLowerCase()} data submitted yet.
            </p>
          ) : (
            <div className="table-responsive mb-3">
              <Table hover size="sm" className="align-middle mb-0">
                <thead>
                  <tr className="text-secondary small text-uppercase">
                    <th>Patient ID</th>
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
                      <td className="font-mono">{row.patient_id}</td>
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

          <Button as={Link} to="/institution/insert-data" variant="primary" className="d-inline-flex align-items-center gap-2">
            <PlusCircle size={18} />
            Insert data
          </Button>
        </Card.Body>
      </Card>
    </>
  );
}
