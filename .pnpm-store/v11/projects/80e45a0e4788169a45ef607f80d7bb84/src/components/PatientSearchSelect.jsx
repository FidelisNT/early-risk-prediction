import { useEffect, useRef, useState } from "react";
import { Form, Spinner } from "react-bootstrap";
import { Search, User, X } from "lucide-react";
import { institutionApi } from "../api/client";

export default function PatientSearchSelect({ selectedPatient, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await institutionApi.searchPatients(query.trim());
        setResults(res.data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  if (selectedPatient) {
    return (
      <div className="d-flex align-items-center gap-2 border rounded-3 px-3 py-2 bg-white">
        <User size={16} className="text-secondary" />
        <div className="flex-grow-1">
          <div className="fw-medium">{selectedPatient.full_name}</div>
          <div className="text-secondary small">{selectedPatient.email}</div>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
          onClick={() => onSelect(null)}
        >
          <X size={14} />
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="position-relative">
      <div className="position-relative">
        <Search
          size={16}
          className="text-secondary position-absolute"
          style={{ left: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
        />
        <Form.Control
          style={{ paddingLeft: "2.25rem" }}
          placeholder="Search patient by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {loading && (
          <Spinner
            size="sm"
            animation="border"
            className="position-absolute"
            style={{ right: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
          />
        )}
      </div>

      {open && query.trim() && (
        <div
          className="position-absolute w-100 bg-white border rounded-3 shadow-sm mt-1"
          style={{ zIndex: 20, maxHeight: 240, overflowY: "auto" }}
        >
          {results.length === 0 && !loading && (
            <div className="px-3 py-2 text-secondary small">No patients found.</div>
          )}
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              className="d-flex flex-column w-100 text-start border-0 bg-transparent px-3 py-2"
              style={{ cursor: "pointer" }}
              onMouseDown={() => {
                onSelect(p);
                setQuery("");
                setOpen(false);
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "var(--vitalis-sky)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span className="fw-medium">{p.full_name}</span>
              <span className="text-secondary small">{p.email}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
