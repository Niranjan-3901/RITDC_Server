import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  students: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student', // Assuming you have a Student model
      required: true,
    },
    marksObtained: {
      type: Number,
      required: true,
    },
  }],
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt fields
});

const Exam =  mongoose.model('Exam', examSchema);
export default Exam;