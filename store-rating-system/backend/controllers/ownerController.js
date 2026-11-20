const pool = require('../config/db');

// Store Owner Dashboard: View Own Store details, Average Rating, and List of user ratings
exports.getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { sortBy = 'date', order = 'desc' } = req.query;

    // Verify which store belongs to this logged-in Store Owner
    const [stores] = await pool.execute(
      `SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address, 
        s.created_at,
        COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating,
        COUNT(r.id) AS total_ratings
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = ?
       GROUP BY s.id`,
      [ownerId]
    );

    if (stores.length === 0) {
      return res.status(200).json({
        success: true,
        hasStore: false,
        message: 'No store is currently assigned to your account. Please contact an Administrator.',
        store: null,
        ratings: []
      });
    }

    const store = stores[0];

    // Allowed sort columns for rating rows
    const allowedSortFields = {
      name: 'u.name',
      email: 'u.email',
      rating: 'r.rating',
      date: 'r.updated_at'
    };

    const sortColumn = allowedSortFields[sortBy] || 'r.updated_at';
    const sortDirection = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Query list of users who submitted ratings for THIS STORE ONLY
    // Include relevant user information: Name, Email, Address, Rating, Date
    const [ratings] = await pool.execute(
      `SELECT 
        r.id AS rating_id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.address AS user_address
       FROM ratings r
       INNER JOIN users u ON u.id = r.user_id
       WHERE r.store_id = ?
       ORDER BY ${sortColumn} ${sortDirection}`,
      [store.id]
    );

    return res.status(200).json({
      success: true,
      hasStore: true,
      store,
      ratings
    });
  } catch (error) {
    console.error('Error fetching store owner dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve store ratings information.'
    });
  }
};
