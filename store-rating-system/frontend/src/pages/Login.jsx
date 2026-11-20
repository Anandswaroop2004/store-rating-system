import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Validate form fields on frontend
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const loggedInUser = await login(email.trim(), password);

      // Redirect based on role
      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else if (loggedInUser.role === 'owner') {
        navigate('/owner');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Demo account autofill for quick reviewer testing
  const autofill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrors({});
    setServerError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <Store size={32} color="#ffffff" />
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to Store Rating Management System</p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type="password"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? (
              <span className="flex-center" style={{ gap: '8px' }}>
                <span className="spinner-sm"></span> Signing in...
              </span>
            ) : (
              <span className="flex-center" style={{ gap: '8px' }}>
                <LogIn size={18} /> Sign In
              </span>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Autofill */}
        <div className="demo-credentials-box">
          <p className="demo-title">Quick Test Credentials (1-Click Fill):</p>
          <div className="demo-buttons">
            <button
              type="button"
              className="demo-btn"
              onClick={() => autofill('admin@storerating.in', 'Admin@1234')}
            >
              👑 System Admin
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => autofill('ramesh.choudhary@vijaysales.in', 'Owner@1234')}
            >
              🏪 Store Owner
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => autofill('aarav.deshmukh@gmail.com', 'User@1234')}
            >
              👤 Normal User
            </button>
          </div>
        </div>

        {/* Signup Link */}
        <div className="auth-footer">
          Don't have an account yet?{' '}
          <Link to="/register" className="auth-link">
            Sign up as Normal User
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
