import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

interface LoginResponse {
  message: string;
  user: {
    id: number;
    username: string;
    name: string;
    role: number;
  };
}

export const login = async (data: {
  username: string;
  password: string;
}): Promise<LoginResponse> => {
  const response = await axios.post(`${API_URL}/api/v1/login`, data);
  return response.data;
};
