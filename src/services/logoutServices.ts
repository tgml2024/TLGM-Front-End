import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

interface LogoutResponse {
  success: boolean;
  message: string;
}

export const logout = async (): Promise<LogoutResponse> => {
  const response = await axios.post(`${API_URL}/api/v1/logout`);
  return response.data;
};
