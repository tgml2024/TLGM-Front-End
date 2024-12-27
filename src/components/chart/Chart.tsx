import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import React from 'react';
import { Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ChartProps {
  data: any;
  timeRange: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

const Chart: React.FC<ChartProps> = ({ data, timeRange }) => {
  const getLabels = () => {
    if (!data?.forwards) return [];
    return data.forwards.map((item: any) => {
      switch (timeRange) {
        case 'daily':
          return item.date;
        case 'weekly':
          return `Week ${item.week}`;
        case 'monthly':
          return item.month;
        case 'yearly':
          return item.year;
        default:
          return item.date;
      }
    });
  };

  const lineChartData = {
    labels: getLabels(),
    datasets: [
      {
        label: 'Total Forwards',
        data: data?.forwards?.map((item: any) => item.total_forwards) || [],
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#4F46E5',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#4F46E5',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          font: {
            size: 13,
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleFont: {
          size: 13,
          family: "'Inter', sans-serif",
        },
        bodyFont: {
          size: 12,
          family: "'Inter', sans-serif",
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          color: '#6B7280',
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(243, 244, 246, 1)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          color: '#6B7280',
          padding: 8,
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    animation: {
      duration: 1000,
    },
  };

  const pieChartData = {
    labels: ['Success', 'Fail'],
    datasets: [
      {
        data: [
          data?.details?.reduce(
            (acc: number, item: any) => acc + item.total_success,
            0
          ),
          data?.details?.reduce(
            (acc: number, item: any) => acc + item.total_fail,
            0
          ),
        ],
        backgroundColor: ['#36A2EB', '#FF6384'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 13,
            family: "'Inter', sans-serif",
          },
        },
      },
    },
    cutout: '0%',
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
        <h3 className="text-xl font-medium mb-4 text-gray-700 text-center">
          Daily Details
        </h3>
        <div className="h-[300px]">
          <Pie data={pieChartData} options={pieOptions} />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
        <h3 className="text-xl font-medium mb-4 text-gray-700 text-center">
          Daily Forwards
        </h3>
        <div className="h-[300px]">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Chart;
