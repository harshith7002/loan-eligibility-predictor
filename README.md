# 🏦 Loan Eligibility Predictor

An AI-powered full-stack web app that predicts loan approval instantly.

## Tech Stack
- **ML Model** — XGBoost (84% accuracy, 79% cross-validated)
- **Backend** — FastAPI (Python)
- **Frontend** — React + Vite

## Features
- Real time loan eligibility prediction
- Confidence score with animated bar
- Feature importance breakdown
- Glassmorphism UI with luxury design

## Run Locally
### Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

### Frontend
cd frontend
npm install
npm run dev
