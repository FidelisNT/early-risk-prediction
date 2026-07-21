import { useEffect, useState } from "react";
import { Alert, Badge, Card, Table } from "react-bootstrap";
import { adminApi } from "../../api/client.js";
import LoadingScreen from "../../components/LoadingScreen.jsx";

export default function AdminInstitutions() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .getInstitutions()
      .then((res) => setInstitutions(res.data))
      .catch(() => setError("Couldn't load institutions."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen label="Loading institutions" />;

  return (
    <>
      <div className="mb-4">
        <p className="section-eyebrow mb-1">Admin</p>
        <h2 className="mb-0">Institutions</h2>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          {institutions.length === 0 ? (
            <p className="text-secondary mb-0">No institutions registered yet.</p>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead>
                  <tr className="text-secondary small text-uppercase">
                    <th>Name</th>
                    <th>Email</th>
                    <th>License #</th>
                    <th>Address</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Last login</th>
                  </tr>
                </thead>
                <tbody>
                  {institutions.map((inst, idx) => (
                    <tr key={idx}>
                      <td className="fw-medium">{inst.name}</td>
                      <td>{inst.email}</td>
                      <td className="font-mono">{inst.license_number}</td>
                      <td>{inst.address || "—"}</td>
                      <td className="font-mono small">
                        {new Date(inst.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <Badge bg={inst.is_active ? "success" : "secondary"}>
                          {inst.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="font-mono small">
                        {inst.last_login ? new Date(inst.last_login).toLocaleString() : "Never"}
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
