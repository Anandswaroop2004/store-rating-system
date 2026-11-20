const pool = require('../config/db');

// 1. Get All Registered Stores with Overall Rating & Current User's Submitted Rating
exports.getStoresForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search = '', sortBy = 'name', order = 'asc' } = req.query;

    const allowedSortFields = {
      name: 's.name',
      address: 's.address',
      overall_rating: 'overall_rating',
      user_rating: 'user_rating'
    };

    const sortColumn = allowedSortFields[sortBy] || 's.name';
    const sortDirection = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    let query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        COALESCE(ROUND(AVG(all_r.rating), 2), 0) AS overall_rating,
        COUNT(all_r.id) AS total_ratings,
        user_r.rating AS user_rating,
        user_r.updated_at AS rated_at
      FROM stores s
      LEFT JOIN ratings all_r ON all_r.store_id = s.id
      LEFT JOIN ratings user_r ON user_r.store_id = s.id AND user_r.user_id = ?
      WHERE 1=1
    `;

    const params = [userId];

    // Search by Store Name and Address
    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      query += ` AND (s.name LIKE ? OR s.address LIKE ?)`;
      params.push(searchTerm, searchTerm);
    }

    query += ` GROUP BY s.id, user_r.rating, user_r.updated_at ORDER BY ${sortColumn} ${sortDirection}`;

    const [stores] = await pool.execute(query, params);

    return res.status(200).json({
      success: true,
      count: stores.length,
      stores
    });
  } catch (error) {
    console.error('Error getting stores for user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve stores.'
    });
  }
};

// 2. Submit or Modify Store Rating (1 to 5)
// Ensures no multiple ratings for the same store by the same user
exports.submitOrUpdateRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storeId } = req.params;
    const { rating } = req.body;

    const ratingValue = parseInt(rating, 10);
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.'
      });
    }

    // Check if store exists
    const [stores] = await pool.execute('SELECT id, name FROM stores WHERE id = ?', [storeId]);
    if (stores.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.'
      });
    }

    // Insert or update rating using MySQL ON DUPLICATE KEY UPDATE
    // unique_user_store constraint guarantees single rating per user/store
    await pool.execute(
      `INSERT INTO ratings (user_id, store_id, rating) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
         rating = VALUES(rating), 
         updated_at = CURRENT_TIMESTAMP`,
      [userId, storeId, ratingValue]
    );

    // Fetch the updated overall rating for this store
    const [stats] = await pool.execute(
      `SELECT 
        COALESCE(ROUND(AVG(rating), 2), 0) AS overall_rating,
        COUNT(id) AS total_ratings 
       FROM ratings 
       WHERE store_id = ?`,
      [storeId]
    );

    const overallRating = stats[0].overall_rating;
    const totalRatings = stats[0].total_ratings;

    return res.status(200).json({
      success: true,
      message: 'Rating submitted successfully!',
      rating: ratingValue,
      overall_rating: overallRating,
      total_ratings: totalRatings
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while saving rating.'
    });
  }
};
