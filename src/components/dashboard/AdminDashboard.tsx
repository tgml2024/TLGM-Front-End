import { CogIcon } from '@heroicons/react/24/outline';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import React, { useEffect, useState } from 'react';

import Chart from '@/components/chart/Chart';
import { dashboardAdmin, getActiveForwarders } from '@/services/forwardService';
import withAuth from '@/utils/withAuth';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const Dashboard: React.FC = () => {
  const [activeForwarders, setActiveForwarders] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dateRange, setDateRange] = useState<{
    startDate: Dayjs | null;
    endDate: Dayjs | null;
  }>({
    startDate: dayjs().subtract(7, 'day'),
    endDate: dayjs(),
  });

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
        const response = await dashboardAdmin({
          startDate: dateRange.startDate?.format('YYYY-MM-DD'),
          endDate: dateRange.endDate?.format('YYYY-MM-DD'),
        });
        setDashboardData(response.data);
      } catch (err) {
        setError('Failed to fetch dashboard data');
      }
    };

    fetchActiveForwarders();
    if (dateRange.startDate && dateRange.endDate) {
      fetchDashboardData();
    }
    const interval = setInterval(() => {
      fetchActiveForwarders();
      fetchDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, [dateRange.startDate, dateRange.endDate]);

  const getFilteredData = () => {
    if (!dashboardData) return null;
    return {
      forwards: dashboardData.forwards || [],
      details: dashboardData.details || [],
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
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="flex justify-center gap-4 items-center">
              <DatePicker
                label="Start Date"
                value={dateRange.startDate}
                onChange={(newValue) =>
                  setDateRange((prev) => ({ ...prev, startDate: newValue }))
                }
                maxDate={dateRange.endDate || undefined}
              />
              <span className="text-gray-500">to</span>
              <DatePicker
                label="End Date"
                value={dateRange.endDate}
                onChange={(newValue) =>
                  setDateRange((prev) => ({ ...prev, endDate: newValue }))
                }
                minDate={dateRange.startDate || undefined}
                maxDate={dayjs()}
              />
            </div>
          </LocalizationProvider>
        </div>
      </div>
      {dashboardData && (
        <div className="max-w-5xl mx-auto">
          <Chart data={getFilteredData()} />
        </div>
      )}
    </div>
  );
};

export default withAuth(Dashboard, 'admin');
