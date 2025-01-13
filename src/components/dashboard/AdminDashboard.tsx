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
} from '@/services/dashboardAdminService';
import { getActiveForwarders } from '@/services/forwardService';
import withAuth from '@/utils/withAuth';

import ChartForward from '../chart/Chart';
import Horizontal from '../chart/Horizontal';
import Piechart from '../chart/Piechart';

const Dashboard: React.FC = () => {
  const [activeForwarders, setActiveForwarders] = useState<number>(0);
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
  const [forwardersLoading, setForwardersLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [totalStatsLoading, setTotalStatsLoading] = useState(true);
  const [forwardersError, setForwardersError] = useState(false);
  const [dashboardError, setDashboardError] = useState(false);
  const [totalStatsError, setTotalStatsError] = useState(false);

  const fetchData = async () => {
    setForwardersLoading(true);
    try {
      const forwardersResponse = await getActiveForwarders();
      setActiveForwarders(forwardersResponse.activeForwarders);
    } catch (err) {
      setForwardersError(true);
      toast.error('Failed to fetch active forwarders');
    } finally {
      setForwardersLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setDashboardLoading(true);
      try {
        let response;
        switch (viewMode) {
          case 'day':
            response = await getDashboardDay(
              dayjs(selectedDate).format('YYYY-MM-DD')
            );
            break;
          case 'month':
            response = await getDashboardMonth(
              dayjs(selectedDate).format('YYYY-MM')
            );
            break;
          case 'year':
            response = await getDashboardYear(
              dayjs(selectedDate).format('YYYY')
            );
            break;
          default:
            response = await getDashboardDay(
              dayjs(selectedDate).format('YYYY-MM-DD')
            );
        }
        setDashboardData(response);
        setDashboardError(false);
      } catch (err) {
        setDashboardError(true);
        toast.error('Failed to fetch dashboard data');
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboardData();
  }, [viewMode, selectedDate]);

  useEffect(() => {
    const fetchTotalStats = async () => {
      setTotalStatsLoading(true);
      try {
        const response = await getDashboardTotal();
        setTotalStats(response.data.summary);
        setTotalStatsError(false);
      } catch (err) {
        setTotalStatsError(true);
        toast.error('Failed to fetch total statistics');
      } finally {
        setTotalStatsLoading(false);
      }
    };

    fetchTotalStats();
  }, []);

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

    // // รูข้อมูลที่ได้จาก API
    // console.log('Raw data:', items);
    // console.log('First item details:', items[0]?.details);

    // รวมค่าทั้งหมดของช่วงเวลาที่เลือก
    const totals = items.reduce(
      (acc, item) => {
        const detail = item.details[0];
        // console.log('Current detail:', detail); // ดูค่าแต่ละรายการ
        return {
          total_success:
            Number(acc.total_success) + Number(detail?.total_success || 0),
          total_fail: Number(acc.total_fail) + Number(detail?.total_fail || 0),
        };
      },
      { total_success: 0, total_fail: 0 }
    );

    // toast.success(JSON.stringify(totals)); // เพิ่ม log เพื่อดูค่า
    return totals;
  };

  const renderStatValue = (
    value: number | string,
    isLoading: boolean,
    hasError: boolean
  ) => {
    if (isLoading) return 'Loading...';
    if (hasError) return 'Error';
    return value;
  };

  if (forwardersLoading && dashboardLoading && totalStatsLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-md p-3 md:p-4 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <CogIcon className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
            <h2 className="text-xs md:text-sm font-medium text-gray-700">
              Active Forwarders
            </h2>
          </div>
          <div className="flex justify-center">
            <div className="text-xl md:text-3xl font-bold text-blue-600 px-2 md:px-4 py-1 md:py-2 rounded-lg">
              {renderStatValue(
                activeForwarders,
                forwardersLoading,
                forwardersError
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-3 md:p-4 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <CogIcon className="h-5 w-5 md:h-6 md:w-6 text-purple-500" />
            <h2 className="text-xs md:text-sm font-medium text-gray-700">
              Total Forwards
            </h2>
          </div>
          <div className="flex justify-center">
            <div className="text-xl md:text-3xl font-bold text-purple-600 px-2 md:px-4 py-1 md:py-2 rounded-lg">
              {renderStatValue(
                totalStats.total_forwards,
                totalStatsLoading,
                totalStatsError
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-3 md:p-4 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <CogIcon className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
            <h2 className="text-xs md:text-sm font-medium text-gray-700">
              Total Success
            </h2>
          </div>
          <div className="flex justify-center">
            <div className="text-xl md:text-3xl font-bold text-green-600 px-2 md:px-4 py-1 md:py-2 rounded-lg">
              {renderStatValue(
                totalStats.total_success,
                totalStatsLoading,
                totalStatsError
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-3 md:p-4 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <CogIcon className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
            <h2 className="text-xs md:text-sm font-medium text-gray-700">
              Total Fail
            </h2>
          </div>
          <div className="flex justify-center">
            <div className="text-xl md:text-3xl font-bold text-red-600 px-2 md:px-4 py-1 md:py-2 rounded-lg">
              {renderStatValue(
                totalStats.total_fail,
                totalStatsLoading,
                totalStatsError
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-4 md:mb-6 flex flex-col">
        <div className="flex justify-center mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 bg-white p-3 rounded-lg shadow-sm w-full md:w-auto">
            <div className="flex gap-1 w-full md:w-auto">
              <button
                onClick={() => setViewMode('day')}
                className={`flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 text-sm rounded-md font-medium transition-all duration-200 ${
                  viewMode === 'day'
                    ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 text-sm rounded-md font-medium transition-all duration-200 ${
                  viewMode === 'month'
                    ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('year')}
                className={`flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 text-sm rounded-md font-medium transition-all duration-200 ${
                  viewMode === 'year'
                    ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Year
              </button>
            </div>
            <div className="hidden md:block h-8 w-px bg-gray-200"></div>
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) =>
                setSelectedDate(date || new Date())
              }
              dateFormat={getDateFormat(viewMode)}
              showMonthYearPicker={viewMode === 'month'}
              showYearPicker={viewMode === 'year'}
              className="w-full md:w-auto px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-100">
              <h3 className="text-xs md:text-sm font-medium text-gray-600 mb-3 md:mb-4">
                Success/Fail Distribution
              </h3>
              {(() => {
                if (dashboardLoading) return <div>Loading...</div>;
                if (dashboardError) return <div>Error loading chart</div>;
                if (dashboardData) return <Piechart data={getDetails()} />;
                return null;
              })()}
            </div>
            <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-100">
              <h3 className="text-xs md:text-sm font-medium text-gray-600 mb-3 md:mb-4">
                Success/Fail Comparison
              </h3>
              {dashboardData && <Horizontal data={getDetails()} />}
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-100">
            <h3 className="text-xs md:text-sm font-medium text-gray-600 mb-3 md:mb-4">
              Forward Statistics Over Time
            </h3>
            {dashboardData && (
              <ChartForward data={dashboardData} viewMode={viewMode} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(Dashboard, 'admin');
