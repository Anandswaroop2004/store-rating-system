const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const {
  validate,
  registerValidationRules,
  loginValidationRules,
  updatePasswordValidationRules
} = require('../middleware/validators');

// POST /api/auth/register - Normal user sign up
router.post(
  '/register',
  registerValidationRules,
  validate,
  authController.register
);

// POST /api/auth/login - Common login for all roles
router.post(
  '/login',
  loginValidationRules,
  validate,
  authController.login
);

// GET /api/auth/me - Get current logged-in profile
router.get(
  '/me',
  authenticateToken,
  authController.getMe
);

// PUT /api/auth/update-password - Change password
router.put(
  '/update-password',
  authenticateToken,
  updatePasswordValidationRules,
  validate,
  authController.updatePassword
);

module.exports = router;
