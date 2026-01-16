import axiosClient from './axiosClient';

const postApi = {
  getAll: () => {
    return axiosClient.get('/posts');
  },

  getById: (id) => {
    return axiosClient.get(`/posts/${id}`);
  },

  // 👇 SỬA HÀM NÀY
  create: (data) => {
    // data bây giờ là một đối tượng FormData
    return axiosClient.post('/posts', data, {
      headers: {
        'Content-Type': 'multipart/form-data', // 👈 Quan trọng để gửi file
      },
    });
  },

  update: (id, data) => {
    return axiosClient.patch(`/posts/${id}`, data);
  },

  delete: (id) => {
    return axiosClient.delete(`/posts/${id}`);
  }
};

export default postApi;