import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

// Interface for Sending Groups
export interface SendingGroup {
  sg_id: number;
  userid: number;
  sg_name: string;
  message: string;
  sg_tid?: string;
}

// Fetch Sending Groups from Database
export const getSandingGroupsFromDatabase = async (
  userId: string
): Promise<SendingGroup[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/sanding-group`, {
      params: { userId },
    });
    return response.data.groups;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch groups');
  }
};

// Add a New Sending Group
export const postSandingGroupToDatabase = async (
  userId: string,
  sgName: string,
  message: string,
  sgTid?: string
): Promise<{ message: string; groupId: number }> => {
  try {
    const response = await axios.post(`${API_URL}/api/v1/sanding-group`, {
      userId,
      sg_name: sgName,
      message,
      sg_tid: sgTid,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to add group');
  }
};

// Delete a Sending Group
export const deleteSandingGroupFromDatabase = async (
  sgId: string,
  userId: string
): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/api/v1/sanding-group`, {
      data: { sg_id: sgId, userId },
    });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete group');
  }
};
