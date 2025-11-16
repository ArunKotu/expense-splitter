import React from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";

export default function PieChartCategory({ expenses }) {
  if (!expenses || expenses.length === 0) {
    return <p style={{ textAlign: "center", opacity: 0.6 }}>No data</p>;
  }

  // Group category totals
  const categoryTotals = {};
  expenses.forEach((e) => {
    if (!categoryTotals[e.category]) categoryTotals[e.category] = 0;
    categoryTotals[e.category] += e.amount;
  });

  const data = Object.keys(categoryTotals).map((cat) => ({
    name: cat,
    value: categoryTotals[cat],
  }));

  const COLORS = [
    "#ff6384",
    "#36a2eb",
    "#ffce56",
    "#4bc0c0",
    "#9966ff",
    "#f87171",
  ];

  return (
    <div
      style={{
        width: "100%",
        height: 380,
        margin: "auto",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={110}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              `${name} (${(percent * 100).toFixed(1)}%)`
            }
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(value) => [`₹${value}`, "Spent"]}
            contentStyle={{
              background: "#111827",
              borderRadius: "10px",
              border: "1px solid #374151",
              color: "#fff",
            }}
          />

          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
