import os
from typing import Any

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

DEFAULT_MODEL_PATH = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "..", "..", "Notebook", "artifacts", "xgboost_loan_model.pkl")
)
MODEL_PATH = os.getenv("MODEL_PATH", DEFAULT_MODEL_PATH)


class ScoreRequest(BaseModel):
    surplus: float
    txnScore: float = Field(ge=1, le=5)
    utilityScore: float = Field(ge=1, le=5)
    rentScore: float = Field(ge=1, le=5)
    insuranceScore: float = Field(ge=1, le=5)
    employmentStability: float = Field(ge=1, le=5)
    avgBalance: float
    balanceMultiplier: float = Field(ge=0, le=2)
    missed30DaysFlag: int = Field(ge=0, le=1)
    shockFlag: int = Field(ge=0, le=1)
    emiFlag: int = Field(ge=0, le=1)


class FeatureContribution(BaseModel):
    feature: str
    value: float


class ScoreResponse(BaseModel):
    riskLabel: str
    riskNorm: float
    eligibleAmount: float
    lowerBound: float
    upperBound: float
    featureContributions: list[FeatureContribution]


def compute_risk_norm(payload: ScoreRequest) -> float:
    return min(
        1.0,
        payload.missed30DaysFlag * 0.30
        + payload.shockFlag * 0.25
        + ((5 - payload.txnScore) / 5) * 0.15
        + ((5 - payload.utilityScore) / 5) * 0.15
        + ((5 - payload.employmentStability) / 5) * 0.10
        + payload.emiFlag * 0.05,
    )


def risk_label(risk_norm: float) -> str:
    if risk_norm < 0.3:
        return "Low"
    if risk_norm < 0.6:
        return "Medium"
    return "High"


def build_feature_row(payload: ScoreRequest) -> dict[str, float]:
    return {
        "Surplus": float(payload.surplus),
        "Txn_Score": float(payload.txnScore),
        "Rent_Score": float(payload.rentScore),
        "Utility_Score": float(payload.utilityScore),
        "Insurance_Score": float(payload.insuranceScore),
        "Missed_30Days_Flag": float(payload.missed30DaysFlag),
        "Shock_Flag": float(payload.shockFlag),
        "EMI_Flag": float(payload.emiFlag),
        "Balance_Multiplier": float(payload.balanceMultiplier),
        "Employment_Stability": float(payload.employmentStability),
        "Risk_norm": compute_risk_norm(payload),
    }


def model_feature_contributions(model: Any, row_df: pd.DataFrame) -> list[FeatureContribution]:
    xgb_model = model.named_steps["xgb"] if hasattr(model, "named_steps") else model
    importances = np.array(getattr(xgb_model, "feature_importances_", []), dtype=float)

    if importances.size == 0 or float(importances.sum()) == 0:
        return []

    raw_prediction = float(model.predict(row_df)[0])
    normalized = importances / importances.sum()

    return [
        FeatureContribution(feature=feature, value=float(weight * raw_prediction))
        for feature, weight in zip(row_df.columns.tolist(), normalized.tolist())
    ]


def load_artifact(path: str) -> dict[str, Any]:
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model file not found: {path}")
    return joblib.load(path)


artifact = load_artifact(MODEL_PATH)
model = artifact["model"]
feature_columns: list[str] = artifact["feature_columns"]
metrics = artifact.get("metrics_holdout", {})
best_params = artifact.get("best_params", {})
trained_at = artifact.get("trained_at")

app = FastAPI(title="CreditAlt Model API", version="1.0.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/model/meta")
def model_meta() -> dict[str, Any]:
    return {
        "model_path": MODEL_PATH,
        "trained_at": trained_at,
        "feature_columns": feature_columns,
        "metrics_holdout": metrics,
        "best_params": best_params,
    }


@app.post("/predict", response_model=ScoreResponse)
def predict(payload: ScoreRequest) -> ScoreResponse:
    try:
        row = build_feature_row(payload)
        row_df = pd.DataFrame([row])[feature_columns]
        raw_prediction = float(model.predict(row_df)[0])

        eligible_amount = max(0.0, min(raw_prediction, 200000.0) - raw_prediction * 0.10)
        lower_bound = eligible_amount * 0.9
        upper_bound = min(eligible_amount * 1.1, 500000.0)

        risk_norm = row["Risk_norm"]
        contributions = model_feature_contributions(model, row_df)

        return ScoreResponse(
            riskLabel=risk_label(risk_norm),
            riskNorm=float(risk_norm),
            eligibleAmount=float(eligible_amount),
            lowerBound=float(lower_bound),
            upperBound=float(upper_bound),
            featureContributions=contributions,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
