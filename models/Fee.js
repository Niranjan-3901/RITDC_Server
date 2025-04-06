import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Payment Schema (Sub-document)
const PaymentSchema = new Schema({
  date: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    required: true
  },
  reference: {
    type: String
  }
}, { timestamps: true });

// Note Schema (Sub-document)
const FeeNoteSchema = new Schema({
  date: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Main Fee Record Schema
const FeeRecordSchema = new Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true
  },
  feeAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['paid', 'unpaid', 'partial', 'overdue'],
    default: 'unpaid'
  },
  admissionDate:{
    type: String,
    required: true
  },
  nextPaymentDate: {
    type: String,
    required: true
  },
  dueDate: {
    type: String,
    required: true
  },
  payments: [PaymentSchema],
  notes: [FeeNoteSchema],
  academicYear: {
    type: String,
    required: true
  },
  term: {
    type: String,
    required: true,
    enum: ['Term 1', 'Term 2', 'Term 3', 'Annual']
  }
}, { timestamps: true });

const Fee = mongoose.model('FeeRecord', FeeRecordSchema);
export default Fee