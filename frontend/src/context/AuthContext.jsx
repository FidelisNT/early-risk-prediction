import { createContext } from "react";

// Shape: { status: "idle"|"loading"|"authenticated"|"unauthenticated", role, profile }
// Split into its own file (rather than living in AuthProvider.jsx) so that
// file only exports the AuthProvider component - mixing a component export
// with a non-component export in the same file breaks Vite Fast Refresh.
export const AuthContext = createContext(null);
