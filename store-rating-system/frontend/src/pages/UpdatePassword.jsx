import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Lock, KeyRound, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

const UpdatePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const uppercaseRegex = /[A-Z]/;
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/;

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required.';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required.';
    } else if (formData.newPassword.length < 8 || formData.newPassword.length > 16) {
      newErrors.newPassword = 'Password must be between 8 and 16 characters.';
    } else if (!uppercaseRegex.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter.';
    } else if (!specialCharRegex.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one special character.';
    }

    if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password cannot be the same as your current password.';
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'New passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await api.put('/auth/update-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (res.data.success) {
        setSuccessMessage('Password updated successfully! Please use your new password next time you sign in.');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      }
    } catch (err) {
      console.error('Password update error:', err);
      const msg = err.response?.data?.message || 'Failed to update password. Please check your current password.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <div className="container" style={{ maxWidth: '600px', marginTop: '20px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm mb-3"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="card animate-fade-in">
            <div className="card-header border-b pb-3 mb-4">
              <div className="flex-center-y" style={{ gap: '10px' }}>
                <div className="stat-icon-wrapper stat-icon-blue" style={{ width: '42px', height: '42px' }}>
                  <KeyRound size={22} />
                </div>
                <div>
                  <h2 className="panel-title">Update Your Password</h2>
                  <p className="panel-subtitle">Ensure your account stays secure with a strong password</p>
                </div>
              </div>
            </div>

            {/* Success Alert */}
            {successMessage && (
              <div className="alert alert-success mb-4">
                <CheckCircle2 size={18} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Error Alert */}
            {serverError && (
              <div className="alert alert-danger mb-4">
                <AlertCircle size={18} />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Current Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="currentPassword">
                  Current Password
                </label>
                <div className="input-with-icon">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    className={`form-input ${errors.currentPassword ? 'input-error' : ''}`}
                    placeholder="Enter your current password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                </div>
                {errors.currentPassword && <p className="form-error">{errors.currentPassword}</p>}
              </div>

              {/* New Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="newPassword">
                  New Password <span className="text-muted">(8-16 chars, 1 uppercase, 1 special)</span>
                </label>
                <div className="input-with-icon">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    className={`form-input ${errors.newPassword ? 'input-error' : ''}`}
                    placeholder="Enter new strong password"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                </div>
                {errors.newPassword && <p className="form-error">{errors.newPassword}</p>}
              </div>

              {/* Confirm New Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="confirmNewPassword">
                  Confirm New Password
                </label>
                <div className="input-with-icon">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    type="password"
                    className={`form-input ${errors.confirmNewPassword ? 'input-error' : ''}`}
                    placeholder="Re-enter new password"
                    value={formData.confirmNewPassword}
                    onChange={handleChange}
                  />
                </div>
                {errors.confirmNewPassword && <p className="form-error">{errors.confirmNewPassword}</p>}
              </div>

              {/* Submit */}
              <div className="form-actions mt-4">
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex-center" style={{ gap: '8px' }}>
                      <span className="spinner-sm"></span> Updating Password...
                    </span>
                  ) : (
                    <span className="flex-center" style={{ gap: '8px' }}>
                      <KeyRound size={18} /> Save New Password
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UpdatePassword;
