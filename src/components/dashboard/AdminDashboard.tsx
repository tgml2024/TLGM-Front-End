import { CogIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

import Chart from '@/components/chart/Chart';
import { dashboardAdmin, getActiveForwarders } from '@/services/forwardService';
import withAuth from '@/utils/withAuth';

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

const Dashboard: React.FC = () => {
  const [activeForwarders, setActiveForwarders] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TimeRange>('daily');

  useEffect(() => {
    const fetchActiveForwarders = async () => {
      try {
        const response = await getActiveForwarders();
        setActiveForwarders(response.activeForwarders);
      } catch (err) {
        setError('Failed to fetch active forwarders');
      } finally {
        setLoading(false);
      }
    };

    const fetchDashboardData = async () => {
      try {
        const response = await dashboardAdmin();
        setDashboardData(response.data);
      } catch (err) {
        setError('Failed to fetch dashboard data');
      }
    };

    fetchActiveForwarders();
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchActiveForwarders();
      fetchDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const timeRangeButtons: { label: string; value: TimeRange }[] = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
  ];

  const getTimeRangeData = () => {
    if (!dashboardData) return null;
    return {
      forwards: dashboardData[selectedTimeRange].forwards,
      details: dashboardData[selectedTimeRange].details,
    };
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
        Admin Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-2">
            <CogIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-sm font-medium text-gray-700">
              Active Forwarders
            </h2>
          </div>
          <div className="flex justify-center">
            <div className="text-3xl font-bold text-blue-600 px-4 py-2 rounded-lg">
              {activeForwarders}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-sm font-medium text-gray-700 text-center">
            Total Headcount
          </h2>
          <div className="flex justify-center">
            <div className="text-3xl font-bold text-green-600 px-4 py-2 rounded-lg">
              3252
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-sm font-medium text-gray-700 text-center">
            Hiring Success Rate
          </h2>
          <div className="flex justify-center">
            <div className="text-3xl font-bold text-purple-600 px-4 py-2 rounded-lg">
              87.6%
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-center gap-4">
            {timeRangeButtons.map((button) => (
              <button
                key={button.value}
                onClick={() => setSelectedTimeRange(button.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedTimeRange === button.value
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {dashboardData && (
        <div className="max-w-5xl mx-auto">
          <Chart data={getTimeRangeData()} timeRange={selectedTimeRange} />
        </div>
      )}
    </div>
  );
};

export default withAuth(Dashboard, 'admin');
