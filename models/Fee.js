// import mongoose from 'mongoose';

// const feeSchema = new mongoose.Schema({
//   student: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Student', 
//     required: true 
//   },
//   class: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Class', 
//     required: true 
//   },
//   section: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Section', 
//     required: true 
//   },

//   // Fee Details
//   amount: { 
//     type: Number, 
//     required: true 
//   },
//   dueDate: { 
//     type: Date, 
//     required: true 
//   },
//   status: { 
//     type: String, 
//     enum: ['Pending', 'Partial', 'Paid', 'Overdue'], 
//     default: 'Pending' 
//   },

//   // Payment History
//   payments: [{
//     amount: { 
//       type: Number, 
//       required: true 
//     },
//     date: { 
//       type: Date, 
//       default: Date.now 
//     },
//     method: { 
//       type: String, 
//       enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other'],
//       required: true 
//     },
//     receiptNo: { 
//       type: String, 
//       required: true,
//       unique: true 
//     },
//     reference: String,
//     notes: String
//   }],

//   // Fee Type and Period
//   feeType: { 
//     type: String, 
//     enum: ['Tuition', 'Transport', 'Library', 'Laboratory', 'Other'],
//     required: true 
//   },
//   academicYear: { 
//     type: String, 
//     required: true 
//   },
//   term: { 
//     type: String, 
//     enum: ['Term1', 'Term2', 'Term3', 'Annual'],
//     required: true 
//   },

//   // Timestamps
//   createdAt: { 
//     type: Date, 
//     default: Date.now 
//   },
//   updatedAt: { 
//     type: Date, 
//     default: Date.now 
//   }
// }, {
//   timestamps: true
// });

// // Indexes for better query performance
// feeSchema.index({ student: 1, academicYear: 1, term: 1 });
// feeSchema.index({ status: 1 });
// feeSchema.index({ dueDate: 1 });

// // Virtual field for total paid amount
// feeSchema.virtual('totalPaid').get(function() {
//   return this.payments.reduce((sum, payment) => sum + payment.amount, 0);
// });

// // Virtual field for remaining balance
// feeSchema.virtual('remainingBalance').get(function() {
//   const totalPaid = this.payments.reduce((sum, payment) => sum + payment.amount, 0);
//   return this.amount - totalPaid;
// });

// // Method to check if fee is overdue
// feeSchema.methods.isOverdue = function() {
//   return this.status !== 'Paid' && new Date() > this.dueDate;
// };

// const Fee = mongoose.model('Fee', feeSchema);

// export default Fee;

// models/FeeRecord.js
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