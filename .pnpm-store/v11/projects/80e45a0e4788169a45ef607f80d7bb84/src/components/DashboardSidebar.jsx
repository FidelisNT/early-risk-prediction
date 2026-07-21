import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, ShieldPlus } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

/**
 * Dark sidebar shell for the patient/institution sections. Only lists nav
 * items that map to a real route - no placeholder links for features that
 * don't exist on the backend yet (e.g. Reports, Appointments, Users).
 */
export default function DashboardSidebar({ badgeLabel, links = [] }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar-brand">
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

      <nav className="app-sidebar-nav">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
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
  );
}
