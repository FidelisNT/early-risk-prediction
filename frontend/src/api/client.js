import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "";

// withCredentials is required so the httpOnly session cookie set by the
// FastAPI backend is sent on every request. In dev, Vite's proxy (see
// vite.config.js) forwards /admin, /patient, /institution to the API.
const client = axios.create({
  baseURL,
  withCredentials: true,
});

// ---------------- Admin ----------------
export const adminApi = {
  login: (email, password) => client.post("/admin/login", { email, password }),
  getPatients: () => client.get("/admin/patients"),
  getInstitutions: () => client.get("/admin/institution"),
};

// ---------------- Patient ----------------
export const patientApi = {
  signup: (payload) => client.post("/patient/signup", payload),
  login: (email, password) => client.post("/patient/login", { email, password }),
  getProfile: () => client.get("/patient"),
  updateProfile: (payload) => client.put("/patient", payload),
  getLatestPredictions: () => client.get("/patient/prediction"),
  getAllPredictions: () => client.get("/patient/predictions"),
  getHealthData: (disease) => client.get(`/patient/health_data/${disease}`),
};

// ---------------- Institution ----------------
export const institutionApi = {
  signup: (payload) => client.post("/institution/signup", payload),
  login: (email, password) => client.post("/institution/login", { email, password }),
  getProfile: () => client.get("/institution"),
  updateProfile: (payload) => client.put("/institution", payload),
  getPredictions: () => client.get("/institution/predictions"),
  getHealthData: (disease) => client.get(`/institution/health_data/${disease}`),
  postHealthData: (disease, payload) =>
    client.post(`/institution/health_data/${disease}`, payload),
  searchPatients: (search) =>
    client.get("/institution/patients", { params: search ? { search } : {} }),
};

export const DISEASES = ["heart", "kidney", "stroke", "diabetes"];

export const DISEASE_LABELS = {
  heart: "Heart Disease",
  kidney: "Kidney Disease",
  stroke: "Stroke",
  diabetes: "Diabetes",
};

export default client;
