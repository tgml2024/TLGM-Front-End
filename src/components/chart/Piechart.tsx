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
        backgroundColor: ['rgba(57, 255, 20, 0.8)', 'rgba(255, 23, 68, 0.8)'],
        borderColor: ['rgba(50, 205, 50, 1)', 'rgba(255, 0, 51, 1)'],
        borderWidth: 2,
        hoverBackgroundColor: ['rgba(57, 255, 20, 1)', 'rgba(255, 23, 68, 1)'],
        hoverBorderColor: ['rgba(57, 255, 20, 1)', 'rgba(255, 23, 68, 1)'],
        hoverBorderWidth: 3,
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
