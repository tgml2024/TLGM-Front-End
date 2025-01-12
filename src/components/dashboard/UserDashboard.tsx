import 'react-datepicker/dist/react-datepicker.css';

import { CogIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import toast from 'react-hot-toast';

import {
  DashboardDayResponse,
  DashboardMonthResponse,
  DashboardYearResponse,
  getDashboardDay,
  getDashboardMonth,
  getDashboardTotal,
  getDashboardYear,
} from '@/services/dashboardUserService';
import withAuth from '@/utils/withAuth';

import Horizontal from '../chart/Horizontal';
import Piechart from '../chart/Piechart';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<'day' | 'month' | 'year'>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dashboardData, setDashboardData] = useState<
    DashboardDayResponse | DashboardMonthResponse | DashboardYearResponse | null
  >(null);
  const [totalStats, setTotalStats] = useState<{
    total_forwards: number;
    total_success: number;
    total_fail: number;
  }>({
    total_forwards: 0,
    total_success: 0,
    total_fail: 0,
  });
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const userDataStr = sessionStorage.getItem('userData');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        setUserId(userData.id.toString());
      } catch (err) {
        toast.error('Failed to load user data');
      }
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) return;

      try {
        let response;
        switch (viewMode) {
          case 'day':
            response = await getDashboardDay(
              dayjs(selectedDate).format('YYYY-MM-DD'),
              userId
            );
            break;
          case 'month':
            response = await getDashboardMonth(
              dayjs(selectedDate).format('YYYY-MM'),
              userId
            );
            break;
          case 'year':
            response = await getDashboardYear(
              dayjs(selectedDate).format('YYYY'),
              userId
            );
            break;
          default:
            response = await getDashboardDay(
              dayjs(selectedDate).format('YYYY-MM-DD'),
              userId
            );
        }
        setDashboardData(response);
      } catch (err) {
        toast.error('Failed to fetch dashboard data');
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchDashboardData();
  }, [viewMode, selectedDate, userId]);

  useEffect(() => {
    const initialLoad = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await getDashboardTotal(userId);
        setTotalStats(response.data.summary);
      } catch (err) {
        toast.error('Failed to fetch total statistics');
      } finally {
        setLoading(false);
      }
    };

    initialLoad();
  }, [userId]);

  const getDateFormat = (mode: 'day' | 'month' | 'year') => {
    switch (mode) {
      case 'day':
        return 'yyyy-MM-dd';
      case 'month':
        return 'yyyy-MM';
      case 'year':
        return 'yyyy';
      default:
        return 'yyyy-MM-dd';
    }
  };

  const getDetails = () => {
    if (!dashboardData?.data) return { total_success: 0, total_fail: 0 };

    let items;
    if ('hours' in dashboardData.data) {
      items = dashboardData.data.hours;
    } else if ('days' in dashboardData.data) {
      items = dashboardData.data.days;
    } else if ('months' in dashboardData.data) {
      items = dashboardData.data.months;
    } else {
      return { total_success: 0, total_fail: 0 };
    }

    // รวมค่าทั้งหมดของช่วงเวลาที่เลือก
    const totals = items.reduce(
      (acc, item) => {
        const detail = item.details[0];
        return {
          total_success:
            Number(acc.total_success) + Number(detail?.total_success || 0),
          total_fail: Number(acc.total_fail) + Number(detail?.total_fail || 0),
        };
      },
      { total_success: 0, total_fail: 0 }
    );

    return totals;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-[#0A0A0A] min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto mb-6">
        <div className="group">
          <div
            className="p-6 bg-[#1A1A1A]/80 backdrop-blur-xl rounded-xl border border-[#FFD700]/20
            transform transition-all duration-300 group-hover:scale-105
            group-hover:shadow-[0_0_25px_rgba(212,175,55,0.15)]"
          >
            <div className="flex items-center space-x-4">
              <div
                className="p-3 bg-gradient-to-br from-[#FFD700] to-[#D4AF37] rounded-lg
                shadow-[0_0_15px_rgba(212,175,55,0.3)]"
              >
                <CogIcon className="h-6 w-6 text-black" />
              </div>
              <div>
                <p className="text-[#FFD700]/70 text-sm font-medium mb-1">
                  Total Forwards
                </p>
                <p className="text-[#FFD700] text-2xl font-bold tracking-wider">
                  {totalStats?.total_forwards || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="group">
          <div
            className="p-6 bg-[#1A1A1A]/80 backdrop-blur-xl rounded-xl border border-[#FFD700]/20
            transform transition-all duration-300 group-hover:scale-105
            group-hover:shadow-[0_0_25px_rgba(212,175,55,0.15)]"
          >
            <div className="flex items-center space-x-4">
              <div
                className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg
                shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              >
                <CogIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[#FFD700]/70 text-sm font-medium mb-1">
                  Total Success
                </p>
                <p className="text-green-500 text-2xl font-bold tracking-wider">
                  {totalStats?.total_success || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="group">
          <div
            className="p-6 bg-[#1A1A1A]/80 backdrop-blur-xl rounded-xl border border-[#FFD700]/20
            transform transition-all duration-300 group-hover:scale-105
            group-hover:shadow-[0_0_25px_rgba(212,175,55,0.15)]"
          >
            <div className="flex items-center space-x-4">
              <div
                className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-lg
                shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              >
                <CogIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[#FFD700]/70 text-sm font-medium mb-1">
                  Total Fail
                </p>
                <p className="text-red-500 text-2xl font-bold tracking-wider">
                  {totalStats?.total_fail || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-6">
        <div className="p-6 bg-[#1A1A1A]/80 backdrop-blur-xl rounded-xl border border-[#FFD700]/20">
          <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
            <div className="flex gap-2">
              {['day', 'month', 'year'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as 'day' | 'month' | 'year')}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300
                    ${
                      viewMode === mode
                        ? 'bg-gradient-to-r from-[#FFD700] to-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                        : 'bg-[#2A2A2A] text-[#FFD700]/70 hover:bg-[#3A3A3A]'
                    }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) =>
                setSelectedDate(date || new Date())
              }
              dateFormat={getDateFormat(viewMode)}
              showMonthYearPicker={viewMode === 'month'}
              showYearPicker={viewMode === 'year'}
              className="px-4 py-2.5 bg-[#2A2A2A] border-2 border-[#FFD700]/30
                text-[#FFD700] rounded-lg focus:outline-none focus:ring-2 
                focus:ring-[#FFD700] focus:border-transparent
                hover:border-[#FFD700]/50"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="p-6 bg-[#0A0A0A] backdrop-blur-xl rounded-xl border border-[#FFD700]/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-xl border border-[#FFD700]/20">
              <h3 className="text-[#FFD700] font-medium mb-4 flex items-center gap-2">
                <div
                  className="p-2 bg-gradient-to-br from-[#FFD700] to-[#D4AF37] rounded-lg
                  shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                >
                  <svg
                    className="w-4 h-4 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                    />
                  </svg>
                </div>
                Messages Distribution
              </h3>
              <div className="flex items-center justify-center h-[300px]">
                {dashboardData && (
                  <div className="w-full max-w-[300px]">
                    <Piechart data={getDetails()} />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl border border-[#FFD700]/20">
              <h3 className="text-[#FFD700] font-medium mb-4 flex items-center gap-2">
                <div
                  className="p-2 bg-gradient-to-br from-[#FFD700] to-[#D4AF37] rounded-lg
                  shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                >
                  <svg
                    className="w-4 h-4 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                Messages Comparison
              </h3>
              <div className="flex items-center justify-center h-[300px]">
                {dashboardData && (
                  <div className="w-full max-w-[400px]">
                    <Horizontal data={getDetails()} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(Dashboard, 'user');
