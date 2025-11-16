import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/theme.css";
import "../styles/addexpense.css";
import API from "../services/axiosClient";

export default function AddExpense() {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);

  const [payer, setPayer] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [reason, setReason] = useState("");

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await API.get("/members/all");
        setMembers(res.data);
      } catch (err) {
        console.error("Failed loading members:", err);
      }
    };
    fetchMembers();
  }, []);

  const handleSubmit = async () => {
    if (loading) return;

    if (!payer || !amount || !category || !reason) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
    setSuccess(false);

    const newExpense = {
      payer,
      amount: Number(amount),
      category,
      reason,
      date: new Date().toISOString().split("T")[0],
    };

    try {
      await API.post("/expenses/add", newExpense);
      setSuccess(true);

      setPayer("");
      setAmount("");
      setCategory("");
      setReason("");

    } catch (err) {
      console.error("Add expense failed:", err);
      alert("Failed to add expense.");
    }

    setLoading(false);
  };

  return (
    <div className="theme-root">
      <div className="addexpense-container">

        <div className="addexpense-card">

          <h1 className="addexpense-title">Add New Expense</h1>
          <p className="addexpense-subtitle">Track today's spending</p>

          {success && (
            <div className="success-box">
              ✔ Expense added successfully!
            </div>
          )}

          {/* Select Member */}
          <select
            className="expense-select"
            value={payer}
            onChange={(e) => setPayer(e.target.value)}
          >
            <option value="">Select Member</option>
            {members.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Amount (no increment buttons) */}
          <input
            className="expense-input no-spinner"
            type="number"
            inputMode="decimal"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          {/* Category */}
          <input
            className="expense-input"
            type="text"
            placeholder="Category (Food, Travel...)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          {/* Reason */}
          <input
            className="expense-input"
            type="text"
            placeholder="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <button
            className="addexpense-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Add Expense"}
          </button>

          <button
            className="back-btn"
            onClick={() => navigate("/home")}
          >
            Back to Home
          </button>

        </div>
      </div>
    </div>
  );
}
