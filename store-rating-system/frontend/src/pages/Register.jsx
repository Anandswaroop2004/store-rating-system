import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, User, Mail, Lock, MapPin, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear specific error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Form validations strictly adhering to PDF requirements
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/;
    const uppercaseRegex = /[A-Z]/;

    // 1. Name: Min 20 characters, Max 60 characters
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 20 || formData.name.trim().length > 60) {
      newErrors.name = `Name must be between 20 and 60 characters (currently ${formData.name.trim().length}).`;
    }

    // 2. Email: standard email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    // 3. Address: Max 400 characters
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required.';
    } else if (formData.address.trim().length > 400) {
      newErrors.address = `Address cannot exceed 400 characters (currently ${formData.address.trim().length}).`;
    }

    // 4. Password: 8-16 characters, >= 1 uppercase, >= 1 special character
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8 || formData.password.length > 16) {
      newErrors.password = 'Password must be between 8 and 16 characters.';
    } else if (!uppercaseRegex.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter (A-Z).';
    } else if (!specialCharRegex.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character (!@#$%^&* etc.).';
    }

    // Confirm password match
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
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
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        password: formData.password
      });

      // Normal user successfully registered and logged in -> redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.message || 'Registration failed. Please check the inputs.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Helper autofill for testing validation quickly with Indian data
  const fillSample = () => {
    setFormData({
      name: 'Vikramaditya Rajesh Sharma', // 26 chars (between 20 and 60)
      email: `vikram_${Date.now()}@storerating.in`,
      address: 'Flat 402, Shanti Kunj Apartments, F.C. Road, Shivajinagar, Pune, Maharashtra 411005',
      password: 'User@1234',
      confirmPassword: 'User@1234'
    });
    setErrors({});
    setServerError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide animate-fade-in">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <Store size={32} color="#ffffff" />
          </div>
          <h1 className="auth-title">Create an Account</h1>
          <p className="auth-subtitle">Register as a Normal User to browse and rate stores</p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name Field */}
          <div className="form-group">
            <div className="flex-between">
              <label className="form-label" htmlFor="name">
                Full Name <span className="text-muted">(20 - 60 characters)</span>
              </label>
              <span className="char-counter">{formData.name.trim().length} / 60</span>
            </div>
            <div className="input-with-icon">
              <User className="input-icon" size={18} />
              <input
                id="name"
                name="name"
                type="text"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g. Vikramaditya Rajesh Sharma"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                name="email"
                type="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          {/* Address Field */}
          <div className="form-group">
            <div className="flex-between">
              <label className="form-label" htmlFor="address">
                Full Address <span className="text-muted">(Max 400 characters)</span>
              </label>
              <span className="char-counter">{formData.address.trim().length} / 400</span>
            </div>
            <div className="input-with-icon">
              <MapPin className="input-icon" size={18} style={{ top: '16px' }} />
              <textarea
                id="address"
                name="address"
                rows="2"
                className={`form-input form-textarea ${errors.address ? 'input-error' : ''}`}
                placeholder="Enter street, city, state, zip code..."
                value={formData.address}
                onChange={handleChange}
              ></textarea>
            </div>
            {errors.address && <p className="form-error">{errors.address}</p>}
          </div>

          {/* Passwords grid */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password <span className="text-muted">(8-16 chars, 1 uppercase, 1 special)</span>
              </label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  placeholder="e.g. User@1234"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Helper button */}
          <div style={{ marginBottom: '16px', textAlign: 'right' }}>
            <button
              type="button"
              className="btn-text"
              onClick={fillSample}
              style={{ fontSize: '0.8125rem' }}
            >
              Fill valid sample values
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? (
              <span className="flex-center" style={{ gap: '8px' }}>
                <span className="spinner-sm"></span> Registering...
              </span>
            ) : (
              <span className="flex-center" style={{ gap: '8px' }}>
                <UserPlus size={18} /> Register Account
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
