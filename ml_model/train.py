import pandas as pd
import numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split, cross_val_score
import joblib

# 1. Load dataset
df = pd.read_excel("loan_data.xlsx")

# 2. Drop Loan_ID
df.drop("Loan_ID", axis=1, inplace=True)

# 3. Fix Dependents
df["Dependents"] = df["Dependents"].astype(str)

# 4. Handle missing values
for col in df.select_dtypes(include='number').columns:
    df[col] = df[col].fillna(df[col].median())

for col in df.select_dtypes(include='object').columns:
    df[col] = df[col].fillna(df[col].mode()[0])

# 5. Feature Engineering
df["Total_Income"] = df["ApplicantIncome"] + df["CoapplicantIncome"]
df["EMI"] = df["LoanAmount"] / df["Loan_Amount_Term"]
df["Income_to_Loan"] = df["Total_Income"] / df["LoanAmount"]

# Log features (important)
df["LoanAmount_log"] = np.log1p(df["LoanAmount"])
df["Total_Income_log"] = np.log1p(df["Total_Income"])

# 6. OneHotEncoding
df = pd.get_dummies(df, drop_first=True)

# 7. Split features and target
y = df["Loan_Status_Y"]
X = df.drop("Loan_Status_Y", axis=1)

# 8. Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 9. Final tuned model
model = XGBClassifier(
    n_estimators=900,
    learning_rate=0.02,
    max_depth=3,
    min_child_weight=5,
    subsample=0.7,
    colsample_bytree=0.7,
    gamma=0.2,
    reg_alpha=0.3,
    reg_lambda=1.5,
    random_state=42,
    eval_metric="logloss"
)

model.fit(X_train, y_train)

# 10. Accuracy
accuracy = model.score(X_test, y_test)
print(f"Model accuracy: {accuracy * 100:.2f}%")

# 11. Cross-validation (more reliable)
scores = cross_val_score(model, X, y, cv=10)
print(f"Cross-validation accuracy: {scores.mean() * 100:.2f}%")

# 12. Feature importance (helps improvement)
importance = pd.Series(model.feature_importances_, index=X.columns)
print("\nTop Features:\n", importance.sort_values(ascending=False).head(10))

# 13. Save model + features
joblib.dump(model, "model.pkl")
joblib.dump(list(X.columns), "feature_names.pkl")

print("\nModel and features saved successfully")