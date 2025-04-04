import Attendance from '../models/Attendance.js';
import Fee from '../models/Fee.js';
import Report from "../models/Report.js";
import Result from '../models/Result.js';
import Student from '../models/Student.js';

const generateReport = async (resData) => {
  try {
    const { reportType, filters } = req.body;
    let reportData;

    switch (reportType) {
      case 'students':
        reportData = await generateStudentReport(filters);
        break;
      case 'attendance':
        reportData = await generateAttendanceReport(filters);
        break;
      case 'fees':
        reportData = await generateFeeReport(filters);
        break;
      case 'results':
        reportData = await generateResultReport(filters);
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid report type' 
        });
    }

    const report = await Report.create({
      type: reportType,
      parameters: filters,
      data: reportData,
      generatedBy: req.user.id
    });

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Report generation failed', 
      error: error.message 
    });
  }
};

const generateStudentReport = async (filters) => {
  const students = await Student.find(filters)
    .populate('class');

  return {
    totalStudents: students.length,
    statusDistribution: students.reduce((acc, student) => {
      acc[student.status] = (acc[student.status] || 0) + 1;
      return acc;
    }, {}),
    classDistribution: students.reduce((acc, student) => {
      const className = student.class?.name || 'Unknown';
      acc[className] = (acc[className] || 0) + 1;
      return acc;
    }, {})
  };
};

const generateAttendanceReport = async (filters) => {
  const attendanceRecords = await Attendance.find(filters)
    .populate('class');

  // Implement attendance calculations
  return { /* ... */ };
};

const generateFeeReport = async (filters) => {
  const fees = await Fee.find(filters);
  
  return {
    totalFees: fees.reduce((sum, fee) => sum + fee.amount, 0),
    totalPaid: fees.reduce((sum, fee) => sum + 
      fee.payments.reduce((pSum, p) => pSum + p.amount, 0), 0),
    pendingAmount: fees.reduce((sum, fee) => sum + 
      (fee.amount - fee.payments.reduce((pSum, p) => pSum + p.amount, 0)), 0)
  };
};

const generateResultReport = async (filters) => {
  const results = await Result.find(filters)
    .populate('student')
    .populate('exam');

  return {
    averagePercentage: results.length > 0 
      ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length 
      : 0,
    gradeDistribution: results.reduce((acc, result) => {
      acc[result.grade] = (acc[result.grade] || 0) + 1;
      return acc;
    }, {})
  };
};

export { generateReport };
