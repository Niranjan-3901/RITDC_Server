import { Admission, Student } from '../models/index.js';


const getAdmissions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = status ? { status } : {};

    const admissions = await Admission.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('student')
      .sort({ applicationDate: -1 });

    const total = await Admission.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: admissions,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      message: 'Admissions fetched successfully.'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch admissions', 
      error: error.message 
    });
  }
};

const processAdmission = async (req, res) => {
  try {
    const { studentData, admissionData } = req.body;

    const student = await Student.create(studentData);
    const admission = await Admission.create({
      ...admissionData,
      student: student._id
    });

    res.status(201).json({ 
      success: true, 
      data: { student, admission } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Admission processing failed', 
      error: error.message 
    });
  }
};

export { getAdmissions, processAdmission };
