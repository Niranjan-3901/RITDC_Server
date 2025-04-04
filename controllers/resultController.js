import Exam from '../models/Exam.js';
import Result from '../models/Result.js';

const getResults = async (req, res) => {
  try {
    const { examId, classId } = req.query;
    const filter = { exam: examId };
    if (classId) filter.class = classId;

    const results = await Result.find(filter)
      .populate('student')
      .populate('class')
      .populate('exam');

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch results', 
      error: error.message 
    });
  }
};

const uploadResults = async (req, res) => {
  try {
    const { examId, results } = req.body;
    
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ 
        success: false, 
        message: 'Exam not found' 
      });
    }

    const processedResults = await Promise.all(results.map(async result => {
      const existing = await Result.findOne({
        exam: examId,
        student: result.studentId
      });

      const totalMarks = result.subjects.reduce((sum, sub) => sum + sub.marksObtained, 0);
      const percentage = (totalMarks / result.subjects.reduce((sum, sub) => sum + sub.maxMarks, 0)) * 100;

      const grade = calculateGrade(percentage); // Implement your grading logic

      if (existing) {
        existing.subjects = result.subjects;
        existing.totalMarks = totalMarks;
        existing.percentage = percentage;
        existing.grade = grade;
        return existing.save();
      }

      return Result.create({
        exam: examId,
        student: result.studentId,
        class: result.classId,
        subjects: result.subjects,
        totalMarks,
        percentage,
        grade,
        publishedBy: req.user.id
      });
    }));

    res.status(200).json({ 
      success: true, 
      count: processedResults.length, 
      message: 'Results uploaded successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Result upload failed', 
      error: error.message 
    });
  }
};

export { getResults, uploadResults };
