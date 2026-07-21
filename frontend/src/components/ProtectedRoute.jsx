import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingScreen from "./LoadingScreen";

export default function ProtectedRoute({ role, children }) {
  const { session, loadProfile } = useAuth();
  const location = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadProfile(role).finally(() => {
      if (!cancelled) setChecked(true);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  if (!checked || session.status === "loading") {
    return <LoadingScreen label="Checking your session" />;
  }

  if (session.status !== "authenticated" || session.role !== role) {
    return <Navigate to={`/${role}/login`} state={{ from: location }} replace />;
  }

  return children;
}
