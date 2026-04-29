import os
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from urllib.parse import quote_plus
import lightgbm as lgb
import joblib
import json
import sys

# ----------------------------------------------------
# 1. Database Connection
# ----------------------------------------------------
SERVER = "192.168.10.219,1433"
DATABASE = "styxdev"
USERNAME = "SA"
PASSWORD = "YourStrong@Passw0rd"

conn_str = (
    "Driver={ODBC Driver 18 for SQL Server};"
    f"Server={SERVER};"
    f"Database={DATABASE};"
    f"Uid={USERNAME};"
    f"Pwd={PASSWORD};"
    "Encrypt=no;"
    "TrustServerCertificate=yes;"
)

CONN_URL = f"mssql+pyodbc:///?odbc_connect={quote_plus(conn_str)}"
engine = create_engine(CONN_URL)

# ----------------------------------------------------
# 2. Load Data
# ----------------------------------------------------
print("📥 Loading data from MSSQL...")

sql = """
SELECT
    style,
    color,
    fabric_type,
    buyer,
    season,
    order_qty,
    unit,
    articleNo,
    brand,
    productCategory,
    productSubCategory,
    booking_cons,
    qty,
    mark_cons
FROM vw_FabricConsumption_WithStyleFeed
WHERE
    mark_cons IS NOT NULL
    AND order_qty > 0
    AND qty > 0
"""

df = pd.read_sql(sql, engine)
print("🔢 Rows loaded:", len(df))

if df.empty:
    print("❌ ERROR: No data loaded. Model cannot be trained.")
    sys.exit(1)

# ----------------------------------------------------
# 3. Preprocess
# ----------------------------------------------------

df = df.dropna(subset=["mark_cons"])
print("🧹 After cleaning:", len(df))

# ----------------------------------------------------
# 4. Feature Engineering
# ----------------------------------------------------
def style_group(x):
    return str(x).upper().strip()[:5] if x else None

df["style_group"] = df["style"].apply(style_group)




# Final feature list: style, qty, booking_cons
feature_cols = ["style", "qty", "booking_cons"]
cat_cols = ["style"]

# Ensure qty and booking_cons are present and numeric
for col in ["qty", "booking_cons"]:
    if col not in df.columns:
        print(f"❌ ERROR: '{col}' column missing in data.")
        sys.exit(1)
    df[col] = pd.to_numeric(df[col], errors="coerce")
df = df.dropna(subset=["qty", "booking_cons"])

print("🧹 After cleaning:", len(df))

from sklearn.preprocessing import OrdinalEncoder
encoder = OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1)
df[cat_cols] = encoder.fit_transform(df[cat_cols])

# ----------------------------------------------------
# 6. Save encoder
# ----------------------------------------------------
model_dir = os.path.join(os.path.dirname(__file__), "model")
os.makedirs(model_dir, exist_ok=True)

joblib.dump(
    {"encoder": encoder, "categorical": cat_cols},
    os.path.join(model_dir, "encoder.pkl")
)

# ----------------------------------------------------
# 7. Train/Validation Split
# ----------------------------------------------------

from sklearn.model_selection import train_test_split
X = df[feature_cols]
y = df["mark_cons"]

# if dataset too small, use ALL rows for training
if len(df) < 10:
    X_train, X_test, y_train, y_test = X, X, y, y
else:
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

# ----------------------------------------------------
# 8. Train Quantile Models
# ----------------------------------------------------
def train_quantile(alpha):
    params = {
        "objective": "quantile",
        "alpha": alpha,
        "learning_rate": 0.05,
        "num_leaves": 8,
        "min_data_in_leaf": 1,
        "min_sum_hessian_in_leaf": 1e-3,
        "n_estimators": 300,
        "verbosity": -1,  # Suppress LightGBM warnings
    }
    model = lgb.LGBMRegressor(**params)
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        callbacks=[lgb.log_evaluation(period=50)]
    )
    return model

print("📘 Training P50...")
model_p50 = train_quantile(0.5)

print("📗 Training P75...")
model_p75 = train_quantile(0.75)

print("📙 Training P90...")
model_p90 = train_quantile(0.90)

# ----------------------------------------------------
# 9. Save LightGBM Models
# ----------------------------------------------------
model_p50.booster_.save_model(os.path.join(model_dir, "lgbm_model_p50.txt"))
model_p75.booster_.save_model(os.path.join(model_dir, "lgbm_model_p75.txt"))
model_p90.booster_.save_model(os.path.join(model_dir, "lgbm_model_p90.txt"))

# ----------------------------------------------------
# 10. Save feature list
# ----------------------------------------------------
with open(os.path.join(model_dir, "feature_list.json"), "w") as f:
    json.dump(feature_cols, f, indent=2)

print("✅ Training complete!")
print("📁 Model files saved to:", model_dir)