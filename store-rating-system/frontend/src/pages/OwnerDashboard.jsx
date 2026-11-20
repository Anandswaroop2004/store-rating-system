import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import {
  Store,
  Star,
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  Building2,
  Award
} from 'lucide-react';

const OwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState({ column: 'date', direction: 'desc' });
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/owner/dashboard', {
        params: {
          sortBy: sort.column,
          order: sort.direction
        }
      });
      if (res.data.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Failed to load store owner dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [sort]);

  const handleSort = (column) => {
    setSort((prev) => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const renderSortIcon = (column) => {
    if (sort.column !== column) {
      return <ArrowUpDown size={14} className="sort-icon-inactive" />;
    }
    return sort.direction === 'asc' ? (
      <ArrowUp size={14} className="sort-icon-active" />
    ) : (
      <ArrowDown size={14} className="sort-icon-active" />
    );
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className="flex-center" style={{ minHeight: '60vh' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <div className="container">
          {/* Header */}
          <div className="dashboard-header flex-between">
            <div>
              <h1 className="page-heading">Store Owner Portal</h1>
              <p className="page-subheading">
                Monitor your store performance, review customer ratings, and track customer satisfaction.
              </p>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger mb-4">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {!dashboardData?.hasStore ? (
            <div className="card text-center py-5">
              <Building2 size={48} className="text-muted mx-auto mb-3" />
              <h3 className="fw-semibold text-lg text-dark">No Store Assigned</h3>
              <p className="text-muted mt-2">
                Your store owner account is not currently assigned to any store. Please contact the System Administrator to link your store.
              </p>
            </div>
          ) : (
            <>
              {/* Store Performance Header Card */}
              <div className="card owner-hero-card mb-4">
                <div className="owner-hero-grid">
                  <div className="owner-store-meta">
                    <div className="store-badge-pill">
                      <Award size={16} /> Verified Store
                    </div>
                    <h2 className="owner-store-name">{dashboardData.store.name}</h2>
                    <p className="owner-store-addr flex-center-y">
                      <MapPin size={16} className="text-muted mr-1" />
                      <span>{dashboardData.store.address}</span>
                    </p>
                    <p className="owner-store-email flex-center-y">
                      <Mail size={16} className="text-muted mr-1" />
                      <a href={`mailto:${dashboardData.store.email}`} className="table-link">
                        {dashboardData.store.email}
                      </a>
                    </p>
                  </div>

                  {/* Rating KPI Card */}
                  <div className="owner-rating-kpi">
                    <span className="kpi-label">Average Customer Rating</span>
                    <div className="kpi-score-row flex-center">
                      <span className="kpi-number">
                        {Number(dashboardData.store.average_rating).toFixed(2)}
                      </span>
                      <span className="kpi-max">/ 5.0</span>
                    </div>
                    <div className="flex-center my-2">
                      <StarRating
                        rating={Number(dashboardData.store.average_rating)}
                        size={22}
                      />
                    </div>
                    <span className="kpi-subtext">
                      Based on <strong>{dashboardData.store.total_ratings}</strong> verified reviews
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Ratings Table */}
              <div className="card">
                <div className="panel-header flex-between">
                  <div>
                    <h2 className="panel-title">Customer Reviews & Ratings</h2>
                    <p className="panel-subtitle">
                      List of users who rated your store. Showing ratings exclusively for your store.
                    </p>
                  </div>
                  <span className="badge badge-info">
                    {dashboardData.ratings.length} Submitted Ratings
                  </span>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('name')} className="sortable-th">
                          <div className="th-content">
                            <span>User Name</span>
                            {renderSortIcon('name')}
                          </div>
                        </th>
                        <th onClick={() => handleSort('email')} className="sortable-th">
                          <div className="th-content">
                            <span>User Email</span>
                            {renderSortIcon('email')}
                          </div>
                        </th>
                        <th>User Address</th>
                        <th onClick={() => handleSort('rating')} className="sortable-th">
                          <div className="th-content">
                            <span>Submitted Rating</span>
                            {renderSortIcon('rating')}
                          </div>
                        </th>
                        <th onClick={() => handleSort('date')} className="sortable-th">
                          <div className="th-content">
                            <span>Date Submitted</span>
                            {renderSortIcon('date')}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.ratings.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-4 text-muted">
                            No customers have submitted ratings for your store yet.
                          </td>
                        </tr>
                      ) : (
                        dashboardData.ratings.map((r) => (
                          <tr key={r.rating_id}>
                            <td className="fw-semibold text-dark">
                              <div className="flex-center-y" style={{ gap: '8px' }}>
                                <div className="user-mini-avatar">
                                  {r.user_name.charAt(0).toUpperCase()}
                                </div>
                                <span>{r.user_name}</span>
                              </div>
                            </td>
                            <td>
                              <a href={`mailto:${r.user_email}`} className="table-link">
                                {r.user_email}
                              </a>
                            </td>
                            <td className="table-address" title={r.user_address}>
                              {r.user_address}
                            </td>
                            <td>
                              <div className="flex-center-y" style={{ gap: '6px' }}>
                                <StarRating rating={r.rating} size={16} />
                                <span className="user-rating-badge">{r.rating} / 5</span>
                              </div>
                            </td>
                            <td className="text-muted text-sm">
                              <div className="flex-center-y" style={{ gap: '6px' }}>
                                <Calendar size={14} />
                                <span>{new Date(r.updated_at || r.created_at).toLocaleDateString()}</span>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default OwnerDashboard;
