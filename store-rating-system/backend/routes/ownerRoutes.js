const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Restrict entire owner router to 'owner' role only
router.use(authenticateToken, authorizeRoles('owner'));

// GET /api/owner/dashboard - View own store average rating and list of users who submitted ratings
router.get('/dashboard', ownerController.getOwnerDashboard);

module.exports = router;
