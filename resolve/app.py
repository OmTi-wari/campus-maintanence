import streamlit as st
import joblib
import pandas as pd

# Load models
vectorizer = joblib.load("model/vectorizer.pkl")
category_model = joblib.load("model/category_model.pkl")
priority_model = joblib.load("model/priority_model.pkl")

st.set_page_config(page_title="Smart Maintenance Ticket AI", layout="wide")

st.title("🛠️ Smart Maintenance Ticket Prioritizer")
st.write("AI-powered system to automatically categorize and prioritize maintenance complaints.")

# Session storage
if "tickets" not in st.session_state:
    st.session_state.tickets = []

# User input
st.subheader("📩 Submit a Complaint")
complaint = st.text_area("Describe the issue", height=100)

if st.button("Submit Ticket"):
    if complaint.strip():
        X = vectorizer.transform([complaint])
        category = category_model.predict(X)[0]
        priority = priority_model.predict(X)[0]

        st.session_state.tickets.append({
            "Complaint": complaint,
            "Category": category,
            "Priority": priority
        })

        st.success(f"Ticket submitted → Category: {category}, Priority: {priority}")
    else:
        st.warning("Please enter a complaint.")

# Admin dashboard
st.subheader("📊 Admin Dashboard")

if st.session_state.tickets:
    df = pd.DataFrame(st.session_state.tickets)

    priority_order = {"Critical": 1, "High": 2, "Medium": 3}
    df["Sort"] = df["Priority"].map(priority_order)
    df = df.sort_values("Sort").drop(columns="Sort")

    def color_priority(val):
        if val == "Critical":
            return "background-color: #ff4d4d"
        elif val == "High":
            return "background-color: #ffa500"
        elif val == "Medium":
            return "background-color: #90ee90"
        return ""

    st.dataframe(df.style.applymap(color_priority, subset=["Priority"]), use_container_width=True)
else:
    st.info("No tickets submitted yet.")
