import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

interface RegisterResponse {
  message: string;
  user: {
    username: string;
    password: string;
    name: string;
  };
}

export const Register = async (data: {
  username: string;
  password: string;
  name: string;
}): Promise<RegisterResponse> => {
  const response = await axios.post(`${API_URL}/api/v1/register`, data);
  return response.data;
};
