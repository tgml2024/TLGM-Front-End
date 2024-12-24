import axios from 'axios';
import Router from 'next/router';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response.data.message === 'No tokens provided'
    ) {
      toast('กรุณาเข้าสู่ระบบก่อนใช้งาน', {
        icon: '⚠️',
      });
      Router.push('/login');
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      error.response.data.message === 'Access token missing, refresh required'
    ) {
      try {
        const response = await axiosInstance.post('/api/v1/refresh-token'); // แก้ไขให้เรียกใช้งาน refreshToken endpoint
        const newAccessToken = response.data.accessToken;

        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        toast.success('ต่ออายุเซสชั่นเรียบร้อยแล้ว');
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        toast.error('เซสชั่นหมดอายุ. กรุณาเข้าสู่ระบบอีกครั้ง.');
        Router.push('/login');
        return Promise.reject(refreshError);
      }
    }

    if (
      error.response?.status === 403 &&
      error.response.data.message === 'Invalid access token'
    ) {
      toast.error('เซสชั่นไม่ถูกต้อง. กรุณาเข้าสู่ระบบอีกครั้ง.');
      Router.push('/login');
      return Promise.reject(error);
    }

    if (
      error.response?.status === 403 &&
      error.response.data.message === 'Invalid refresh token'
    ) {
      toast.error('มีบางอย่างไม่ถูกต้อง. กรุณาเข้าสู่ระบบใหม่.');
      Router.push('/login');
      return Promise.reject(error);
    }

    if (
      error.response?.status &&
      error.response?.status !== 401 &&
      error.response?.status !== 403
    ) {
      toast.error(`เกิดข้อผิดพลาด : ${error.response.status}`);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
