import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:9999',
  timeout: 10000,
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

const axiosRaw = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:9999',
  timeout: 10000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Only log in development mode and for specific debugging
    if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_DEBUG_API === 'true') {
      console.log('Response:', response.status, response.data);
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh
    if (error.response?.status === 410 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshResponse = await axiosRaw.post('/api/users/refresh-token');

        // Update token in localStorage
        if (refreshResponse.accessToken) {
          localStorage.setItem('token', refreshResponse.accessToken);
          // Update axios headers
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${refreshResponse.accessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.accessToken}`;
        }

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle unauthorized access
    if (error.response?.status === 401) {
      // Clear any stored auth data and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    console.error('Response error:', error.response ? error.response.data : error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;