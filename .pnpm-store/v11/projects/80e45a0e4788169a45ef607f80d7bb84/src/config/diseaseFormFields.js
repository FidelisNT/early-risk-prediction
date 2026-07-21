/**
 * Field definitions for the institution "insert data" form, one array per
 * disease. Field `key`s match the backend's FEATURE_ORDER for that disease
 * (see app/ml/predictor.py) - case doesn't have to match exactly since the
 * backend matches field names case-insensitively, but keeping it aligned
 * avoids confusion.
 *
 * IMPORTANT - encoding assumptions: for categorical fields (Sex, Chest Pain
 * Type, Slope, Thalassemia, Gender, Work Type, etc.) the `value` on each
 * option is a guess at the numeric code the model was actually trained on
 * (based on common conventions for these standard datasets - UCI heart
 * disease, Pima diabetes, UCI chronic kidney disease, Kaggle stroke
 * prediction). If your model's training pipeline used a different
 * LabelEncoder order, these codes will be silently wrong - the prediction
 * will still run, it just won't mean what you think it means. Please
 * verify each mapping against your actual training code before trusting
 * results, and adjust the `value`s below to match.
 */

export const DISEASE_FORM_FIELDS = {
  heart: [
    { key: "Age", label: "Age", type: "number", min: 0, max: 120 },
    {
      key: "Sex",
      label: "Sex",
      type: "select",
      options: [
        { value: 1, label: "Male" },
        { value: 0, label: "Female" },
      ],
    },
    {
      key: "Cp",
      label: "Chest Pain Type",
      type: "select",
      options: [
        { value: 1, label: "Typical Angina" },
        { value: 2, label: "Atypical Angina" },
        { value: 3, label: "Non-anginal Pain" },
        { value: 4, label: "Asymptomatic" },
      ],
    },
    { key: "Trestbps", label: "Resting Blood Pressure", unit: "mm Hg", type: "number", min: 0 },
    { key: "Chol", label: "Serum Cholesterol", unit: "mg/dl", type: "number", min: 0 },
    {
      key: "Fbs",
      label: "Fasting Blood Sugar > 120 mg/dl",
      type: "select",
      options: [
        { value: 1, label: "Yes" },
        { value: 0, label: "No" },
      ],
    },
    {
      key: "Restecg",
      label: "Resting ECG Results",
      type: "select",
      options: [
        { value: 0, label: "Normal" },
        { value: 1, label: "ST-T Abnormality" },
        { value: 2, label: "LV Hypertrophy" },
      ],
    },
    { key: "Thalach", label: "Max Heart Rate Achieved", type: "number", min: 0 },
    {
      key: "Exang",
      label: "Exercise-Induced Angina",
      type: "select",
      options: [
        { value: 1, label: "Yes" },
        { value: 0, label: "No" },
      ],
    },
    { key: "Oldpeak", label: "ST Depression", unit: "oldpeak", type: "number", step: 0.1 },
    {
      key: "Slope",
      label: "Slope of Peak ST Segment",
      type: "select",
      options: [
        { value: 1, label: "Upsloping" },
        { value: 2, label: "Flat" },
        { value: 3, label: "Downsloping" },
      ],
    },
    { key: "Ca", label: "Number of Major Vessels", unit: "0-3", type: "number", min: 0, max: 3 },
    {
      key: "Thal",
      label: "Thalassemia",
      type: "select",
      options: [
        { value: 3, label: "Normal" },
        { value: 6, label: "Fixed Defect" },
        { value: 7, label: "Reversible Defect" },
      ],
    },
  ],

  diabetes: [
    { key: "Pregnancies", label: "Pregnancies", type: "number", min: 0 },
    { key: "Glucose", label: "Glucose", unit: "mg/dl", type: "number", min: 0 },
    { key: "BloodPressure", label: "Blood Pressure", unit: "mm Hg", type: "number", min: 0 },
    { key: "SkinThickness", label: "Skin Thickness", unit: "mm", type: "number", min: 0 },
    { key: "Insulin", label: "Insulin", unit: "mu U/ml", type: "number", min: 0 },
    { key: "BMI", label: "BMI", type: "number", step: 0.1, min: 0 },
    {
      key: "DiabetesPedigreeFunction",
      label: "Diabetes Pedigree Function",
      type: "number",
      step: 0.01,
      min: 0,
    },
    { key: "Age", label: "Age", type: "number", min: 0, max: 120 },
  ],

  kidney: [
    { key: "Bp", label: "Blood Pressure", unit: "mm Hg", type: "number", min: 0 },
    {
      key: "Sg",
      label: "Specific Gravity",
      type: "select",
      options: [
        { value: 1.005, label: "1.005" },
        { value: 1.01, label: "1.010" },
        { value: 1.015, label: "1.015" },
        { value: 1.02, label: "1.020" },
        { value: 1.025, label: "1.025" },
      ],
    },
    { key: "Al", label: "Albumin", unit: "0-5", type: "number", min: 0, max: 5 },
    { key: "Su", label: "Sugar", unit: "0-5", type: "number", min: 0, max: 5 },
    {
      key: "Rbc",
      label: "Red Blood Cells",
      type: "select",
      options: [
        { value: 1, label: "Normal" },
        { value: 0, label: "Abnormal" },
      ],
    },
    { key: "Bu", label: "Blood Urea", unit: "mg/dl", type: "number", min: 0 },
    { key: "Sc", label: "Serum Creatinine", unit: "mg/dl", type: "number", step: 0.1, min: 0 },
    { key: "Sod", label: "Sodium", unit: "mEq/L", type: "number" },
    { key: "Pot", label: "Potassium", unit: "mEq/L", type: "number", step: 0.1 },
    { key: "Hemo", label: "Hemoglobin", unit: "g/dl", type: "number", step: 0.1 },
    { key: "Wbcc", label: "White Blood Cell Count", unit: "cells/cumm", type: "number" },
    { key: "Rbcc", label: "Red Blood Cell Count", unit: "millions/cmm", type: "number", step: 0.1 },
    {
      key: "Htn",
      label: "Hypertension",
      type: "select",
      options: [
        { value: 1, label: "Yes" },
        { value: 0, label: "No" },
      ],
    },
  ],

  stroke: [
    // 'Id' is deliberately not shown here - it's a dataset row identifier
    // in the original stroke dataset, not a clinical input. The insert-data
    // page auto-fills it with the selected patient's id before submitting.
    {
      key: "Gender",
      label: "Gender",
      type: "select",
      options: [
        { value: 1, label: "Male" },
        { value: 0, label: "Female" },
      ],
    },
    { key: "Age", label: "Age", type: "number", min: 0, max: 120 },
    {
      key: "Hypertension",
      label: "Hypertension",
      type: "select",
      options: [
        { value: 1, label: "Yes" },
        { value: 0, label: "No" },
      ],
    },
    {
      key: "HeartDisease",
      label: "Heart Disease",
      type: "select",
      options: [
        { value: 1, label: "Yes" },
        { value: 0, label: "No" },
      ],
    },
    {
      key: "EverMarried",
      label: "Ever Married",
      type: "select",
      options: [
        { value: 1, label: "Yes" },
        { value: 0, label: "No" },
      ],
    },
    {
      key: "WorkType",
      label: "Work Type",
      type: "select",
      options: [
        { value: "Private", label: "Private" },
        { value: "Self-employed", label: "Self-employed" },
        { value: "Govt_job", label: "Government Job" },
        { value: "children", label: "Children" },
        { value: "Never_worked", label: "Never Worked" },
      ],
    },
    {
      key: "ResidenceType",
      label: "Residence Type",
      type: "select",
      options: [
        { value: "Urban", label: "Urban" },
        { value: "Rural", label: "Rural" },
      ],
    },
    { key: "AvgGlucoseLevel", label: "Average Glucose Level", unit: "mg/dl", type: "number", step: 0.1 },
    { key: "Bmi", label: "BMI", type: "number", step: 0.1, min: 0 },
    {
      key: "SmokingStatus",
      label: "Smoking Status",
      type: "select",
      options: [
        { value: "Never smoked", label: "Never Smoked" },
        { value: "formerly smoked", label: "Formerly Smoked" },
        { value: "smokes", label: "Smokes" },
        { value: "Unknown", label: "Unknown" },
      ],
    },
  ],
};

export const DISEASE_FORM_TITLES = {
  heart: "Heart Disease Prediction",
  kidney: "Kidney Disease Prediction",
  stroke: "Stroke Prediction",
  diabetes: "Diabetes Prediction",
};

export const DISEASE_FORM_DESCRIPTIONS = {
  heart: "Enter the patient's clinical parameters to generate a cardiovascular risk assessment.",
  kidney: "Enter the patient's clinical parameters to generate a kidney disease risk assessment.",
  stroke: "Enter the patient's clinical parameters to generate a stroke risk assessment.",
  diabetes: "Enter the patient's clinical parameters to generate a diabetes risk assessment.",
};

export function buildInitialValues(disease) {
  const values = {};
  DISEASE_FORM_FIELDS[disease].forEach((field) => {
    values[field.key] = field.type === "select" ? field.options[0].value : "";
  });
  return values;
}
