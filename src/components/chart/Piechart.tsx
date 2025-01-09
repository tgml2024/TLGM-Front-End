import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PiechartProps {
  data: {
    total_success: number;
    total_fail: number;
  };
}

const Piechart = ({ data }: PiechartProps) => {
  const chartData = {
    labels: ['Success', 'Fail'],
    datasets: [
      {
        data: [data.total_success, data.total_fail],
        backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 99, 132, 0.5)'],
        borderColor: ['rgb(54, 162, 235)', 'rgb(255, 99, 132)'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Forward Success/Fail Distribution',
        font: {
          size: window.innerWidth < 768 ? 12 : 14,
        },
      },
    },
  };

  return (
    <div className="h-[200px] md:h-[300px]">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default Piechart;
