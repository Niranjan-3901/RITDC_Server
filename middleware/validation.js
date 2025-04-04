// middleware/validation.js
import { body, validationResult } from 'express-validator';

// Fee record validation rules
const feeRecordValidationRules = () => {
  return [
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('serialNumber').notEmpty().withMessage('Serial number is required'),
    body('feeAmount').isNumeric().withMessage('Fee amount must be a number'),
    body('academicYear').notEmpty().withMessage('Academic year is required'),
    body('term').isIn(['Term 1', 'Term 2', 'Term 3', 'Annual']).withMessage('Invalid term')
  ];
};

// Payment validation rules
const paymentValidationRules = () => {
  return [
    body('date').notEmpty().withMessage('Payment date is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('method').notEmpty().withMessage('Payment method is required')
  ];
};

// Note validation rules
const noteValidationRules = () => {
  return [
    body('date').notEmpty().withMessage('Note date is required'),
    body('text').notEmpty().withMessage('Note text is required')
  ];
};

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  return res.status(400).json({
    errors: errors.array().map(error => ({
      field: error.param,
      message: error.msg
    }))
  });
};

export {
  feeRecordValidationRules, noteValidationRules, paymentValidationRules, validate
};
