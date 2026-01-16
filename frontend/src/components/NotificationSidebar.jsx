import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const ReloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6"></path>
    <path d="M1 20v-6h6"></path>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);

const NotificationSidebar = () => {
  const [notifPosts, setNotifPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/posts/my-notifications');
      setNotifPosts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handlePostClick = async (post) => {
    try {
      await axiosClient.patch(`/posts/${post.id}/mark-checked`);
      setNotifPosts(prev => prev.filter(p => p.id !== post.id));
      const postElement = document.getElementById(`post-${post.id}`);
      if (postElement) {
        postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        postElement.style.border = "2px solid #0095f6";
        setTimeout(() => postElement.style.border = "1px solid #dbdbdb", 2000);
      } else {
        alert("Bài viết này đang ở trang khác!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- GIAO DIỆN ---
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Hoạt động mới ({notifPosts.length})</h3>
        <button
          onClick={fetchNotifs}
          style={{...styles.reloadBtn, transform: loading ? 'rotate(360deg)' : 'none', transition: 'transform 0.5s'}}
          disabled={loading}
          title="Làm mới"
        >
          <ReloadIcon />
        </button>
      </div>

      {notifPosts.length === 0 ? (
        <div style={styles.emptyState}>Hiện không có thông báo mới.</div>
      ) : (
        <div style={styles.list}>
          {notifPosts.map(post => (
            <div key={post.id} onClick={() => handlePostClick(post)} style={styles.item}>
              <img src={post.imageUrl} alt="" style={styles.thumb} onError={(e) => e.target.style.display='none'}/>
              <div style={styles.info}>
                <div style={styles.caption}>{post.caption || 'Bài viết không tiêu đề'}</div>
                <div style={styles.time}>Có tương tác mới!</div>
              </div>
              <div style={styles.dot}></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  // 👇 SỬA QUAN TRỌNG: Dùng sticky thay vì fixed
  container: {
    position: 'sticky', // Trượt theo khi cuộn
    top: '80px',        // Cách mép trên (tránh Navbar)
    width: '100%',      // Chiếm hết chiều rộng cột cha
    backgroundColor: '#fff',
    // border: '1px solid #dbdbdb', // Có thể bỏ border nếu muốn nhìn thoáng hơn
    // borderRadius: '8px',
    padding: '0 0 0 20px', // Padding trái để tách biệt với cột Post
    boxSizing: 'border-box',
    maxHeight: 'calc(100vh - 100px)', // Chiều cao tối đa bằng màn hình
    overflowY: 'auto' // Cuộn riêng nếu danh sách quá dài
  },

  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  title: { fontSize: '16px', fontWeight: 'bold', margin: 0, color: '#8e8e8e' }, // Màu xám nhạt cho tiêu đề phụ

  reloadBtn: { border: 'none', background: 'transparent', cursor: 'pointer', color: '#262626', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  emptyState: { fontSize: '13px', color: '#8e8e8e', fontStyle: 'italic' },

  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  item: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px', borderRadius: '6px', transition: 'background 0.2s', ':hover': { backgroundColor: '#fafafa' } },
  thumb: { width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#eee' },
  info: { flex: 1, overflow: 'hidden' },
  caption: { fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#262626' },
  time: { fontSize: '11px', color: '#0095f6', fontWeight: '500' }, // Đổi màu xanh cho nhẹ mắt
  dot: { width: '6px', height: '6px', backgroundColor: '#0095f6', borderRadius: '50%' }
};

export default NotificationSidebar;