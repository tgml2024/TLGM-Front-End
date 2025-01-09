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
    if (axios.isAxiosError(error)) {
      // ถ้าเป็น 404 ให้ return array ว่างเงียบๆ
      if (error.response?.status === 404) {
        return [];
      }
    }
    return []; // ส่งคืน array ว่างสำหรับทุกกรณี error
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
      userId: Number(userId),
      rg_name: rgName,
      rg_tid: rgTid,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error;
    }
    throw error;
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

// Update delete function to handle multiple groups
export const deleteGroupsFromDatabase = async (
  rgIds: number[],
  userId: string
): Promise<{ message: string; deletedCount: number; groupIds: number[] }> => {
  try {
    const requestData = {
      rg_ids: rgIds,
      userId: Number(userId),
    };

    const response = await axios.delete(`${API_URL}/api/v1/resive-group`, {
      data: requestData,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error;
    }
    throw error;
  }
};

export const getChannels = async (userId: string) => {
  const response = await axios.post(`${API_URL}/api/v1/channels`, { userId });
  return response.data;
};
