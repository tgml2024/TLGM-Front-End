import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    tension: number;
  }[];
}

export interface DashboardDayResponse {
  success: boolean;
  data: {
    date: string;
    hours: {
      hour: string;
      forwards: { total: number }[];
      details: { total_success: number; total_fail: number }[];
    }[];
    chart: ChartData;
  };
}

export interface DashboardMonthResponse {
  success: boolean;
  data: {
    month: string;
    days: {
      date: string;
      forwards: { total: number }[];
      details: { total_success: number; total_fail: number }[];
    }[];
    chart: ChartData;
  };
}

export interface DashboardYearResponse {
  success: boolean;
  data: {
    year: string;
    months: {
      date: string;
      forwards: { total: number }[];
      details: { total_success: number; total_fail: number }[];
    }[];
    chart: ChartData;
  };
}

export interface DashboardTotalResponse {
  success: boolean;
  data: {
    summary: {
      total_forwards: number;
      total_success: number;
      total_fail: number;
    };
  };
}

export const getDashboardDay = async (
  date: string
): Promise<DashboardDayResponse> => {
  const response = await axios.get(`${API_URL}/api/v1/dashboard-admin/day`, {
    params: { date },
  });
  return response.data;
};

export const getDashboardMonth = async (
  month: string
): Promise<DashboardMonthResponse> => {
  const response = await axios.get(`${API_URL}/api/v1/dashboard-admin/month`, {
    params: { month },
  });
  return response.data;
};

export const getDashboardYear = async (
  year: string
): Promise<DashboardYearResponse> => {
  const response = await axios.get(`${API_URL}/api/v1/dashboard-admin/year`, {
    params: { year },
  });
  return response.data;
};

export const getDashboardTotal = async (): Promise<DashboardTotalResponse> => {
  const response = await axios.get(`${API_URL}/api/v1/dashboard-admin/total`);
  return response.data;
};
