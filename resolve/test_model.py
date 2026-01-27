import joblib

# Load trained components
vectorizer = joblib.load("model/vectorizer.pkl")
category_model = joblib.load("model/category_model.pkl")
priority_model = joblib.load("model/priority_model.pkl")

# Test complaint
test_complaint = "water leaking near server room causing shutdown risk"

# Transform text
X_test = vectorizer.transform([test_complaint])

# Predict
pred_category = category_model.predict(X_test)[0]
pred_priority = priority_model.predict(X_test)[0]

print("Complaint:", test_complaint)
print("Predicted Category:", pred_category)
print("Predicted Priority:", pred_priority)
