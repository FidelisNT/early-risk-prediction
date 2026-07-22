import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, ShieldPlus, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";

/**
 * Dark sidebar shell for the patient/institution sections. Only lists nav
 * items that map to a real route - no placeholder links for features that
 * don't exist on the backend yet (e.g. Reports, Appointments, Users).
 *
 * On narrow screens this collapses into a top bar with a hamburger button
 * that slides the nav in as an off-canvas drawer (see the
 * `@media (max-width: 768px)` rules in styles/custom.css).
 */
export default function DashboardSidebar({ badgeLabel, links = [] }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  function handleLogout() {
    setIsOpen(false);
    logout();
    navigate("/");
  }

  function handleNavClick() {
    setIsOpen(false);
  }

  const brand = (
    <div className="d-flex align-items-center">
      <span className="brand-mark">
        <ShieldPlus size={18} color="#fff" />
      </span>
      <div className="ms-2">
        <div className="fw-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Vitalis
        </div>
        <div className="text-white-50" style={{ fontSize: "0.7rem" }}>
          {badgeLabel}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile-only top bar: brand + hamburger toggle. Hidden on desktop
          via CSS (see .app-mobile-topbar). */}
      <div className="app-mobile-topbar">
        {brand}
        <button
          type="button"
          className="app-mobile-topbar-toggle"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsOpen((v) => !v)}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Backdrop, only interactive/visible on mobile while the drawer is open */}
      <div
        className={"app-sidebar-backdrop" + (isOpen ? " is-open" : "")}
        onClick={() => setIsOpen(false)}
      />

      <aside className={"app-sidebar" + (isOpen ? " is-open" : "")}>
        <div className="app-sidebar-brand">{brand}</div>

        <nav className="app-sidebar-nav">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  "app-sidebar-link" + (isActive ? " active" : "")
                }
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button type="button" className="app-sidebar-link app-sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}
