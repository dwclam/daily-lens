import axiosClient from './axiosClient';

const userApi = {
  getById: (id) => {
    return axiosClient.get(`/user/${id}`);
  },

  getAll: () => {
    return axiosClient.get('/user');
  },

  search: (keyword) => {
    return axiosClient.get('/user/search', { params: { keyword } });
  },

  update: (id, data) => {
    return axiosClient.patch(`/user/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    });
  },

  delete: (id) => {
    return axiosClient.delete(`/user/${id}`);
  },

  updateRole: (id, role) => {
    return axiosClient.put(`/user/${id}/role`, { role });
  }
};

export default userApi;