// Telegram and Resive Group API
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

// Interface for Telegram Channels
export interface TelegramChannel {
  id: string;
  title: string;
  type: 'group' | 'channel';
}

export interface ResiveGroup {
  rg_id: number;
  userid: number;
  rg_name: string;
  rg_tid: string;
}

// Fetch Resive Groups from Database
export const getGroupsFromDatabase = async (
  userId: string
): Promise<ResiveGroup[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/resive-group`, {
      params: { userId },
    });
    return response.data.groups;
  } catch (error) {
    throw new Error('Failed to fetch groups from database');
  }
};

// Add a New Resive Group
export const postGroupToDatabase = async (
  userId: string,
  rgName: string,
  rgTid: string
): Promise<{ message: string; groupId: number }> => {
  try {
    const response = await axios.post(`${API_URL}/api/v1/resive-group`, {
      userId,
      rg_name: rgName,
      rg_tid: rgTid,
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to add group to database');
  }
};

// Delete a Resive Group
export const deleteGroupFromDatabase = async (
  rgId: string,
  userId: string
): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/api/v1/resive-group/${rgId}`, {
      data: { userId },
    });
  } catch (error) {
    throw new Error('Failed to delete group from database');
  }
};

export const getChannels = async (userId: string) => {
  const response = await axios.post(`${API_URL}/api/v1/channels`, { userId });
  return response.data;
};
