import React from 'react';
import { Link } from 'react-router-dom';
import authApi from '../api/authApi';

const Navbar = () => {
  const isAuthenticated = !!localStorage.getItem('accessToken');

  const handleLogout = () => {
    authApi.logout();

    // 👇 MỚI THÊM: Xóa thông tin user
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');

    // Reload lại trang
    window.location.href = '/login';
  };

  if (!isAuthenticated) return null;

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>Daily Lens</Link>
        <div style={styles.links}>
          <Link to="/" style={styles.link}>Home</Link>
          <Link to="/create-post" style={styles.link}>Create Post</Link>
          <Link to="/profile" style={styles.link}>Profile</Link>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: { backgroundColor: '#fff', borderBottom: '1px solid #dbdbdb', padding: '10px 0', position: 'sticky', top: 0, zIndex: 100 },
  container: { maxWidth: '935px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' },
  logo: { fontSize: '24px', fontWeight: 'bold', textDecoration: 'none', color: '#000', fontFamily: 'cursive' },
  links: { display: 'flex', gap: '20px', alignItems: 'center' },
  link: { textDecoration: 'none', color: '#000', fontWeight: '500' },
  logoutBtn: { backgroundColor: 'transparent', border: 'none', color: '#ed4956', cursor: 'pointer', fontWeight: '500' }
};

export default Navbar;