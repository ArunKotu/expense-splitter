import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/axiosClient";

import "../styles/theme.css";
import "../styles/viewexpenses.css";

export default function ViewExpenses() {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔔 POPUP STATE
  const [popup, setPopup] = useState({
    show: false,
    message: "",
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const res = await API.get("/expenses/all");
      setExpenses(res.data);
      setFilteredExpenses(res.data);

      const uniqueMembers = [...new Set(res.data.map((e) => e.payer))];
      setMembers(uniqueMembers);
    } catch (err) {
      console.error("Failed to load expenses:", err);
    }
    setLoading(false);
  };

  const applyFilter = () => {
    if (!selectedDate) {
      alert("Select a date first.");
      return;
    }

    const filtered = expenses.filter(
      (e) => new Date(e.date) <= new Date(selectedDate)
    );
    setFilteredExpenses(filtered);
  };

  // 📌 Summary Calculation
  const spent = {};
  members.forEach((m) => (spent[m] = 0));
  filteredExpenses.forEach((e) => (spent[e.payer] += e.amount));

  const total = Object.values(spent).reduce((a, b) => a + b, 0);
  const share = members.length ? total / members.length : 0;

  const net = {};
  members.forEach((m) => (net[m] = spent[m] - share));

  // 💰 Settlement Logic
  const settlements = [];
  let receivers = members.filter((m) => net[m] > 0).map((m) => ({ m, amt: net[m] }));
  let payers = members.filter((m) => net[m] < 0).map((m) => ({ m, amt: -net[m] }));

  while (payers.length && receivers.length) {
    let p = payers[0];
    let r = receivers[0];
    let settled = Math.min(p.amt, r.amt);

    settlements.push(`${p.m} owes ${r.m} ₹${settled}`);

    p.amt -= settled;
    r.amt -= settled;

    if (p.amt === 0) payers.shift();
    if (r.amt === 0) receivers.shift();
  }

  // 📧 FIXED & CORRECT EMAIL FUNCTION
  const sendEmail = async () => {
    try {
      await API.post("/summary/email/send-summary");

      setPopup({
        show: true,
        message: "📧 Email summary sent successfully!",
      });

      setTimeout(() => setPopup({ show: false, message: "" }), 2500);

    } catch (err) {
      console.error(err);

      setPopup({
        show: true,
        message: "❌ Failed to send email",
      });

      setTimeout(() => setPopup({ show: false, message: "" }), 3000);
    }
  };

  return (
    <div className="theme-root">
      <div className="view-container">

        {/* 🔔 POPUP */}
        {popup.show && <div className="popup-box">{popup.message}</div>}

        <h1 className="view-title">Expense Overview</h1>

        {/* Filter */}
        <div className="filter-row">
          <input
            type="date"
            className="filter-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button className="filter-btn" onClick={applyFilter}>
            Apply Filter
          </button>
        </div>

        {/* Table */}
        <table className="view-table">
          <thead>
            <tr>
              <th>Payer</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {filteredExpenses.map((e, i) => (
              <tr key={i}>
                <td>{e.payer}</td>
                <td>₹{e.amount}</td>
                <td>{e.category}</td>
                <td>{e.date}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <h2 className="section-title">Summary</h2>
        <div className="summary-box">
          {members.map((m) => (
            <div key={m} className="summary-item">
              {m}: spent ₹{spent[m]} —{" "}
              {net[m] >= 0 ? `gets ₹${net[m]}` : `owes ₹${-net[m]}`}
            </div>
          ))}
        </div>

        {/* Settlements */}
        <h2 className="section-title">Who Owes Whom</h2>
        <div className="settlement-box">
          {settlements.map((s, i) => (
            <div key={i} className="settlement-item">{s}</div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="view-actions">

          <button className="view-btn email-btn" onClick={sendEmail}>
            📧 Send Email Summary
          </button>

          <button
            className="view-btn chart-btn"
            onClick={() => navigate("/charts")}
          >
            📊 View Pie Charts
          </button>

        </div>

      </div>
    </div>
  );
}
