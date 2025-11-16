import "../styles/theme.css";
import "../styles/charts.css";

import PieChartUsers from "../components/PieChartUsers";
import PieChartCategory from "../components/PieChartCategory";

import { useEffect, useState } from "react";
import API from "../services/axiosClient";

export default function Charts() {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const res = await API.get("/expenses/all");
      setExpenses(res.data);
    } catch (err) {
      console.error("Failed to load:", err);
    }
  };

  // Prepare user-wise data
  const spent = {};
  expenses.forEach((e) => {
    spent[e.payer] = (spent[e.payer] || 0) + e.amount;
  });

  // Prepare category-wise data
  const categoryTotals = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  return (
    <div className="theme-root">
      <div className="charts-container">
        <h1 className="charts-title">Expense Insights</h1>
        <p className="charts-subtitle">Visual breakdown of spending</p>

        <div className="charts-grid">
          <div className="chart-box">
            <h2>User-wise Spending</h2>
            <PieChartUsers spent={spent} />
          </div>

          <div className="chart-box">
            <h2>Category-wise Spending</h2>
            <PieChartCategory expenses={expenses} />
          </div>
        </div>
      </div>
    </div>
  );
}
