import { useCallback, useState } from "react";
import { adminApi, patientApi, institutionApi } from "../api/client.js";
import { AuthContext } from "./authContext.jsx";

const PROFILE_FETCHERS = {
  patient: () => patientApi.getProfile(),
  institution: () => institutionApi.getProfile(),
  // There's no dedicated admin profile endpoint in the API spec, so this
  // list call doubles as the session probe for admins.
  admin: () => adminApi.getPatients(),
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState({
    status: "idle", // idle | loading | authenticated | unauthenticated
    role: null,
    profile: null,
  });

  const loadProfile = useCallback(async (role) => {
    setSession((s) => ({ ...s, status: "loading" }));
    try {
      const res = await PROFILE_FETCHERS[role]();
      const profile = role === "admin" ? null : res.data;
      setSession({ status: "authenticated", role, profile });
      return true;
    } catch (err) {
      setSession({ status: "unauthenticated", role: null, profile: null });
      return false;
    }
  }, []);

  const setAuthenticated = useCallback((role, profile = null) => {
    setSession({ status: "authenticated", role, profile });
  }, []);

  const logout = useCallback(() => {
    // The backend doesn't expose a logout route in the spec; clearing local
    // state is enough for the UI, but you'll want a real /logout endpoint
    // that deletes the session row and clears the cookie server-side.
    setSession({ status: "unauthenticated", role: null, profile: null });
  }, []);

  return (
    <AuthContext.Provider value={{ session, setSession, loadProfile, setAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
