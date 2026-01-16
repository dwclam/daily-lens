import axiosClient from './axiosClient';

const likeApi = {
  toggleLike: (postId) => {
    return axiosClient.post(`/likes/${postId}`);
  }
};

export default likeApi;
