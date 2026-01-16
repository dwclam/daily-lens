import axiosClient from './axiosClient';

const authApi = {
  // Đăng nhập
  login: (email, password) => {
    return axiosClient.post('/auth/login', { email, password });
  },
  
  // Đăng ký (Gọi vào User Controller)
  register: (data) => {
    // data gồm: username, email, password, ...
    return axiosClient.post('/user', data);
  },

  // Lấy thông tin user hiện tại
  getProfile: () => {
    return axiosClient.get('/auth/profile');
  },

  // Đăng xuất (Xóa token ở client)
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
  }
};

export default authApi;
