import axios from "axios";

// Cấu hình baseURL dựa trên môi trường và domain hiện tại
const getBaseURL = () => {
  const hostname = window.location.hostname;
  
  // Nếu đang chạy trên domain chính thức
  if (hostname === 'www.rmsystem.store' || hostname === 'rmsystem.store') {
    return 'https://rm-system-4tru.vercel.app';
  }
  
  // Nếu đang chạy local
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:9999';
  }
  
  // Default production URL
  return 'https://rm-system-4tru.vercel.app';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

const axiosRaw = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

// Request interceptor - thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('[Axios Request]', config.method?.toUpperCase(), config.url);
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[Axios Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý response và errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Log tất cả responses trong development hoặc khi có lỗi
    console.log('[Axios Response]', response.config.url, response.status, response.data);
    return response.data;
  },
  async (error) => {
    console.error('[Axios Error]', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    const originalRequest = error.config;

    // Handle token refresh
    if (error.response?.status === 410 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('[Axios] Attempting token refresh...');

      try {
        const refreshResponse = await axiosRaw.post('/api/users/refresh-token');
        console.log('[Axios] Token refresh response:', refreshResponse);

        const newAccessToken = refreshResponse.data.accessToken;
        if (newAccessToken) {
          localStorage.setItem('token', newAccessToken);
          console.log('[Axios] New access token set');
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('[Axios] Token refresh failed:', refreshError);
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle unauthorized access
    if (error.response?.status === 401) {
      console.log('[Axios] Unauthorized access, redirecting to login...');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;