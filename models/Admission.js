import mongoose from 'mongoose';

const admissionSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Applied', 'Processing', 'Approved', 'Rejected'],
    default: 'Applied'
  },
  documents: [{
    name: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  processingFee: {
    amount: Number,
    paid: Boolean,
    transactionDetails: {
      date: Date,
      method: String,
      reference: String
    }
  },
  comments: [{
    text: String,
    by: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    at: { 
      type: Date, 
      default: Date.now 
    }
  }]
});

const Admission = mongoose.model('Admission', admissionSchema);

export default Admission;