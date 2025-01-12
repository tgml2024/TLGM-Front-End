import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface HorizontalProps {
  data: {
    total_success: number;
    total_fail: number;
  };
}

const Horizontal = ({ data }: HorizontalProps) => {
  const chartData = {
    labels: ['Success', 'Fail'],
    datasets: [
      {
        data: [data.total_success, data.total_fail],
        backgroundColor: [
          'rgba(57, 255, 20, 0.8)', // สีเขียว neon with opacity
          'rgba(255, 23, 68, 0.8)', // สีแดง neon with opacity
        ],
        borderColor: [
          'rgba(50, 205, 50, 1)', // border เขียวเข้ม
          'rgba(255, 0, 51, 1)', // border แดงเข้ม
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          'rgba(57, 255, 20, 1)', // hover effect สว่างขึ้น
          'rgba(255, 23, 68, 1)',
        ],
        hoverBorderColor: ['rgba(57, 255, 20, 1)', 'rgba(255, 23, 68, 1)'],
        hoverBorderWidth: 3,
        borderRadius: 6, // เพิ่มความโค้งมนให้สวยงาม
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Forward Success/Fail Distribution',
        font: {
          size: window.innerWidth < 768 ? 12 : 14,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
      },
      y: {
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
      },
    },
  };

  return (
    <div className="h-[200px] md:h-[300px]">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default Horizontal;
