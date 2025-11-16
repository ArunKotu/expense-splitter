import "../styles/theme.css";
import "../styles/home.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="theme-root">
      <div className="home-container">

        <h1 className="home-title">Welcome Back</h1>
        <p className="home-subtitle">Your smart expense dashboard.</p>

        <div className="home-grid">

          {/* Add Expense */}
          <div className="home-card">
            <h2 className="card-title">Add New Expense</h2>
            <p>Add your latest spending and keep the group updated.</p>
            <button className="home-btn" onClick={() => navigate("/add-expense")}>
              Add Expense
            </button>
          </div>

          {/* View Expenses */}
          <div className="home-card">
            <h2 className="card-title">View All Expenses</h2>
            <p>See complete history, totals & settlement calculations.</p>
            <button className="home-btn" onClick={() => navigate("/view-expenses")}>
              View Expenses
            </button>
          </div>

          {/* Members */}
          <div className="home-card">
            <h2 className="card-title">Members</h2>
            <p>Manage people who shared the expenses.</p>
            <button className="home-btn" onClick={() => navigate("/members")}>
              View Members
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
