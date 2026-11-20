const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validate, ratingValidationRules } = require('../middleware/validators');

// All store listing & rating endpoints require authentication
router.use(authenticateToken);

// GET /api/stores - List stores with overall rating and user's rating (for Normal User)
router.get('/', storeController.getStoresForUser);

// POST /api/stores/:storeId/rating - Submit or modify rating (Normal User role only)
router.post(
  '/:storeId/rating',
  authorizeRoles('user'),
  ratingValidationRules,
  validate,
  storeController.submitOrUpdateRating
);

module.exports = router;
