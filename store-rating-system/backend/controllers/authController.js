const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Generate JWT token helper
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    process.env.JWT_SECRET || 'super_secret_store_rating_jwt_key_2026_secure',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// 1. Normal User Registration
exports.register = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Check if email already exists in MySQL
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Hash password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user with 'user' role
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, 'user']
    );

    const newUser = {
      id: result.insertId,
      name,
      email,
      address,
      role: 'user'
    };

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to the platform.',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Error during user registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while registering user.'
    });
  }
};

// 2. Common Login System for All Roles (Admin, Normal User, Store Owner)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const [users] = await pool.execute(
      'SELECT id, name, email, password, address, role, created_at FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = users[0];

    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // If user is a Store Owner, attach store information
    let storeInfo = null;
    if (user.role === 'owner') {
      const [stores] = await pool.execute(
        'SELECT id, name, email, address FROM stores WHERE owner_id = ? LIMIT 1',
        [user.id]
      );
      if (stores.length > 0) {
        storeInfo = stores[0];
      }
    }

    // Never return password hash
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      created_at: user.created_at,
      store: storeInfo
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while authenticating.'
    });
  }
};

// 3. Get Current User Profile
exports.getMe = async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    const user = users[0];
    let storeInfo = null;
    if (user.role === 'owner') {
      const [stores] = await pool.execute(
        'SELECT id, name, email, address FROM stores WHERE owner_id = ? LIMIT 1',
        [user.id]
      );
      if (stores.length > 0) {
        storeInfo = stores[0];
      }
    }

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        store: storeInfo
      }
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile.'
    });
  }
};

// 4. Update Password for Logged-In User
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current stored password hash
    const [users] = await pool.execute(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const user = users[0];

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Your current password does not match.'
      });
    }

    // Check if new password is same as current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be the same as your current password.'
      });
    }

    // Hash and update new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.execute(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedNewPassword, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully!'
    });
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating password.'
    });
  }
};
