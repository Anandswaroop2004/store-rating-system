const { body, validationResult } = require('express-validator');

// Generic middleware to check validation results and return clean error response
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return res.status(400).json({
      success: false,
      message: errorList[0].message, // Top-level readable error message
      errors: errorList
    });
  }
  next();
};

// Validation rules for User Registration (Normal User Sign Up)
const registerValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters in length.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .toLowerCase(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/)
    .withMessage('Password must contain at least one special character.'),

  body('address')
    .trim()
    .notEmpty().withMessage('Address is required.')
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters.')
];

// Validation rules for Common Login
const loginValidationRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .toLowerCase(),

  body('password')
    .notEmpty().withMessage('Password is required.')
];

// Validation rules for Admin creating a user (Normal, Admin, or Store Owner)
const adminCreateUserValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters in length.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .toLowerCase(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/)
    .withMessage('Password must contain at least one special character.'),

  body('address')
    .trim()
    .notEmpty().withMessage('Address is required.')
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters.'),

  body('role')
    .optional()
    .isIn(['user', 'admin', 'owner'])
    .withMessage('Role must be either user, admin, or owner.')
];

// Validation rules for Admin creating a store
const adminCreateStoreValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Store name is required.')
    .isLength({ min: 20, max: 60 })
    .withMessage('Store name must be between 20 and 60 characters in length.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Store email is required.')
    .isEmail().withMessage('Please provide a valid store email address.')
    .toLowerCase(),

  body('address')
    .trim()
    .notEmpty().withMessage('Store address is required.')
    .isLength({ max: 400 })
    .withMessage('Store address must not exceed 400 characters.'),

  body('owner_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Owner ID must be a valid positive integer if provided.')
];

// Validation rules for submitting/modifying rating
const ratingValidationRules = [
  body('rating')
    .notEmpty().withMessage('Rating is required.')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.')
];

// Validation rules for Password Update
const updatePasswordValidationRules = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required.'),

  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 8, max: 16 })
    .withMessage('New password must be between 8 and 16 characters.')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter.')
    .matches(/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/)
    .withMessage('New password must contain at least one special character.')
];

module.exports = {
  validate,
  registerValidationRules,
  loginValidationRules,
  adminCreateUserValidationRules,
  adminCreateStoreValidationRules,
  ratingValidationRules,
  updatePasswordValidationRules
};
