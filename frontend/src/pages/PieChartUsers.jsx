import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChartUsers({ spent }) {
  const data = {
    labels: Object.keys(spent),
    datasets: [
      {
        data: Object.values(spent),
        backgroundColor: [
          "#4bc0c0", "#9966ff", "#ff6384",
          "#36a2eb", "#ffcd56"
        ],
      },
    ],
  };

  return <Pie data={data} />;
}
