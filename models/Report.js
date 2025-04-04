import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['students', 'attendance', 'fees', 'results'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  parameters: mongoose.Schema.Types.Mixed,
  data: mongoose.Schema.Types.Mixed,
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);

export default Report;