import { Link } from "react-router-dom";
import { ShieldPlus } from "lucide-react";

/**
 * Full-bleed split-screen layout used for login/signup pages.
 * Left: branded panel with a badge label, headline, and description.
 * Right: whatever form content is passed as children, vertically centered
 * in a max-width column.
 */
export default function AuthSplitLayout({ badgeLabel, headline, description, children }) {
  return (
    <div className="auth-split">
      <div className="auth-split-brand">
        <div className="auth-split-brand-inner">
          <div className="d-flex align-items-center mb-5">
            <span className="brand-mark">
              <ShieldPlus size={18} color="#fff" />
            </span>
            <div className="ms-2">
              <div className="fw-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Vitalis
              </div>
              <div className="text-white-50" style={{ fontSize: "0.75rem" }}>
                {badgeLabel}
              </div>
            </div>
          </div>
          <h2 className="text-white mb-3">{headline}</h2>
          <p className="text-white-50 mb-0">{description}</p>
        </div>
        <div className="auth-split-circle auth-split-circle-1" />
        <div className="auth-split-circle auth-split-circle-2" />
      </div>

      <div className="auth-split-content">
        <div className="auth-split-content-inner">
          <Link to="/" className="small text-secondary d-inline-block mb-4">
            &larr; Back to Vitalis
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
