import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  exam: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Exam', 
    required: true 
  },
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  class: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class', 
    required: true 
  },
  subjects: [{
    name: String,
    marksObtained: Number,
    maxMarks: Number,
    grade: String
  }],
  totalMarks: Number,
  percentage: Number,
  grade: String,
  publishedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  publishedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Result = mongoose.model('Result', resultSchema);

export default Result;