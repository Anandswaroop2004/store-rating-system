import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import StarRating from '../components/StarRating';
import {
  Users,
  Store,
  Star,
  PlusCircle,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  ShieldCheck,
  User,
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
  Filter
} from 'lucide-react';

const AdminDashboard = () => {
  // Navigation tab
  const [activeTab, setActiveTab] = useState('stores'); // 'stores' or 'users'

  // Stats state
  const [stats, setStats] = useState({
    total_users: 0,
    total_stores: 0,
    total_ratings: 0,
    breakdown: { admin: 0, user: 0, owner: 0 }
  });

  // Stores state
  const [stores, setStores] = useState([]);
  const [storeSearch, setStoreSearch] = useState('');
  const [storeSort, setStoreSort] = useState({ column: 'created_at', direction: 'desc' });
  const [storesLoading, setStoresLoading] = useState(false);

  // Users state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userSort, setUserSort] = useState({ column: 'created_at', direction: 'desc' });
  const [usersLoading, setUsersLoading] = useState(false);

  // Store Owners list for dropdown
  const [storeOwners, setStoreOwners] = useState([]);

  // Modals state
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);

  // Form states
  const [storeForm, setStoreForm] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  });
  const [storeFormErrors, setStoreFormErrors] = useState({});

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'user'
  });
  const [userFormErrors, setUserFormErrors] = useState({});

  // Feedback notifications
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Show notification helper
  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 5000);
  };

  // 1. Fetch Dashboard Stats from MySQL
  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // 2. Fetch Stores with search & sort
  const fetchStores = async () => {
    setStoresLoading(true);
    try {
      const res = await api.get('/admin/stores', {
        params: {
          search: storeSearch,
          sortBy: storeSort.column,
          order: storeSort.direction
        }
      });
      if (res.data.success) {
        setStores(res.data.stores);
      }
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    } finally {
      setStoresLoading(false);
    }
  };

  // 3. Fetch Users with search, role filter & sort
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: {
          search: userSearch,
          role: userRoleFilter,
          sortBy: userSort.column,
          order: userSort.direction
        }
      });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  // 4. Fetch Store Owners for dropdown
  const fetchStoreOwners = async () => {
    try {
      const res = await api.get('/admin/store-owners');
      if (res.data.success) {
        setStoreOwners(res.data.owners);
      }
    } catch (err) {
      console.error('Failed to fetch store owners:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchStoreOwners();
  }, []);

  // Watch stores query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStores();
    }, 250);
    return () => clearTimeout(timer);
  }, [storeSearch, storeSort]);

  // Watch users query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [userSearch, userRoleFilter, userSort]);

  // Sort handlers
  const handleStoreSort = (column) => {
    setStoreSort((prev) => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleUserSort = (column) => {
    setUserSort((prev) => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const renderSortIcon = (currentSort, column) => {
    if (currentSort.column !== column) {
      return <ArrowUpDown size={14} className="sort-icon-inactive" />;
    }
    return currentSort.direction === 'asc' ? (
      <ArrowUp size={14} className="sort-icon-active" />
    ) : (
      <ArrowDown size={14} className="sort-icon-active" />
    );
  };

  // View User Details
  const handleViewUser = async (userId) => {
    try {
      const res = await api.get(`/admin/users/${userId}`);
      if (res.data.success) {
        setSelectedUserDetails(res.data.user);
        setIsUserDetailsOpen(true);
      }
    } catch (err) {
      console.error('Failed to get user details:', err);
      showToast('danger', 'Failed to retrieve user details.');
    }
  };

  // Validation for Add Store
  const validateStoreForm = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!storeForm.name.trim()) {
      errs.name = 'Store name is required.';
    } else if (storeForm.name.trim().length < 20 || storeForm.name.trim().length > 60) {
      errs.name = `Store name must be between 20 and 60 characters (currently ${storeForm.name.trim().length}).`;
    }

    if (!storeForm.email.trim()) {
      errs.email = 'Store email is required.';
    } else if (!emailRegex.test(storeForm.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }

    if (!storeForm.address.trim()) {
      errs.address = 'Store address is required.';
    } else if (storeForm.address.trim().length > 400) {
      errs.address = `Address cannot exceed 400 characters (currently ${storeForm.address.trim().length}).`;
    }

    setStoreFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Add Store
  const handleAddStoreSubmit = async (e) => {
    e.preventDefault();
    if (!validateStoreForm()) return;

    try {
      const res = await api.post('/admin/stores', {
        name: storeForm.name.trim(),
        email: storeForm.email.trim(),
        address: storeForm.address.trim(),
        owner_id: storeForm.owner_id ? parseInt(storeForm.owner_id, 10) : null
      });

      if (res.data.success) {
        showToast('success', 'New store added successfully!');
        setIsAddStoreOpen(false);
        setStoreForm({ name: '', email: '', address: '', owner_id: '' });
        fetchStores();
        fetchStats();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add store.';
      showToast('danger', msg);
    }
  };

  // Validation for Add User
  const validateUserForm = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/;
    const uppercaseRegex = /[A-Z]/;

    if (!userForm.name.trim()) {
      errs.name = 'Full name is required.';
    } else if (userForm.name.trim().length < 20 || userForm.name.trim().length > 60) {
      errs.name = `Name must be between 20 and 60 characters (currently ${userForm.name.trim().length}).`;
    }

    if (!userForm.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(userForm.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }

    if (!userForm.address.trim()) {
      errs.address = 'Address is required.';
    } else if (userForm.address.trim().length > 400) {
      errs.address = `Address cannot exceed 400 characters (currently ${userForm.address.trim().length}).`;
    }

    if (!userForm.password) {
      errs.password = 'Password is required.';
    } else if (userForm.password.length < 8 || userForm.password.length > 16) {
      errs.password = 'Password must be between 8 and 16 characters.';
    } else if (!uppercaseRegex.test(userForm.password)) {
      errs.password = 'Password must contain at least one uppercase letter (A-Z).';
    } else if (!specialCharRegex.test(userForm.password)) {
      errs.password = 'Password must contain at least one special character.';
    }

    setUserFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Add User
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!validateUserForm()) return;

    try {
      const res = await api.post('/admin/users', {
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        password: userForm.password,
        address: userForm.address.trim(),
        role: userForm.role
      });

      if (res.data.success) {
        showToast('success', `${userForm.role.toUpperCase()} user created successfully!`);
        setIsAddUserOpen(false);
        setUserForm({ name: '', email: '', password: '', address: '', role: 'user' });
        fetchUsers();
        fetchStats();
        fetchStoreOwners();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add user.';
      showToast('danger', msg);
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return <span className="badge badge-admin">Admin</span>;
    }
    if (role === 'owner') {
      return <span className="badge badge-owner">Store Owner</span>;
    }
    return <span className="badge badge-user">Normal User</span>;
  };

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <div className="container">
          {/* Page Title */}
          <div className="dashboard-header flex-between">
            <div>
              <h1 className="page-heading">System Administrator Dashboard</h1>
              <p className="page-subheading">
                Manage all registered stores, users, and oversee platform rating metrics.
              </p>
            </div>
          </div>

          {/* Toast Notification */}
          {notification.message && (
            <div className={`alert alert-${notification.type} animate-fade-in`}>
              {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{notification.message}</span>
            </div>
          )}

          {/* Section A: Stats Cards (Real MySQL database values) */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-blue">
                <Users size={26} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Users</span>
                <span className="stat-value">{stats.total_users}</span>
                <span className="stat-meta">
                  {stats.breakdown.user} Users • {stats.breakdown.owner} Owners • {stats.breakdown.admin} Admins
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-indigo">
                <Store size={26} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Stores</span>
                <span className="stat-value">{stats.total_stores}</span>
                <span className="stat-meta">Verified outlets registered</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-amber">
                <Star size={26} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Ratings Submitted</span>
                <span className="stat-value">{stats.total_ratings}</span>
                <span className="stat-meta">Verified customer reviews</span>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="dashboard-tabs">
            <button
              className={`tab-btn ${activeTab === 'stores' ? 'active' : ''}`}
              onClick={() => setActiveTab('stores')}
            >
              <Store size={18} />
              <span>Manage Stores ({stores.length})</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <Users size={18} />
              <span>Manage Users ({users.length})</span>
            </button>
          </div>

          {/* ============================================================== */}
          {/* TAB 1: MANAGE STORES */}
          {/* ============================================================== */}
          {activeTab === 'stores' && (
            <div className="card tab-panel animate-fade-in">
              <div className="panel-header flex-between">
                <div>
                  <h2 className="panel-title">Registered Stores</h2>
                  <p className="panel-subtitle">View, search, filter, and add stores</p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setIsAddStoreOpen(true)}
                >
                  <PlusCircle size={18} />
                  <span>Add New Store</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="filter-bar">
                <div className="search-input-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    className="form-input search-input"
                    placeholder="Search stores by Name, Email, or City/Address (e.g. Mumbai, Bengaluru, Delhi)..."
                    value={storeSearch}
                    onChange={(e) => setStoreSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Stores Table */}
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleStoreSort('name')} className="sortable-th">
                        <div className="th-content">
                          <span>Store Name</span>
                          {renderSortIcon(storeSort, 'name')}
                        </div>
                      </th>
                      <th onClick={() => handleStoreSort('email')} className="sortable-th">
                        <div className="th-content">
                          <span>Email</span>
                          {renderSortIcon(storeSort, 'email')}
                        </div>
                      </th>
                      <th onClick={() => handleStoreSort('address')} className="sortable-th">
                        <div className="th-content">
                          <span>Address</span>
                          {renderSortIcon(storeSort, 'address')}
                        </div>
                      </th>
                      <th onClick={() => handleStoreSort('rating')} className="sortable-th">
                        <div className="th-content">
                          <span>Average Rating</span>
                          {renderSortIcon(storeSort, 'rating')}
                        </div>
                      </th>
                      <th>Store Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storesLoading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          <div className="spinner-sm mx-auto"></div>
                          <span className="text-muted ml-2">Loading stores...</span>
                        </td>
                      </tr>
                    ) : stores.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          No stores found matching your query.
                        </td>
                      </tr>
                    ) : (
                      stores.map((s) => (
                        <tr key={s.id}>
                          <td className="fw-semibold text-dark">{s.name}</td>
                          <td>
                            <a href={`mailto:${s.email}`} className="table-link">
                              {s.email}
                            </a>
                          </td>
                          <td className="table-address" title={s.address}>{s.address}</td>
                          <td>
                            <div className="flex-center-y" style={{ gap: '8px' }}>
                              <StarRating rating={Number(s.average_rating)} size={16} />
                              <span className="badge badge-rating">
                                {Number(s.average_rating).toFixed(2)} ★ ({s.total_ratings})
                              </span>
                            </div>
                          </td>
                          <td>
                            {s.owner_name ? (
                              <span className="text-dark font-medium">{s.owner_name}</span>
                            ) : (
                              <span className="text-muted italic">Unassigned</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: MANAGE USERS */}
          {/* ============================================================== */}
          {activeTab === 'users' && (
            <div className="card tab-panel animate-fade-in">
              <div className="panel-header flex-between">
                <div>
                  <h2 className="panel-title">Registered Users</h2>
                  <p className="panel-subtitle">View, search, filter, and add users & administrators</p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setIsAddUserOpen(true)}
                >
                  <PlusCircle size={18} />
                  <span>Add New User</span>
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="filter-bar flex-gap">
                <div className="search-input-wrapper flex-grow">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    className="form-input search-input"
                    placeholder="Search users by Name, Email, Address, or Role..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>

                <div className="filter-select-wrapper">
                  <Filter size={16} className="filter-icon" />
                  <select
                    className="form-select"
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                  >
                    <option value="">All Roles</option>
                    <option value="user">Normal Users</option>
                    <option value="admin">System Administrators</option>
                    <option value="owner">Store Owners</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleUserSort('name')} className="sortable-th">
                        <div className="th-content">
                          <span>Name</span>
                          {renderSortIcon(userSort, 'name')}
                        </div>
                      </th>
                      <th onClick={() => handleUserSort('email')} className="sortable-th">
                        <div className="th-content">
                          <span>Email</span>
                          {renderSortIcon(userSort, 'email')}
                        </div>
                      </th>
                      <th onClick={() => handleUserSort('address')} className="sortable-th">
                        <div className="th-content">
                          <span>Address</span>
                          {renderSortIcon(userSort, 'address')}
                        </div>
                      </th>
                      <th onClick={() => handleUserSort('role')} className="sortable-th">
                        <div className="th-content">
                          <span>Role</span>
                          {renderSortIcon(userSort, 'role')}
                        </div>
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          <div className="spinner-sm mx-auto"></div>
                          <span className="text-muted ml-2">Loading users...</span>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          No users found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id}>
                          <td className="fw-semibold text-dark">{u.name}</td>
                          <td>
                            <a href={`mailto:${u.email}`} className="table-link">
                              {u.email}
                            </a>
                          </td>
                          <td className="table-address" title={u.address}>{u.address}</td>
                          <td>{getRoleBadge(u.role)}</td>
                          <td>
                            <button
                              className="btn btn-secondary btn-xs"
                              onClick={() => handleViewUser(u.id)}
                              title="View full user details"
                            >
                              <Eye size={14} />
                              <span>View Details</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ============================================================== */}
      {/* MODAL 1: ADD NEW STORE */}
      {/* ============================================================== */}
      <Modal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
        title="Add New Store"
      >
        <form onSubmit={handleAddStoreSubmit} noValidate>
          <div className="form-group">
            <div className="flex-between">
              <label className="form-label" htmlFor="storeName">
                Store Name <span className="text-muted">(20 - 60 chars)</span>
              </label>
              <span className="char-counter">{storeForm.name.trim().length} / 60</span>
            </div>
            <input
              id="storeName"
              type="text"
              className={`form-input ${storeFormErrors.name ? 'input-error' : ''}`}
              placeholder="e.g. Croma Electronics Retail Superstore"
              value={storeForm.name}
              onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
            />
            {storeFormErrors.name && <p className="form-error">{storeFormErrors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="storeEmail">
              Store Contact Email
            </label>
            <input
              id="storeEmail"
              type="email"
              className={`form-input ${storeFormErrors.email ? 'input-error' : ''}`}
              placeholder="store@example.com"
              value={storeForm.email}
              onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
            />
            {storeFormErrors.email && <p className="form-error">{storeFormErrors.email}</p>}
          </div>

          <div className="form-group">
            <div className="flex-between">
              <label className="form-label" htmlFor="storeAddress">
                Store Address <span className="text-muted">(Max 400 chars)</span>
              </label>
              <span className="char-counter">{storeForm.address.trim().length} / 400</span>
            </div>
            <textarea
              id="storeAddress"
              rows="3"
              className={`form-input form-textarea ${storeFormErrors.address ? 'input-error' : ''}`}
              placeholder="Enter complete store physical location..."
              value={storeForm.address}
              onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
            ></textarea>
            {storeFormErrors.address && <p className="form-error">{storeFormErrors.address}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="storeOwner">
              Assign Store Owner (Optional)
            </label>
            <select
              id="storeOwner"
              className="form-select"
              value={storeForm.owner_id}
              onChange={(e) => setStoreForm({ ...storeForm, owner_id: e.target.value })}
            >
              <option value="">-- No Store Owner Assigned --</option>
              {storeOwners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddStoreOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <PlusCircle size={16} /> Save Store
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 2: ADD NEW USER */}
      {/* ============================================================== */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Add New User"
      >
        <form onSubmit={handleAddUserSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">User Role</label>
            <select
              className="form-select"
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
            >
              <option value="user">Normal User</option>
              <option value="admin">System Administrator</option>
              <option value="owner">Store Owner</option>
            </select>
          </div>

          <div className="form-group">
            <div className="flex-between">
              <label className="form-label" htmlFor="addUserName">
                Full Name <span className="text-muted">(20 - 60 chars)</span>
              </label>
              <span className="char-counter">{userForm.name.trim().length} / 60</span>
            </div>
            <input
              id="addUserName"
              type="text"
              className={`form-input ${userFormErrors.name ? 'input-error' : ''}`}
              placeholder="e.g. Vikramaditya Rajesh Sharma"
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
            />
            {userFormErrors.name && <p className="form-error">{userFormErrors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="addUserEmail">
              Email Address
            </label>
            <input
              id="addUserEmail"
              type="email"
              className={`form-input ${userFormErrors.email ? 'input-error' : ''}`}
              placeholder="user@example.com"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            />
            {userFormErrors.email && <p className="form-error">{userFormErrors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="addUserPassword">
              Password <span className="text-muted">(8-16 chars, 1 uppercase, 1 special)</span>
            </label>
            <input
              id="addUserPassword"
              type="password"
              className={`form-input ${userFormErrors.password ? 'input-error' : ''}`}
              placeholder="e.g. Temp@1234"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
            />
            {userFormErrors.password && <p className="form-error">{userFormErrors.password}</p>}
          </div>

          <div className="form-group">
            <div className="flex-between">
              <label className="form-label" htmlFor="addUserAddress">
                Address <span className="text-muted">(Max 400 chars)</span>
              </label>
              <span className="char-counter">{userForm.address.trim().length} / 400</span>
            </div>
            <textarea
              id="addUserAddress"
              rows="2"
              className={`form-input form-textarea ${userFormErrors.address ? 'input-error' : ''}`}
              placeholder="Enter user residential or business address..."
              value={userForm.address}
              onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
            ></textarea>
            {userFormErrors.address && <p className="form-error">{userFormErrors.address}</p>}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddUserOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <PlusCircle size={16} /> Create User
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 3: VIEW COMPLETE USER DETAILS */}
      {/* ============================================================== */}
      <Modal
        isOpen={isUserDetailsOpen}
        onClose={() => setIsUserDetailsOpen(false)}
        title="Complete User Details"
      >
        {selectedUserDetails && (
          <div className="user-details-card">
            <div className="detail-row">
              <span className="detail-label">Full Name:</span>
              <span className="detail-value fw-semibold">{selectedUserDetails.name}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Email Address:</span>
              <span className="detail-value">
                <a href={`mailto:${selectedUserDetails.email}`} className="table-link">
                  {selectedUserDetails.email}
                </a>
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Platform Role:</span>
              <span className="detail-value">{getRoleBadge(selectedUserDetails.role)}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{selectedUserDetails.address}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Member Since:</span>
              <span className="detail-value text-muted">
                {new Date(selectedUserDetails.created_at).toLocaleString()}
              </span>
            </div>

            {/* Requirement: If user is Store Owner, their Rating should also be displayed */}
            {selectedUserDetails.role === 'owner' && (
              <div className="store-owner-rating-section">
                <h4 className="sub-heading">Store Ownership & Rating Details</h4>
                {selectedUserDetails.store ? (
                  <div className="owner-store-box">
                    <p><strong>Store Name:</strong> {selectedUserDetails.store.name}</p>
                    <p><strong>Store Email:</strong> {selectedUserDetails.store.email}</p>
                    <p><strong>Store Address:</strong> {selectedUserDetails.store.address}</p>
                    <div className="owner-rating-highlight flex-between">
                      <span>Overall Store Rating:</span>
                      <div className="flex-center-y" style={{ gap: '8px' }}>
                        <StarRating rating={Number(selectedUserDetails.store.average_rating)} size={18} />
                        <span className="rating-badge-large">
                          {Number(selectedUserDetails.store.average_rating).toFixed(2)} / 5.0
                        </span>
                      </div>
                    </div>
                    <p className="text-muted text-sm mt-1">
                      Total customer reviews: {selectedUserDetails.store.total_ratings}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted italic">This Store Owner has no assigned store currently.</p>
                )}
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsUserDetailsOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
