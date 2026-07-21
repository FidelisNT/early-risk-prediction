import { useEffect, useState } from "react";
import { Alert, Badge, Card, Table } from "react-bootstrap";
import { adminApi } from "../../api/client";
import LoadingScreen from "../../components/LoadingScreen";

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .getPatients()
      .then((res) => setPatients(res.data))
      .catch(() => setError("Couldn't load patients."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen label="Loading patients" />;

  return (
    <>
      <div className="mb-4">
        <p className="section-eyebrow mb-1">Admin</p>
        <h2 className="mb-0">Patients</h2>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          {patients.length === 0 ? (
            <p className="text-secondary mb-0">No patients registered yet.</p>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead>
                  <tr className="text-secondary small text-uppercase">
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Last login</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p, idx) => (
                    <tr key={idx}>
                      <td className="fw-medium">{p.name}</td>
                      <td>{p.email}</td>
                      <td>{p.phone_number || "—"}</td>
                      <td className="font-mono small">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <Badge bg={p.is_active ? "success" : "secondary"}>
                          {p.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="font-mono small">
                        {p.last_login ? new Date(p.last_login).toLocaleString() : "Never"}
                      </td>
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
