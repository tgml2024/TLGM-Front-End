import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

// Response interfaces
interface BaseResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
}

interface InitializeResponse extends BaseResponse {
  message: string;
}

interface BeginForwardingResponse extends BaseResponse {
  settings?: {
    forward_interval: number;
    initialMessageCount: number;
  };
}

interface StopForwardingResponse extends BaseResponse {
  message: string;
}

export interface ForwardingStatusResponse extends BaseResponse {
  status: number;
  currentForward: {
    status: number;
    forward_interval: number;
    created_at?: string;
    last_updated?: string;
  };
  messageInfo?: {
    messageId: string;
    text: string;
    date: Date;
  };
  clientInfo?: {
    createdAt: string;
    lastUsed: string;
    uptime: number;
    isConnected: boolean;
  };
}

interface DashboardAdminResponse extends BaseResponse {
  data: {
    daily: {
      forwards: Array<{
        date: string; // Format: 'YYYY-MM-DD'
        total_forwards: number;
      }>;
      details: Array<{
        date: string; // Format: 'YYYY-MM-DD'
        total_success: number;
        total_fail: number;
      }>;
    };
    weekly: {
      forwards: Array<{
        week: string; // Format: 'YYYYWW' or similar
        total_forwards: number;
      }>;
      details: Array<{
        week: string; // Format: 'YYYYWW' or similar
        total_success: number;
        total_fail: number;
      }>;
    };
    monthly: {
      forwards: Array<{
        month: string; // Format: 'YYYY-MM'
        total_forwards: number;
      }>;
      details: Array<{
        month: string; // Format: 'YYYY-MM'
        total_success: number;
        total_fail: number;
      }>;
    };
    yearly: {
      forwards: Array<{
        year: number; // Format: YYYY
        total_forwards: number;
      }>;
      details: Array<{
        year: number; // Format: YYYY
        total_success: number;
        total_fail: number;
      }>;
    };
  };
}

interface ActiveForwardersResponse extends BaseResponse {
  activeForwarders: number;
}

// Request interfaces
interface BeginForwardingRequest {
  userId: number;
  sourceChatId: string;
  destinationChatIds: string[];
  forward_interval?: number;
}

// Service functions
export const initializeForwarding = async (
  userId: number
): Promise<InitializeResponse> => {
  const response = await axios.post<InitializeResponse>(
    `${API_URL}/api/v1/initialize`,
    { userId }
  );
  return response.data;
};

export const beginForwarding = async (
  data: BeginForwardingRequest
): Promise<BeginForwardingResponse> => {
  try {
    const response = await axios.post<BeginForwardingResponse>(
      `${API_URL}/api/v1/begin-forwarding`,
      {
        userId: data.userId,
        sourceChatId: data.sourceChatId,
        destinationChatIds: data.destinationChatIds,
        forward_interval: data.forward_interval || 5,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || 'Failed to begin forwarding'
      );
    }
    throw error;
  }
};

export const stopContinuousForward = async (
  userId: number
): Promise<StopForwardingResponse> => {
  const response = await axios.post<StopForwardingResponse>(
    `${API_URL}/api/v1/stop-continuous-forward`,
    { userId }
  );
  return response.data;
};

export const checkForwardingStatus = async (
  userId: number
): Promise<ForwardingStatusResponse> => {
  const response = await axios.post<ForwardingStatusResponse>(
    `${API_URL}/api/v1/check-forwarding-status`,
    { userId }
  );
  return response.data;
};

export const getActiveForwarders =
  async (): Promise<ActiveForwardersResponse> => {
    const response = await axios.get(`${API_URL}/api/v1/get-active-forwarders`);
    return response.data;
  };

export const dashboardAdmin = async (): Promise<DashboardAdminResponse> => {
  const response = await axios.get(`${API_URL}/api/v1/dashboard-admin`);
  return response.data;
};
