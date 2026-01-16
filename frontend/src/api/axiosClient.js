import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000', // Port của Backend NestJS
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Interceptor Request: Tự động gắn Access Token vào Header
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Interceptor Response: Tự động Refresh Token khi gặp lỗi 401
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 (Unauthorized) và chưa từng thử refresh request này
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            // Không có refresh token -> Bắt buộc login lại
            throw new Error("No refresh token available");
        }

        // Gọi API refresh token của Backend
        // Lưu ý: Backend yêu cầu Bearer Token trong header cho endpoint này
        const response = await axios.post('http://localhost:3000/auth/refresh', {}, {
            headers: {
                Authorization: `Bearer ${refreshToken}`
            }
        });

        // Backend trả về: { id, email, token }
        const { token } = response.data;

        // Lưu token mới vào LocalStorage
        localStorage.setItem('accessToken', token);

        // Gắn token mới vào header của request bị lỗi ban đầu và gọi lại
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return axiosClient(originalRequest);

      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        // Xóa sạch token và chuyển hướng về trang login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
