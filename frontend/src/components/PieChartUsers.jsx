import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export default function PieChartUsers({ spent }) {
  const labels = Object.keys(spent);
  const values = Object.values(spent);
  const total = values.reduce((a, b) => a + b, 0);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: ["#4bc0c0", "#9966ff", "#ff6384", "#36a2eb", "#ffcd56"],
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
          padding: 12,
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
