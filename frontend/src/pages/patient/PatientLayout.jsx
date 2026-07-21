import { Outlet } from "react-router-dom";
import { LayoutDashboard, UserCog } from "lucide-react";
import DashboardSidebar from "../../components/DashboardSidebar.jsx";

const LINKS = [
  { to: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/patient/profile", label: "Profile", icon: UserCog },
];

export default function PatientLayout() {
  return (
    <div className="app-shell">
      <DashboardSidebar badgeLabel="Patient Portal" links={LINKS} />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
