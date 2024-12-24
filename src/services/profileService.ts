import axios from 'axios';

import { AdminProfileResponse } from '@/types/AdminType';
import { UserProfileResponse } from '@/types/UserType';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

export const getUserProfile = async (): Promise<UserProfileResponse> => {
  const response = await axios.get(`${API_URL}/api/v1/userProfile`);
  return response.data;
};

export const getAdminProfiles = async (): Promise<AdminProfileResponse> => {
  const response = await axios.get(`${API_URL}/api/v1/adminProfile`);
  return response.data;
};
