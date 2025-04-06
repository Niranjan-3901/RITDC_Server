// controllers/feeController.js
import { addDays, addMonths, format } from "date-fns";
import FeeRecord from "../models/Fee.js";
import Student from "../models/Student.js"; // Import the existing Student model

// Utility function to calculate status based on payments and due date
const calculateStatus = (payments, feeAmount, dueDate) => {
  // Calculate the total paid amount
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  // Determine the status
  let status = "unpaid";
  if (totalPaid >= feeAmount) {
    status = "paid";
  } else if (totalPaid > 0) {
    status = "partial";
  }

  // Check if overdue
  const today = new Date();
  const dueDateObj = new Date(dueDate);
  if (today > dueDateObj && status !== "paid") {
    status = "overdue";
  }

  return status;
};

// Get all fee records with student information
const getAllFeeRecords = async (req, res) => {
  try {

    const {page = 1, limit = 20} = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters"
      });
    }

    const [feeRecords, total] = await Promise.all([
      FeeRecord.find()
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate(
      "student",
      "admissionNumber firstName lastName class section"
    ),
    FeeRecord.countDocuments(),
    ]);
    res.status(200).json({
      success: true,
      data: feeRecords,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        totalItems:total,
        itemsPerPage: limitNumber,
      },
      message: "Fee Record successfully fetched.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get fee record by ID
const getFeeRecordById = async (req, res) => {
  try {
    const feeRecord = await FeeRecord.findById(req.params.id).populate(
      "student",
      "admissionNumber firstName lastName class section contactNumber email parentName parentContact"
    );

    if (!feeRecord) {
      return res.status(404).json({ message: "Fee record not found" });
    }
    res.status(200).json({
      success: true,
      data: feeRecord,
      message: "Fee record successfully fetched.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get fee records for a specific student
const getStudentFeeRecords = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const feeRecords = await FeeRecord.find({ student: studentId });

    res.status(200).json({
      success: true,
      data: feeRecords,
      message: "Fee records successfully fetched.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new fee record
const createFeeRecord = async (req, res) => {
  try {
    const { studentId, feeData } = req.body;

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Calculate next payment date and due date (based on admission date or current date)
    const admissionDate = student.admissionDate || new Date();
    const nextPaymentDate = addMonths(admissionDate, 1);
    const dueDate = addDays(nextPaymentDate, 15);

    const newFeeRecord = new FeeRecord({
      student: studentId,
      serialNumber,
      feeAmount,
      status: "unpaid",
      nextPaymentDate: format(nextPaymentDate, "yyyy-MM-dd"),
      dueDate: format(dueDate, "yyyy-MM-dd"),
      payments: [],
      notes: [],
      academicYear,
      term,
    });

    const savedFeeRecord = await newFeeRecord.save();

    // Populate student info for response
    const populatedRecord = await FeeRecord.findById(
      savedFeeRecord._id
    ).populate("student", "admissionNumber firstName lastName");

    res.status(201).json(populatedRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update fee record
const updateFeeRecord = async (req, res) => {
  try {
    const updatedFeeRecord = await FeeRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("student", "admissionNumber firstName lastName");

    if (!updatedFeeRecord) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    res.status(200).json({
      success: true,
      data: updatedFeeRecord,
      message: "Fee record updated successfully.",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete fee record
const deleteFeeRecord = async (req, res) => {
  try {
    const deletedFeeRecord = await FeeRecord.findByIdAndDelete(req.params.id);

    if (!deletedFeeRecord) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Fee record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add payment to fee record
const addPayment = async (req, res) => {
  try {
    const { date, amount, method, reference } = req.body;

    const feeRecord = await FeeRecord.findById(req.params.id);
    if (!feeRecord) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    const payment = {
      date,
      amount,
      method,
      reference,
    };

    feeRecord.payments.push(payment);

    // Recalculate status
    feeRecord.status = calculateStatus(
      feeRecord.payments,
      feeRecord.feeAmount,
      feeRecord.dueDate
    );

    await feeRecord.save();

    // Populate student info for response
    const populatedRecord = await FeeRecord.findById(feeRecord._id).populate(
      "student",
      "admissionNumber firstName lastName"
    );
    res.status(200).json({
      success: true,
      data: {...populatedRecord, student:{
        id: populatedRecord.student._id,
        admissionNumber: populatedRecord.student.admissionNumber,
        firstName: populatedRecord.student.firstName,
        lastName: populatedRecord.student.lastName,
      }},
      message: "Payment Added Successfully.",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add note to fee record
const addNote = async (req, res) => {
  try {
    const { date, text } = req.body;

    const feeRecord = await FeeRecord.findById(req.params.id);
    if (!feeRecord) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    // Add note
    const note = {
      date,
      text,
    };

    feeRecord.notes.push(note);
    await feeRecord.save();

    // Populate student info for response
    const populatedRecord = await FeeRecord.findById(feeRecord._id).populate(
      "student",
      "admissionNumber firstName lastName"
    );

    res.status(200).json({
      data: populatedRecord,
      success: true,
      message: "Note Added Successfully.",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get fee records by status filter
const getFeeRecordsByStatus = async (req, res) => {
  try {
    const status = req.params.status;
    const {page = 1, limit = 20} = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters"
      });
    }

    const [feeRecords, total] = await Promise.all([
      FeeRecord.find({ status })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate(
      "student",
      "admissionNumber firstName lastName class section"
    ),
    FeeRecord.find({status}).countDocuments(),
    ]);

    res.status(200).json({
      data: feeRecords,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        totalItems:total,
        itemsPerPage: limitNumber,
      },
      success: true,
      message: "Fee Record successfully fetched.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk import fee records
const importFeeRecords = async (req, res) => {
  try {
    const feeRecordsData = req.body;
    console.log("Fee Record Data: ", JSON.stringify(feeRecordsData, null, 2));

    if (!Array.isArray(feeRecordsData)) {
      return res
        .status(400)
        .json({ message: "Invalid data format, expected an array" });
    }

    const savedFeeRecords = [];
    const errors = [];

    for (const data of feeRecordsData) {
      try {
        const student = await Student.findOneAndUpdate(
          { admissionNumber: data.admissionNumber },
          {
            $setOnInsert: {
              firstName: data.firstName || "N/A",
              lastName: data.lastName || "N/A",
              dateOfBirth: data.dateOfBirth || new Date(),
              class: data.class || "67cd2d19bcae96c2dd022b8a",
              section: data.section || "67cd2d19bcae96c2dd022b8a",
              admissionDate: data.admissionDate || new Date(),
              profileImage: null,
              contactNumber: data.contactNumber || "N/A",
              email: data.email || "N/A",
              address: data.address || "N/A",
              parentName: data.parentName || "N/A",
              parentContact: data.parentContact || "N/A",
              status: "Active",
              notes: data.notes || "N/A",
            },
          },
          { new: true, upsert: true }
        );
    
        const feeRecord = new FeeRecord({
          student: student._id,
          serialNumber: data.serialNumber || `SN${Date.now()}-${index}`,
          feeAmount: data.feeAmount,
          admissionDate: data.admissionDate || new Date(),
          status: data.status || "unpaid",
          nextPaymentDate: data.nextPaymentDate,
          dueDate: data.dueDate,
          payments: data.payments || [],
          notes: data.notes || [],
          academicYear: data.academicYear || new Date().getFullYear().toString(),
          term: data.term || "Annual",
        });
    
        const savedRecord = await feeRecord.save();
        savedFeeRecords.push({
          ...savedRecord.toObject(),
          student: {
            id: student._id,
            firstName: student.firstName,
            lastName: student.lastName,
            admissionNumber: student.admissionNumber,
          },
        });
      } catch (error) {
        console.error(`Error saving fee record:`, error);
        errors.push({ error: error.message });
      }
    }
    const pageNumber = 1;
    const limitNumber = 10;
    const paginatedRecords = savedFeeRecords.slice((pageNumber - 1) * limitNumber, pageNumber * limitNumber);
    const totalRecords = savedFeeRecords.length;

    res.status(201).json({
      success: true,
      message: `${savedFeeRecords.length} fee records imported successfully`,
      data: {
        successCount: paginatedRecords.length,
        errorCount: errors.length,
        errors: errors,
        feeRecords: paginatedRecords,
      },
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalRecords / limitNumber),
        totalItems:totalRecords,
        itemsPerPage: limitNumber,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get class-wise fee collection report
const getClassFeeReport = async (req, res) => {
  try {
    const { classId, academicYear } = req.params;

    // Find all students in the class
    const students = await Student.find({ class: classId });
    const studentIds = students.map((student) => student._id);

    // Find fee records for these students
    const feeRecords = await FeeRecord.find({
      student: { $in: studentIds },
      academicYear: academicYear,
    }).populate("student", "admissionNumber firstName lastName");

    // Calculate statistics
    const totalDue = feeRecords.reduce(
      (sum, record) => sum + record.feeAmount,
      0
    );
    const totalCollected = feeRecords.reduce((sum, record) => {
      return (
        sum +
        record.payments.reduce(
          (paymentSum, payment) => paymentSum + payment.amount,
          0
        )
      );
    }, 0);

    const statusCounts = {
      paid: feeRecords.filter((record) => record.status === "paid").length,
      partial: feeRecords.filter((record) => record.status === "partial")
        .length,
      unpaid: feeRecords.filter((record) => record.status === "unpaid").length,
      overdue: feeRecords.filter((record) => record.status === "overdue")
        .length,
    };

    res.status(200).json({
      success: true,
      data: {
        totalStudents: students.length,
        totalDue,
        totalCollected,
        pendingAmount: totalDue - totalCollected,
        collectionPercentage: (totalCollected / totalDue) * 100,
        statusCounts,
        feeRecords,
      },
      message: "Fee Report fetched Successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getStudentFeeRecords,
  createFeeRecord,
  updateFeeRecord,
  deleteFeeRecord,
  getClassFeeReport,
  importFeeRecords,
  getFeeRecordById,
  getAllFeeRecords,
  getFeeRecordsByStatus,
  addNote,
  addPayment,
};
