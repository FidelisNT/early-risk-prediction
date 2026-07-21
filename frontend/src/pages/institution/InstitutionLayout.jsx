import { Outlet } from "react-router-dom";
import { ClipboardPlus, LayoutDashboard, UserCog } from "lucide-react";
import DashboardSidebar from "../../components/DashboardSidebar.jsx";

const LINKS = [
  { to: "/institution/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/institution/insert-data", label: "Insert Data", icon: ClipboardPlus },
  { to: "/institution/profile", label: "Profile", icon: UserCog },
];

export default function InstitutionLayout() {
  return (
    <div className="app-shell">
      <DashboardSidebar badgeLabel="Health Institution" links={LINKS} />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
