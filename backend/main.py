from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
import os

# ── Initialize FastAPI app ──────────────────────────────────────────────
app = FastAPI(title="Loan Eligibility Predictor API", version="1.0.0")

# ── Allow React frontend to talk to this backend ────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite + CRA ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load the trained model and feature names ────────────────────────────
# Make sure model.pkl and feature_names.pkl are in the same folder as main.py
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
FEATURES_PATH = os.path.join(os.path.dirname(__file__), "feature_names.pkl")

try:
    model = joblib.load(MODEL_PATH)
    feature_names = joblib.load(FEATURES_PATH)
    print(f"✅ Model loaded. Features: {feature_names}")
except FileNotFoundError as e:
    print(f"❌ Could not load model: {e}")
    print("Make sure model.pkl and feature_names.pkl are in the backend/ folder")
    model = None
    feature_names = []

# ── Input schema — exactly what the React form will send ───────────────
class LoanApplication(BaseModel):
    Gender: str           # "Male" or "Female"
    Married: str          # "Yes" or "No"
    Dependents: str       # "0", "1", "2", "3+"
    Education: str        # "Graduate" or "Not Graduate"
    Self_Employed: str    # "Yes" or "No"
    ApplicantIncome: float
    CoapplicantIncome: float
    LoanAmount: float
    Loan_Amount_Term: float
    Credit_History: float  # 1.0 = good history, 0.0 = bad
    Property_Area: str    # "Urban", "Semiurban", "Rural"

# ── Health check endpoint ───────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Loan Predictor API is running!", "model_loaded": model is not None}

# ── Main prediction endpoint ────────────────────────────────────────────
@app.post("/predict")
def predict(application: LoanApplication):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded. Check server logs.")

    # Step 1: Build a DataFrame from the input (same structure as training)
    raw = {
        "Gender": [application.Gender],
        "Married": [application.Married],
        "Dependents": [str(application.Dependents)],
        "Education": [application.Education],
        "Self_Employed": [application.Self_Employed],
        "ApplicantIncome": [application.ApplicantIncome],
        "CoapplicantIncome": [application.CoapplicantIncome],
        "LoanAmount": [application.LoanAmount],
        "Loan_Amount_Term": [application.Loan_Amount_Term],
        "Credit_History": [application.Credit_History],
        "Property_Area": [application.Property_Area],
    }
    df = pd.DataFrame(raw)

    # Step 2: Feature engineering — MUST match train.py exactly
    df["Total_Income"] = df["ApplicantIncome"] + df["CoapplicantIncome"]
    df["EMI"] = df["LoanAmount"] / df["Loan_Amount_Term"]
    df["Income_to_Loan"] = df["Total_Income"] / df["LoanAmount"]
    df["LoanAmount_log"] = np.log1p(df["LoanAmount"])
    df["Total_Income_log"] = np.log1p(df["Total_Income"])

    # Step 3: One-hot encode — same as pd.get_dummies(drop_first=True) in training
    df = pd.get_dummies(df)

    # Step 4: Align columns to match training features (fill missing cols with 0)
    df = df.reindex(columns=feature_names, fill_value=0)

    # Step 5: Predict
    prediction = model.predict(df)[0]
    probability = model.predict_proba(df)[0]

    approved = bool(prediction == 1)
    confidence = float(probability[1] if approved else probability[0]) * 100

    return {
        "approved": approved,
        "result": "Approved ✅" if approved else "Rejected ❌",
        "confidence": round(confidence, 1),
        "message": (
            "Congratulations! Your loan application is likely to be approved."
            if approved else
            "Based on the provided details, your loan application may not be approved. "
            "Consider improving your credit history or reducing the loan amount."
        )
    }
