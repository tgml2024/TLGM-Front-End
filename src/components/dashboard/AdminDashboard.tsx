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
  getDashboardYear,
} from '@/services/dashboardAdminService';
import { getActiveForwarders } from '@/services/forwardService';
import withAuth from '@/utils/withAuth';

import ChartForward from '../chart/Chart';
import Horizontal from '../chart/Horizontal';
import Piechart from '../chart/Piechart';

const Dashboard: React.FC = () => {
  const [activeForwarders, setActiveForwarders] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<'day' | 'month' | 'year'>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dashboardData, setDashboardData] = useState<
    DashboardDayResponse | DashboardMonthResponse | DashboardYearResponse | null
  >(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch active forwarders
      const forwardersResponse = await getActiveForwarders();
      setActiveForwarders(forwardersResponse.activeForwarders);
    } catch (err) {
      toast.error('Failed to fetch dashboard data');
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
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
      } catch (err) {
        toast.error('Failed to fetch dashboard data');
      }
    };

    fetchDashboardData();
  }, [viewMode, selectedDate]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
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
    <div className="p-6 bg-gray-100 min-h-screen">
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
      </div>

      <div className="mx-auto mb-6 flex flex-col">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-6 bg-white p-3 rounded-lg shadow-sm">
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('day')}
                className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${
                  viewMode === 'day'
                    ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${
                  viewMode === 'month'
                    ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('year')}
                className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${
                  viewMode === 'year'
                    ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Year
              </button>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) =>
                setSelectedDate(date || new Date())
              }
              dateFormat={getDateFormat(viewMode)}
              showMonthYearPicker={viewMode === 'month'}
              showYearPicker={viewMode === 'year'}
              className="px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-600 mb-4">
                Success/Fail Distribution
              </h3>
              <div className="flex items-center justify-center">
                {dashboardData && <Piechart data={getDetails()} />}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-600 mb-4">
                Success/Fail Comparison
              </h3>
              <div className="flex items-center justify-center">
                {dashboardData && <Horizontal data={getDetails()} />}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600 mb-4">
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
