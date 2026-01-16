import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import NotificationSidebar from '../components/NotificationSidebar';
import postApi from '../api/postApi';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postApi.getAll();
        setPosts(response.data);
      } catch (error) {
        console.error("Failed to fetch posts", error);
      }
    };
    fetchPosts();
  }, []);

  // 👇 SỬA HÀM NÀY: Thêm logic gọi API xóa bài
  const handleDeletePost = async (id) => {
    // 1. Gọi API xóa dưới Database
    try {
      await postApi.delete(id);

      // 2. Nếu xóa thành công thì mới cập nhật giao diện (xóa khỏi state)
      setPosts(posts.filter(p => p.id !== id));

      // (Tuỳ chọn) Thông báo nhỏ
      // alert("Đã xóa bài viết!");
    } catch (error) {
      console.error("Failed to delete post", error);
      alert("Xóa thất bại! Có thể bạn không phải chủ bài viết hoặc lỗi server.");
    }
  };

  return (
    // Main Wrapper
    <div style={styles.mainWrapper}>

      {/* CỘT FEED (Giữa) */}
      <div style={styles.feedColumn}>
        {posts.map(post => (
          <div id={`post-${post.id}`} key={post.id}>
            <PostCard
              post={post}
              onDelete={handleDeletePost}
              currentUserId={currentUserId}
            />
          </div>
        ))}
        {posts.length === 0 && <p style={{textAlign: 'center', color: '#8e8e8e'}}>Chưa có bài viết nào.</p>}
      </div>

      {/* CỘT THÔNG BÁO (Phải) */}
      <div style={styles.sidebarColumn}>
        <NotificationSidebar />
      </div>

    </div>
  );
};

const styles = {
  mainWrapper: {
    display: 'flex',
    justifyContent: 'center', // Căn giữa cả cụm
    alignItems: 'flex-start', // Căn hàng trên cùng (để Sidebar không bị tụt)
    paddingTop: '30px',
    gap: '64px',
    width: '100%',
    maxWidth: '1000px',
    margin: '0 auto'
  },

  feedColumn: {
    width: '470px',
    flexShrink: 0
  },

  sidebarColumn: {
    width: '320px',
    display: 'block',
    flexShrink: 0
  }
};

export default HomePage;