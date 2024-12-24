import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

export const startClient = async (
  apiId: string,
  apiHash: string,
  userid: string
) => {
  try {
    const response = await axios.post(`${API_URL}/api/v1/start`, {
      apiId,
      apiHash,
      userid,
    });
    if (response.status === 200) {
      return response.data;
    }
    throw new Error(response.data.error || 'Unknown error occurred');
  } catch (error: any) {
    throw (
      error.response?.data?.error || error.message || 'Failed to start client'
    );
  }
};

export const sendPhone = async (
  apiId: string,
  phoneNumber: string,
  userid: string
) => {
  const response = await axios.post(`${API_URL}/api/v1/send-phone`, {
    apiId,
    phoneNumber,
    userid,
  });
  return response.data;
};

export const verifyCode = async (
  apiId: string,
  phoneNumber: string,
  otpCode: string,
  phoneCodeHash: string,
  userid: string // รับ userid
) => {
  const response = await axios.post(`${API_URL}/api/v1/verify-code`, {
    apiId,
    phoneNumber,
    code: otpCode,
    phoneCodeHash,
    userid, // ส่ง userid ไป backend
  });
  return response.data;
};

export const getChannels = async (apiId: string) => {
  const response = await axios.get(`${API_URL}/api/v1/channels/${apiId}`);
  return response.data;
};

export const stopClient = async (apiId: string, userid: string) => {
  const response = await axios.put(`${API_URL}/api/v1/stop/${apiId}`, {
    userid,
  });
  return response.data;
};
