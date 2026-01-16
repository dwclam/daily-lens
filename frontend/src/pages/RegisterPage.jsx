import React, { useState } from 'react';
import authApi from '../api/authApi';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    isActive: true
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.register(formData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Username or Email might be taken.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h1 style={styles.logo}>Daily Lens</h1>
        <h2 style={styles.subtitle}>Sign up to see photos and videos from your friends.</h2>
        
        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          
          <p style={styles.terms}>
            By signing up, you agree to our Terms, Data Policy and Cookies Policy.
          </p>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Signing up...' : 'Sign up'}
          </button>
          
          {error && <p style={styles.error}>{error}</p>}
        </form>
      </div>

      <div style={styles.loginBox}>
        <p style={styles.loginText}>
          Have an account? <Link to="/login" style={styles.loginLink}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  wrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#fafafa' },
  container: { backgroundColor: '#fff', border: '1px solid #dbdbdb', borderRadius: '1px', padding: '40px', width: '350px', marginBottom: '10px', textAlign: 'center' },
  logo: { fontFamily: 'cursive', fontSize: '40px', marginBottom: '10px', marginTop: '10px' },
  subtitle: { color: '#8e8e8e', fontSize: '17px', fontWeight: 'bold', lineHeight: '20px', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column' },
  inputGroup: { marginBottom: '6px' },
  input: { width: '100%', padding: '9px 8px', border: '1px solid #dbdbdb', borderRadius: '3px', backgroundColor: '#fafafa', fontSize: '12px', boxSizing: 'border-box' },
  button: { marginTop: '15px', padding: '7px', backgroundColor: '#0095f6', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  error: { color: '#ed4956', fontSize: '14px', marginTop: '15px' },
  terms: { color: '#8e8e8e', fontSize: '12px', margin: '15px 0', lineHeight: '16px' },
  loginBox: { backgroundColor: '#fff', border: '1px solid #dbdbdb', borderRadius: '1px', padding: '20px', width: '350px', textAlign: 'center' },
  loginText: { fontSize: '14px', margin: 0 },
  loginLink: { color: '#0095f6', fontWeight: 'bold', textDecoration: 'none' }
};

export default RegisterPage;
