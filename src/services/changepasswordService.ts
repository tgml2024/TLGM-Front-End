import axios from 'axios';

// Set axios to include credentials globally
axios.defaults.withCredentials = true;

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

interface ChangePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

interface ChangePasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const ChangePassword = async (
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
  try {
    const response = await axios.post(
      `${API_URL}/api/v1/change-password`,
      data,
      {
        withCredentials: true, // Explicitly set for this request
      }
    );
    return response.data;
  } catch (error: any) {
    // Handle specific error messages from the backend
    if (error.response?.data) {
      throw new Error(error.response.data.message || error.response.data.error);
    }
    throw error;
  }
};
