import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

// ลบการตรวจสอบ token เนื่องจากใช้ httpOnly cookies
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

// Interfaces
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    tension: number;
  }[];
}

export interface ForwardDetail {
  total_success: number;
  total_fail: number;
}

export interface Forward {
  total: number;
}

// Day Response
export interface DashboardDayResponse {
  success: boolean;
  data: {
    date: string;
    hours: {
      hour: string;
      forwards: Forward[];
      details: ForwardDetail[];
    }[];
    chart: ChartData;
  };
}

// Month Response
export interface DashboardMonthResponse {
  success: boolean;
  data: {
    month: string;
    days: {
      date: string;
      forwards: Forward[];
      details: ForwardDetail[];
    }[];
    chart: ChartData;
  };
}

// Year Response
export interface DashboardYearResponse {
  success: boolean;
  data: {
    year: string;
    months: {
      date: string;
      forwards: Forward[];
      details: ForwardDetail[];
    }[];
    chart: ChartData;
  };
}

// Total Response
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

// API Functions
export const getDashboardDay = async (
  date: string,
  userId: string
): Promise<DashboardDayResponse> => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/dashboard-user/day`, {
      params: {
        date,
        userId,
      },
      headers: getHeaders(),
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard day data:', error);
    throw error;
  }
};

export const getDashboardMonth = async (
  month: string,
  userId: string
): Promise<DashboardMonthResponse> => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/dashboard-user/month`, {
      params: {
        month,
        userId,
      },
      headers: getHeaders(),
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard month data:', error);
    throw error;
  }
};

export const getDashboardYear = async (
  year: string,
  userId: string
): Promise<DashboardYearResponse> => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/dashboard-user/year`, {
      params: {
        year,
        userId,
      },
      headers: getHeaders(),
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard year data:', error);
    throw error;
  }
};

export const getDashboardTotal = async (
  userId: string
): Promise<DashboardTotalResponse> => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/dashboard-user/total`, {
      params: {
        userId,
      },
      headers: getHeaders(),
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard total data:', error);
    throw error;
  }
};
