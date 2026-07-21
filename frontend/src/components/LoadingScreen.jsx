import { Spinner } from "react-bootstrap";

export default function LoadingScreen({ label = "Loading" }) {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-center"
      style={{ minHeight: "60vh" }}
    >
      <Spinner animation="border" role="status" style={{ color: "var(--vitalis-blue)" }} />
      <p className="mt-3 text-secondary section-eyebrow">{label}&hellip;</p>
    </div>
  );
}
