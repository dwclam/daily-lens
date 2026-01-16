import axiosClient from './axiosClient';

const commentApi = {
  create: (content, postId) => {
    return axiosClient.post('/comments', { content, postId });
  },
  
  delete: (id) => {
    return axiosClient.delete(`/comments/${id}`);
  },

  update: (id, content) => {
    return axiosClient.patch(`/comments/${id}`, { content });
  },

};

export default commentApi;
