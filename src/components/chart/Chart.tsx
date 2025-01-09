import 'react-datepicker/dist/react-datepicker.css';

import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartData,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import dayjs from 'dayjs';
import { Chart } from 'react-chartjs-2';

import {
  DashboardDayResponse,
  DashboardMonthResponse,
  DashboardYearResponse,
} from '@/services/dashboardAdminService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend
);

interface ChartForwardProps {
  data: DashboardDayResponse | DashboardMonthResponse | DashboardYearResponse;
  viewMode: 'day' | 'month' | 'year';
}

function ChartForward({ data, viewMode }: ChartForwardProps) {
  const getChartData = (): ChartData<'bar' | 'line'> => {
    if (!data?.data) return { labels: [], datasets: [] };

    let chartData: any[] = [];
    if ('hours' in data.data) {
      chartData = data.data.hours || [];
    } else if ('days' in data.data) {
      chartData = data.data.days || [];
    } else if ('months' in data.data) {
      chartData = data.data.months || [];
    } else {
      chartData = [];
    }

    const forwardsData = chartData.map((item) => item.forwards[0]?.total || 0);

    return {
      labels: chartData.map((item: any) =>
        viewMode === 'day'
          ? item.hour
          : dayjs(item.date).format(viewMode === 'month' ? 'DD' : 'MMM')
      ),
      datasets: [
        {
          type: 'line' as const,
          label: 'Trend',
          data: forwardsData,
          borderColor: '#4A90E2',
          borderWidth: 3,
          pointRadius: 4,
          pointBackgroundColor: '#4A90E2',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#4A90E2',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          fill: false,
          tension: 0.4,
          order: 1,
        },
        {
          type: 'bar' as const,
          label: 'Total Forwards',
          data: forwardsData,
          backgroundColor: 'rgba(74, 144, 226, 0.1)',
          borderColor: 'rgba(74, 144, 226, 0.4)',
          borderWidth: 1,
          borderRadius: 4,
          hoverBackgroundColor: 'rgba(74, 144, 226, 0.3)',
          hoverBorderColor: '#4A90E2',
          order: 2,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
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
        text: `Forward Statistics (${
          viewMode.charAt(0).toUpperCase() + viewMode.slice(1)
        })`,
        font: {
          size: window.innerWidth < 768 ? 12 : 14,
        },
      },
    },
    scales: {
      x: {
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
    <div className="h-[250px] md:h-[400px]">
      <Chart type="bar" options={options} data={getChartData()} />
    </div>
  );
}

export default ChartForward;
