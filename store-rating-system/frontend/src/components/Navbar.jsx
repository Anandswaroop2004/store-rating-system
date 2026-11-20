import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, User, KeyRound, LogOut, ShieldCheck, ShoppingBag, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  const getRoleBadge = (userRole) => {
    switch (userRole) {
      case 'admin':
        return (
          <span className="badge badge-admin">
            <ShieldCheck size={14} style={{ marginRight: '4px' }} />
            System Administrator
          </span>
        );
      case 'owner':
        return (
          <span className="badge badge-owner">
            <ShoppingBag size={14} style={{ marginRight: '4px' }} />
            Store Owner
          </span>
        );
      default:
        return (
          <span className="badge badge-user">
            <User size={14} style={{ marginRight: '4px' }} />
            Normal User
          </span>
        );
    }
  };

  const getDashboardLink = () => {
    if (role === 'admin') return '/admin';
    if (role === 'owner') return '/owner';
    return '/dashboard';
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to={getDashboardLink()} className="navbar-brand">
          <div className="brand-icon">
            <Store size={22} color="#ffffff" />
          </div>
          <div className="brand-text">
            <span className="brand-title">StoreRate</span>
            <span className="brand-subtitle">Management System</span>
          </div>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Right Section */}
        <div className={`navbar-right ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {user && (
            <div className="user-profile-pill">
              <div className="user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-details-nav">
                <span className="user-nav-name" title={user.name}>{user.name}</span>
                {getRoleBadge(role)}
              </div>
            </div>
          )}

          <div className="navbar-actions">
            <Link
              to="/update-password"
              className="btn btn-secondary btn-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              <KeyRound size={16} />
              <span>Update Password</span>
            </Link>

            <button
              onClick={handleLogout}
              className="btn btn-danger-outline btn-sm"
              title="Logout from application"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
