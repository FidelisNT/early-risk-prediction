export default function StatusPill({ isPositive }) {
  return (
    <span className={`status-pill ${isPositive ? "is-positive" : "is-negative"}`}>
      {isPositive ? "Positive" : "Negative"}
    </span>
  );
}
