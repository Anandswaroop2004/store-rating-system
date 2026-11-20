const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// 1. Admin Dashboard Statistics (All values from actual MySQL database)
exports.getDashboardStats = async (req, res) => {
  try {
    // Total users count
    const [userCountResult] = await pool.execute('SELECT COUNT(*) as total_users FROM users');
    const totalUsers = userCountResult[0].total_users;

    // Total stores count
    const [storeCountResult] = await pool.execute('SELECT COUNT(*) as total_stores FROM stores');
    const totalStores = storeCountResult[0].total_stores;

    // Total ratings count
    const [ratingCountResult] = await pool.execute('SELECT COUNT(*) as total_ratings FROM ratings');
    const totalRatings = ratingCountResult[0].total_ratings;

    // Role breakdown
    const [roleCounts] = await pool.execute(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );

    const breakdown = {
      admin: 0,
      user: 0,
      owner: 0
    };
    roleCounts.forEach(r => {
      breakdown[r.role] = r.count;
    });

    return res.status(200).json({
      success: true,
      stats: {
        total_users: totalUsers,
        total_stores: totalStores,
        total_ratings: totalRatings,
        breakdown
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics from database.'
    });
  }
};

// 2. View all users with search, role filter, and sorting
exports.getUsers = async (req, res) => {
  try {
    const { search = '', role = '', sortBy = 'created_at', order = 'desc' } = req.query;

    // Allowed sort columns to prevent SQL injection
    const allowedSortFields = {
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      role: 'u.role',
      created_at: 'u.created_at'
    };

    const sortColumn = allowedSortFields[sortBy] || 'u.created_at';
    const sortDirection = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    let query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.address, 
        u.role, 
        u.created_at,
        s.id AS store_id,
        s.name AS store_name,
        COALESCE(ROUND(AVG(r.rating), 2), 0) AS store_rating
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;

    const params = [];

    // Filter by Role if provided
    if (role && ['admin', 'user', 'owner'].includes(role.toLowerCase())) {
      query += ` AND u.role = ?`;
      params.push(role.toLowerCase());
    }

    // Search by Name, Email, Address, or Role
    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ? OR u.role LIKE ?)`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ` GROUP BY u.id, s.id ORDER BY ${sortColumn} ${sortDirection}`;

    const [users] = await pool.execute(query, params);

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error getting users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users.'
    });
  }
};

// 3. View Complete User Details (including Store Owner rating if applicable)
exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.execute(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const user = users[0];

    // If user is a Store Owner, display their store details and rating
    let storeDetails = null;
    if (user.role === 'owner') {
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
        [user.id]
      );

      if (stores.length > 0) {
        storeDetails = stores[0];
      }
    }

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        store: storeDetails
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user details.'
    });
  }
};

// 4. Admin Add New User (Normal User, Admin, or Store Owner)
exports.addUser = async (req, res) => {
  try {
    const { name, email, password, address, role = 'user' } = req.body;

    // Check if email already exists
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into MySQL
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role]
    );

    return res.status(201).json({
      success: true,
      message: `${role.toUpperCase()} user created successfully.`,
      user: {
        id: result.insertId,
        name,
        email,
        address,
        role
      }
    });
  } catch (error) {
    console.error('Error adding user:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while adding user.'
    });
  }
};

// 5. View all stores with overall average rating, search, and sorting
exports.getStores = async (req, res) => {
  try {
    const { search = '', sortBy = 'created_at', order = 'desc' } = req.query;

    const allowedSortFields = {
      name: 's.name',
      email: 's.email',
      address: 's.address',
      rating: 'average_rating',
      created_at: 's.created_at'
    };

    const sortColumn = allowedSortFields[sortBy] || 's.created_at';
    const sortDirection = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    let query = `
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address, 
        s.owner_id,
        s.created_at,
        u.name AS owner_name,
        u.email AS owner_email,
        COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating,
        COUNT(r.id) AS total_ratings
      FROM stores s
      LEFT JOIN users u ON u.id = s.owner_id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;

    const params = [];

    // Search by Name, Email, or Address
    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      query += ` AND (s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?)`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` GROUP BY s.id, u.name, u.email ORDER BY ${sortColumn} ${sortDirection}`;

    const [stores] = await pool.execute(query, params);

    return res.status(200).json({
      success: true,
      count: stores.length,
      stores
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve stores.'
    });
  }
};

// 6. Admin Add New Store
exports.addStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    // Check unique email
    const [existing] = await pool.execute(
      'SELECT id FROM stores WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A store with this email already exists.'
      });
    }

    // If owner_id is provided, verify user exists and is a store owner
    if (owner_id) {
      const [owners] = await pool.execute(
        'SELECT id, role FROM users WHERE id = ?',
        [owner_id]
      );
      if (owners.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Selected Store Owner does not exist.'
        });
      }
    }

    const [result] = await pool.execute(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, owner_id || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Store created successfully!',
      store: {
        id: result.insertId,
        name,
        email,
        address,
        owner_id: owner_id || null
      }
    });
  } catch (error) {
    console.error('Error adding store:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while adding store.'
    });
  }
};

// 7. Get Available Store Owners (for store assignment dropdown)
exports.getStoreOwners = async (req, res) => {
  try {
    const [owners] = await pool.execute(
      `SELECT u.id, u.name, u.email 
       FROM users u 
       WHERE u.role = 'owner'
       ORDER BY u.name ASC`
    );

    return res.status(200).json({
      success: true,
      owners
    });
  } catch (error) {
    console.error('Error getting store owners:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve store owners.'
    });
  }
};
