import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

interface AdminUser {
  userid: number;
  username: string;
  name: string;
  status: number;
}

interface GetAdminUsersResponse {
  users: AdminUser[];
}

export const getAdminUsers = async (): Promise<GetAdminUsersResponse> => {
  const response = await axios.get(`${API_URL}/api/v1/admin-users`);
  return response.data;
};

export const updateUserStatus = async (
  userid: number,
  status: number
): Promise<void> => {
  const response = await axios.put(`${API_URL}/api/v1/update-user-status`, {
    userId: userid.toString(),
    status,
  });
  return response.data;
};
