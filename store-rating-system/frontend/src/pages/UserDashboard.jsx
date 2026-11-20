import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import StarRating from '../components/StarRating';
import {
  Store,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  Edit3,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Sparkles
} from 'lucide-react';

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ column: 'name', direction: 'asc' });
  const [loading, setLoading] = useState(false);

  // Rating Modal state
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [modalRating, setModalRating] = useState(5);
  const [submittingRating, setSubmittingRating] = useState(false);

  // Notification
  const [notification, setNotification] = useState({ type: '', message: '' });

  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 5000);
  };

  // Fetch stores for Normal User
  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stores', {
        params: {
          search,
          sortBy: sort.column,
          order: sort.direction
        }
      });
      if (res.data.success) {
        setStores(res.data.stores);
      }
    } catch (err) {
      console.error('Failed to fetch stores:', err);
      showToast('danger', 'Failed to load store listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStores();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, sort]);

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

  // Open modal to submit or modify rating
  const handleOpenRatingModal = (store) => {
    setSelectedStore(store);
    // If user already rated, default to their previous rating, else 5
    setModalRating(store.user_rating || 5);
    setIsRatingModalOpen(true);
  };

  // Submit or Modify rating
  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!selectedStore) return;

    setSubmittingRating(true);
    try {
      const res = await api.post(`/stores/${selectedStore.id}/rating`, {
        rating: modalRating
      });

      if (res.data.success) {
        showToast(
          'success',
          selectedStore.user_rating
            ? `Your rating for "${selectedStore.name}" was modified to ${modalRating} stars!`
            : `Thank you! Your ${modalRating}-star rating for "${selectedStore.name}" was submitted!`
        );

        setIsRatingModalOpen(false);

        // Update locally and reload list to ensure full sync
        setStores((prevStores) =>
          prevStores.map((s) => {
            if (s.id === selectedStore.id) {
              return {
                ...s,
                user_rating: modalRating,
                overall_rating: res.data.overall_rating,
                total_ratings: res.data.total_ratings
              };
            }
            return s;
          })
        );
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit rating.';
      showToast('danger', msg);
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <div className="container">
          {/* Header */}
          <div className="dashboard-header flex-between">
            <div>
              <h1 className="page-heading">Browse & Rate Stores</h1>
              <p className="page-subheading">
                Explore verified stores, share your honest feedback, and rate from 1 to 5 stars.
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

          {/* Search Bar */}
          <div className="card filter-card mb-4">
            <div className="search-input-wrapper">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                className="form-input search-input"
                placeholder="Search stores by Name (e.g. Vijay Sales, Reliance) or City/Address (e.g. Mumbai, Bengaluru, Delhi)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Store Table */}
          <div className="card">
            <div className="panel-header flex-between">
              <div>
                <h2 className="panel-title">Available Stores ({stores.length})</h2>
                <p className="panel-subtitle">
                  Click column headers to sort; click buttons to submit or modify your ratings
                </p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')} className="sortable-th">
                      <div className="th-content">
                        <span>Store Name</span>
                        {renderSortIcon('name')}
                      </div>
                    </th>
                    <th onClick={() => handleSort('address')} className="sortable-th">
                      <div className="th-content">
                        <span>Address</span>
                        {renderSortIcon('address')}
                      </div>
                    </th>
                    <th onClick={() => handleSort('overall_rating')} className="sortable-th">
                      <div className="th-content">
                        <span>Overall Rating</span>
                        {renderSortIcon('overall_rating')}
                      </div>
                    </th>
                    <th onClick={() => handleSort('user_rating')} className="sortable-th">
                      <div className="th-content">
                        <span>Your Rating</span>
                        {renderSortIcon('user_rating')}
                      </div>
                    </th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        <div className="spinner-sm mx-auto"></div>
                        <span className="text-muted ml-2">Loading stores...</span>
                      </td>
                    </tr>
                  ) : stores.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        No stores found matching your search.
                      </td>
                    </tr>
                  ) : (
                    stores.map((s) => (
                      <tr key={s.id}>
                        <td className="fw-semibold text-dark">
                          <div className="flex-center-y" style={{ gap: '8px' }}>
                            <Store size={18} className="text-primary" />
                            <span>{s.name}</span>
                          </div>
                        </td>
                        <td className="table-address" title={s.address}>
                          <div className="flex-center-y" style={{ gap: '6px' }}>
                            <MapPin size={14} className="text-muted" />
                            <span>{s.address}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex-center-y" style={{ gap: '8px' }}>
                            <StarRating rating={Number(s.overall_rating)} size={16} />
                            <span className="badge badge-rating">
                              {Number(s.overall_rating).toFixed(2)} ★ ({s.total_ratings})
                            </span>
                          </div>
                        </td>
                        <td>
                          {s.user_rating ? (
                            <div className="flex-center-y" style={{ gap: '6px' }}>
                              <StarRating rating={Number(s.user_rating)} size={16} />
                              <span className="user-rating-badge">
                                {s.user_rating} / 5
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted italic">Not rated yet</span>
                          )}
                        </td>
                        <td>
                          {s.user_rating ? (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenRatingModal(s)}
                              title="Modify your rating"
                            >
                              <Edit3 size={14} />
                              <span>Modify Rating</span>
                            </button>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleOpenRatingModal(s)}
                              title="Submit your rating"
                            >
                              <Star size={14} />
                              <span>Submit Rating</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================== */}
      {/* MODAL: SUBMIT / MODIFY RATING */}
      {/* ============================================================== */}
      <Modal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        title={selectedStore?.user_rating ? 'Modify Store Rating' : 'Submit Store Rating'}
      >
        {selectedStore && (
          <form onSubmit={handleSubmitRating}>
            <div className="rating-modal-store-info">
              <h4 className="fw-semibold text-lg text-dark mb-1">{selectedStore.name}</h4>
              <p className="text-muted text-sm flex-center-y" style={{ gap: '6px' }}>
                <MapPin size={14} />
                <span>{selectedStore.address}</span>
              </p>
              <div className="current-store-average mt-2 flex-center-y" style={{ gap: '8px' }}>
                <span className="text-sm font-medium">Current Average:</span>
                <StarRating rating={Number(selectedStore.overall_rating)} size={15} />
                <span className="text-xs text-muted">
                  ({Number(selectedStore.overall_rating).toFixed(2)} based on {selectedStore.total_ratings} ratings)
                </span>
              </div>
            </div>

            <div className="rate-selector-box text-center my-4">
              <label className="form-label d-block mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>
                Select Your Rating (1 to 5 Stars)
              </label>

              <div className="star-picker-large flex-center" style={{ gap: '8px', marginBottom: '12px' }}>
                <StarRating
                  rating={modalRating}
                  interactive={true}
                  onRate={(val) => setModalRating(val)}
                  size={36}
                />
              </div>

              <div className="rating-score-display">
                <span className="rating-score-number">{modalRating}</span>
                <span className="rating-score-label">
                  {modalRating === 1 && '⭐ Poor'}
                  {modalRating === 2 && '⭐⭐ Fair'}
                  {modalRating === 3 && '⭐⭐⭐ Good'}
                  {modalRating === 4 && '⭐⭐⭐⭐ Very Good'}
                  {modalRating === 5 && '⭐⭐⭐⭐⭐ Excellent!'}
                </span>
              </div>

              {selectedStore.user_rating && (
                <p className="text-muted text-xs mt-2">
                  Previously rated: <strong>{selectedStore.user_rating} stars</strong>. Submitting will update your rating.
                </p>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsRatingModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submittingRating}
              >
                {submittingRating ? (
                  <span className="flex-center" style={{ gap: '6px' }}>
                    <span className="spinner-sm"></span> Saving...
                  </span>
                ) : (
                  <span className="flex-center" style={{ gap: '6px' }}>
                    <Star size={16} />
                    {selectedStore.user_rating ? 'Update Rating' : 'Confirm Rating'}
                  </span>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default UserDashboard;
