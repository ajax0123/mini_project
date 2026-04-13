import os

import pandas as pd
import requests
import streamlit as st

FASTAPI_URL = os.getenv("FASTAPI_URL", "http://127.0.0.1:8000")

st.set_page_config(page_title="CreditAlt XGBoost Scoring", layout="wide")
st.title("CreditAlt Loan Eligibility - XGBoost")

with st.sidebar:
    st.header("Service")
    st.write(f"API: {FASTAPI_URL}")
    if st.button("Check API Health"):
        try:
            resp = requests.get(f"{FASTAPI_URL}/health", timeout=5)
            st.success(resp.json())
        except Exception as exc:
            st.error(f"Health check failed: {exc}")

col1, col2 = st.columns(2)

with col1:
    surplus = st.number_input("Surplus", min_value=0.0, value=40000.0, step=1000.0)
    txn_score = st.slider("Txn Score", min_value=1, max_value=5, value=3)
    rent_score = st.slider("Rent Score", min_value=1, max_value=5, value=3)
    utility_score = st.slider("Utility Score", min_value=1, max_value=5, value=3)
    insurance_score = st.slider("Insurance Score", min_value=1, max_value=5, value=3)

with col2:
    employment_stability = st.slider("Employment Stability", min_value=1, max_value=5, value=4)
    avg_balance = st.number_input("Avg Balance", min_value=0.0, value=50000.0, step=1000.0)
    balance_multiplier = st.selectbox("Balance Multiplier", options=[0, 1, 2], index=1)
    missed_30_days = st.selectbox("Missed 30 Days Payment", options=[0, 1], index=0)
    shock_flag = st.selectbox("Financial Shock", options=[0, 1], index=0)
    emi_flag = st.selectbox("EMI Flag", options=[0, 1], index=1)

if st.button("Predict"):
    payload = {
        "surplus": surplus,
        "txnScore": txn_score,
        "utilityScore": utility_score,
        "rentScore": rent_score,
        "insuranceScore": insurance_score,
        "employmentStability": employment_stability,
        "avgBalance": avg_balance,
        "balanceMultiplier": balance_multiplier,
        "missed30DaysFlag": missed_30_days,
        "shockFlag": shock_flag,
        "emiFlag": emi_flag,
    }

    try:
        response = requests.post(f"{FASTAPI_URL}/predict", json=payload, timeout=10)
        response.raise_for_status()
        result = response.json()

        st.subheader("Prediction")
        st.json({
            "riskLabel": result["riskLabel"],
            "riskNorm": round(result["riskNorm"], 4),
            "eligibleAmount": round(result["eligibleAmount"], 2),
            "lowerBound": round(result["lowerBound"], 2),
            "upperBound": round(result["upperBound"], 2),
        })

        contrib = result.get("featureContributions", [])
        if contrib:
            st.subheader("Feature Contributions")
            contrib_df = pd.DataFrame(contrib).sort_values("value", ascending=False)
            st.dataframe(contrib_df, use_container_width=True)
            st.bar_chart(contrib_df.set_index("feature")["value"])
    except requests.HTTPError:
        st.error(response.text)
    except Exception as exc:
        st.error(str(exc))
