# Model Serving (FastAPI + Streamlit)

This folder serves the trained XGBoost model from:

- `Notebook/artifacts/xgboost_loan_model.pkl`

## 1) Setup

```bash
cd artifacts/model-serving
python -m venv .venv
. .venv/Scripts/activate
pip install -r requirements.txt
```

## 2) Run FastAPI

```bash
uvicorn fastapi_app:app --host 0.0.0.0 --port 8000 --reload
```

## 3) Run Streamlit

```bash
streamlit run streamlit_app.py
```

## Environment variables

- `MODEL_PATH` (optional): absolute or relative path to model pkl.
- `FASTAPI_URL` (optional): Streamlit API URL. Default `http://127.0.0.1:8000`.
