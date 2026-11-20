const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  validate,
  adminCreateUserValidationRules,
  adminCreateStoreValidationRules
} = require('../middleware/validators');

// Restrict entire admin router to 'admin' role only
router.use(authenticateToken, authorizeRoles('admin'));

// GET /api/admin/stats - Dashboard counts from MySQL (users, stores, ratings)
router.get('/stats', adminController.getDashboardStats);

// GET /api/admin/users - List users with filter, search, sort
router.get('/users', adminController.getUsers);

// GET /api/admin/users/:id - User details (including store rating if owner)
router.get('/users/:id', adminController.getUserDetails);

// POST /api/admin/users - Add user (Normal User, Admin, Store Owner)
router.post(
  '/users',
  adminCreateUserValidationRules,
  validate,
  adminController.addUser
);

// GET /api/admin/stores - List all stores with ratings, search, sort
router.get('/stores', adminController.getStores);

// POST /api/admin/stores - Add new store
router.post(
  '/stores',
  adminCreateStoreValidationRules,
  validate,
  adminController.addStore
);

// GET /api/admin/store-owners - Get list of store owners for assignment
router.get('/store-owners', adminController.getStoreOwners);

module.exports = router;
