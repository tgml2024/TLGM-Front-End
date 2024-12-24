import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

let isRefreshing = false;
let failedQueue: Array<any> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom: any) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

export const refreshToken = () => {
  return new Promise<string>((resolve, reject) => {
    if (isRefreshing) {
      failedQueue.push({ resolve, reject });
    } else {
      isRefreshing = true;
      axios
        .post(`${API_URL}/api/v1/refresh-token`, null, {
          withCredentials: true, // Send cookies
        })
        .then((response) => {
          isRefreshing = false;
          processQueue(null, response.data.access_token);
          resolve(response.data.access_token);
        })
        .catch((error) => {
          isRefreshing = false;
          processQueue(error, null);
          reject(error);
        });
    }
  });
};
