// routes/feeRoutes.js
// const express = require('express');
import express from 'express';
import feeController from '../controllers/feeController.js';
import { validateObjectId } from '../middleware/errorHandler.js';
import {
  noteValidationRules,
  paymentValidationRules,
  validate
} from '../middleware/validation.js';
const router = express.Router();

// Get all fee records
router.get('/', feeController.getAllFeeRecords);

// Get fee record by ID
router.get('/:id', validateObjectId("id"),feeController.getFeeRecordById);

// Get fee records for a specific student
router.get('/student/:studentId', validateObjectId("studentId"),feeController.getStudentFeeRecords);

// Create new fee record
router.post('/', feeController.createFeeRecord);

// Update fee record
router.put('/:id', validateObjectId('id'),feeController.updateFeeRecord);

// Delete fee record
router.delete('/:id', validateObjectId("id"),feeController.deleteFeeRecord);

// Add payment to fee record
router.post('/:id/payments', validateObjectId("id"),paymentValidationRules(), validate, feeController.addPayment);

// Add note to fee record
router.post('/:id/notes', validateObjectId("id"),noteValidationRules(), validate, feeController.addNote);

// Get fee records by filter (status)
router.get('/filter/:status', feeController.getFeeRecordsByStatus);

// Bulk import fee records
router.post('/import', feeController.importFeeRecords);

// Get class-wise fee collection report
router.get('/report/class/:classId/:academicYear', validateObjectId("classId"),feeController.getClassFeeReport);

export default router;