import axiosClient from './axiosClient';

const followApi = {
  // Follow một user
  follow: (userId) => {
    return axiosClient.post(`/follow/${userId}`);
  },

  // Unfollow
  unfollow: (userId) => {
    return axiosClient.delete(`/follow/${userId}`);
  },

  // Kiểm tra xem mình có đang follow người này không
  checkIsFollowing: (userId) => {
    return axiosClient.get(`/follow/${userId}/is-following`);
  },

  // Lấy danh sách đang follow (Optional)
  getMyFollowing: () => {
    return axiosClient.get('/follow/my-following');
  },

  // Lấy danh sách follower (Optional)
  getMyFollowers: () => {
    return axiosClient.get('/follow/my-followers');
  }
};

export default followApi;