import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export default function PieChartCategory({ expenses }) {
  const totals = {};
  expenses.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });

  const labels = Object.keys(totals);
  const values = Object.values(totals);
  const total = values.reduce((a, b) => a + b, 0);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff"],
        hoverOffset: 12,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 30 },

    plugins: {
      datalabels: {
        color: "white",
        font: {
          weight: "bold",
          size: 14,
        },
        formatter: (value) => {
          const percent = ((value / total) * 100).toFixed(1);
          return percent + "%";
        },
      },

      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.raw;
            const percent = ((value / total) * 100).toFixed(1);
            return `${ctx.label}: ₹${value} (${percent}%)`;
          },
        },
      },

      legend: {
        position: "bottom",
        labels: {
          color: "white",
          padding: 15,
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "350px" }}>
      <Pie data={data} options={options} />
    </div>
  );
}
