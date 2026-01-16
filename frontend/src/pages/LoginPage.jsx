import React, { useState } from 'react';
import authApi from '../api/authApi';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authApi.login(email, password);
      // Backend trả về: { id, token, refreshToken, username, avatar, role }
      // 👇 MỚI: Lấy thêm biến role
      const { token, refreshToken, id, username, avatar, role } = response.data;

      // Lưu vào LocalStorage
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userId', id);
      localStorage.setItem('username', username);
      localStorage.setItem('avatar', avatar || '');

      // 👇 MỚI: Lưu Role để dùng phân quyền
      localStorage.setItem('role', role);

      // Reload trang để App.jsx cập nhật trạng thái isAuthenticated
      window.location.href = '/';
    } catch (err) {
      setError('Sorry, your password was incorrect. Please double-check your password.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h1 style={styles.logo}>Daily Lens</h1>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          {error && <p style={styles.error}>{error}</p>}
        </form>

        <div style={styles.divider}>
          <div style={styles.line}></div>
          <div style={styles.or}>OR</div>
          <div style={styles.line}></div>
        </div>

        <div style={styles.forgotPassword}>
          <a href="#" style={{textDecoration: 'none', fontSize: '12px', color: '#00376b'}}>Forgot password?</a>
        </div>
      </div>

      <div style={styles.signupBox}>
        <p style={styles.signupText}>
          Don't have an account? <Link to="/register" style={styles.signupLink}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  wrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#fafafa' },
  container: { backgroundColor: '#fff', border: '1px solid #dbdbdb', borderRadius: '1px', padding: '40px', width: '350px', marginBottom: '10px', textAlign: 'center' },
  logo: { fontFamily: 'cursive', fontSize: '40px', marginBottom: '30px', marginTop: '10px' },
  form: { display: 'flex', flexDirection: 'column' },
  inputGroup: { marginBottom: '6px' },
  input: { width: '100%', padding: '9px 8px', border: '1px solid #dbdbdb', borderRadius: '3px', backgroundColor: '#fafafa', fontSize: '12px', boxSizing: 'border-box' },
  button: { marginTop: '15px', padding: '7px', backgroundColor: '#0095f6', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  error: { color: '#ed4956', fontSize: '14px', marginTop: '15px' },
  divider: { display: 'flex', alignItems: 'center', margin: '20px 0' },
  line: { flex: 1, height: '1px', backgroundColor: '#dbdbdb' },
  or: { margin: '0 15px', color: '#8e8e8e', fontSize: '13px', fontWeight: 'bold' },
  forgotPassword: { marginTop: '10px' },
  signupBox: { backgroundColor: '#fff', border: '1px solid #dbdbdb', borderRadius: '1px', padding: '20px', width: '350px', textAlign: 'center' },
  signupText: { fontSize: '14px', margin: 0 },
  signupLink: { color: '#0095f6', fontWeight: 'bold', textDecoration: 'none' }
};

export default LoginPage;