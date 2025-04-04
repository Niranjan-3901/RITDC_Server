import mongoose from "mongoose";
import { cloudinary } from "../config/uploadImageConfig.js";
import { Class, Section } from "../models/Class.js";
import Fee from "../models/Fee.js";
import Student from "../models/Student.js";

const getStudents = async (req, res) => {
  try {
    const { page = 1, limit = 20, class: classId, section: sectionId, ...otherFilters } = req.query;

    // Validate pagination parameters
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters"
      });
    }

    // Build filter object
    const filters = { ...otherFilters };
    if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      filters.class = classId;
    }
    if (sectionId && mongoose.Types.ObjectId.isValid(sectionId)) {
      filters.section = sectionId;
    }

    // Execute query with proper error handling
    const [students, total] = await Promise.all([
      Student.find(filters)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .populate({ path: "class", select: "name" })
        .populate({ path: "section", select: "name" })
        .lean(),
      Student.countDocuments(filters)
    ]);

    // Transform the response data
    const transformedStudents = students.map(student => ({
      ...student,
      class: student.class?.name || null,
      section: student.section?.name || null,
    }));

    res.status(200).json({
      success: true,
      data: transformedStudents,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber)
      },
      messages: "Student fetched successfully."
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
      error: error.message
    });
  }
};

const addStudent = async (req, res) => {
  try {
    // Determine if we're dealing with a single student or multiple students
    const studentDataArray = Array.isArray(req.body) ? req.body : [req.body];
    
    console.log("Processing student data batch:", studentDataArray.length, "students");
    
    const results = {
      success: [],
      failed: []
    };

    // Process each student entry
    for (const studentData of studentDataArray) {
      try {
        const {
          admissionNumber,
          firstName,
          lastName,
          dateOfBirth,
          classId,
          sectionId,
          admissionDate = Date.now(),
          profileImage = null,
          contactNumber,
          email = null,
          address,
          parentName,
          parentContact,
          status = "Active",
          notes = null
        } = studentData;
        
        // Validate ObjectIds
        if (!classId || !sectionId ||
            !mongoose.Types.ObjectId.isValid(classId) || 
            !mongoose.Types.ObjectId.isValid(sectionId)) {
          results.failed.push({
            student: studentData,
            error: "Invalid Class or Section ID format"
          });
          continue; // Skip to next student
        }

        // Validate Class and Section existence
        const [classExists, sectionExists] = await Promise.all([
          Class.findById(classId),
          Section.findById(sectionId)
        ]);
        
        if (!classExists) {
          results.failed.push({
            student: studentData,
            error: "Class not found"
          });
          continue;
        }
        
        if (!sectionExists) {
          results.failed.push({
            student: studentData,
            error: "Section not found"
          });
          continue;
        }

        // Upload Image to Cloudinary if provided
        let uploadedImage = profileImage;
        if (req.file) {
          // Note: For multiple students, you'd need a different approach for handling multiple files
          const uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: "student_profiles" });
          uploadedImage = uploadResult.secure_url;
        }

        // Create new student entry with all fields
        const student = new Student({
          admissionNumber,
          firstName,
          lastName,
          dateOfBirth,
          class: classId, // Store as ObjectId reference
          section: sectionId, // Store as ObjectId reference
          admissionDate,
          profileImage: uploadedImage,
          contactNumber,
          email,
          address,
          parentName,
          parentContact,
          status,
          notes,
        });

        const savedStudent = await student.save();
        results.success.push(savedStudent);
        
      } catch (studentError) {
        console.error("Error processing individual student:", studentError);
        results.failed.push({
          student: studentData,
          error: studentError.message
        });
      }
    }

    // Return appropriate response based on results
    if (results.success.length > 0 && results.failed.length === 0) {
      // All students were added successfully
      return res.status(201).json({ 
        success: true, 
        message: `Successfully added ${results.success.length} students`,
        data: results.success
      });
    } else if (results.success.length > 0 && results.failed.length > 0) {
      // Some students were added, some failed
      return res.status(207).json({ 
        success: true, 
        message: `Added ${results.success.length} students, ${results.failed.length} failed`,
        data: {
          success: results.success,
          failed: results.failed
        }
      });
    } else {
      // All students failed
      return res.status(400).json({ 
        success: false, 
        message: `Failed to add any students. ${results.failed.length} errors encountered.`,
        errors: results.failed
      });
    }

  } catch (error) {
    console.error("Error in batch student processing:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to process student data", 
      error: error.message 
    });
  }
};

const updateStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    console.log("StudentId: ", studentId);

    // Validate student ID
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Student ID format"
      });
    }

    // Validate and clean the update data
    const updateData = { ...req.body };
    console.log("Original UpdateData: ", JSON.stringify(updateData, null, 2));
    
    // Clean up class and section data to only use IDs
    if (updateData.class && typeof updateData.class === 'object') {
      updateData.class = updateData.class.id || updateData.classId;
    }
    if (updateData.section && typeof updateData.section === 'object') {
      updateData.section = updateData.section.id || updateData.sectionId;
    }

    // Remove any extra fields that shouldn't be updated
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.classId;
    delete updateData.sectionId;

    console.log("Cleaned UpdateData: ", JSON.stringify(updateData, null, 2));
    
    // Validate class and section IDs if present
    if (updateData.class && !mongoose.Types.ObjectId.isValid(updateData.class)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Class ID format"
      });
    }
    if (updateData.section && !mongoose.Types.ObjectId.isValid(updateData.section)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Section ID format"
      });
    }

    // Check if class and section exist if they're being updated
    if (updateData.class || updateData.section) {
      const [classExists, sectionExists] = await Promise.all([
        updateData.class ? Class.findById(updateData.class) : Promise.resolve(true),
        updateData.section ? Section.findById(updateData.section) : Promise.resolve(true)
      ]);

      if (updateData.class && !classExists) {
        return res.status(404).json({
          success: false,
          message: "Specified class not found"
        });
      }
      if (updateData.section && !sectionExists) {
        return res.status(404).json({
          success: false,
          message: "Specified section not found"
        });
      }
    }

    // Update student with validation
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate(['class', 'section']);

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent
    });

  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update student",
      error: error.message
    });
  }
};

const changeStudentSection = async (req, res) => {
  try {
    const { newSectionId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(newSectionId)) {
      return res.status(400).json({ success: false, message: "Invalid Student or Section ID" });
    }

    const sectionExists = await Section.findById(newSectionId);
    if (!sectionExists) {
      return res.status(404).json({ success: false, message: "New Section not found" });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { section: newSectionId },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({ success: true, data: updatedStudent, message: "Student Section Change Successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to change section", error: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Validate student ID
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Student ID format"
      });
    }

    // Find student first to check if they exist and get their details
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // If student has a profile image, delete it from Cloudinary
    if (student.profileImage) {
      try {
        const publicId = student.profileImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`student_profiles/${publicId}`);
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
        // Continue with student deletion even if image deletion fails
      }
    }

    // Delete the student
    await student.deleteOne();

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
      data: {
        deletedStudent: {
          id: student._id,
          admissionNumber: student.admissionNumber,
          name: `${student.firstName} ${student.lastName}`
        }
      }
    });

  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete student",
      error: error.message
    });
  }
};

const importExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file"
      });
    }

    // Import xlsx package
    const XLSX = require('xlsx');
    
    // Read the file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      defval: "N/A", // Default value for empty cells
      raw: false // Convert everything to string
    });

    if (!jsonData.length) {
      return res.status(400).json({
        success: false,
        message: "No data found in the file"
      });
    }

    const results = {
      success: [],
      failed: []
    };

    // Required fields for student
    const requiredFields = [
      'admissionNumber',
      'firstName',
      'lastName',
      'dateOfBirth',
      'class',
      'section',
      'contactNumber',
      'address',
      'parentName',
      'parentContact'
    ];

    // Process each row
    for (const row of jsonData) {
      try {
        // Check for required fields
        const missingFields = requiredFields.filter(field => !row[field]);
        if (missingFields.length > 0) {
          results.failed.push({
            row,
            error: `Missing required fields: ${missingFields.join(', ')}`
          });
          continue;
        }

        // Find or validate class
        const classExists = await Class.findOne({ 
          name: row.class.toString().trim() 
        });
        
        if (!classExists) {
          results.failed.push({
            row,
            error: `Class '${row.class}' not found`
          });
          continue;
        }

        // Find or validate section
        const sectionExists = await Section.findOne({ 
          name: row.section.toString().trim() 
        });
        
        if (!sectionExists) {
          results.failed.push({
            row,
            error: `Section '${row.section}' not found`
          });
          continue;
        }

        // Prepare student data
        const studentData = {
          admissionNumber: row.admissionNumber.toString().trim(),
          firstName: row.firstName.toString().trim(),
          lastName: row.lastName.toString().trim(),
          dateOfBirth: row.dateOfBirth === 'N/A' ? null : new Date(row.dateOfBirth),
          class: classExists._id,
          section: sectionExists._id,
          admissionDate: row.admissionDate === 'N/A' ? new Date() : new Date(row.admissionDate),
          contactNumber: row.contactNumber.toString().trim(),
          email: row.email === 'N/A' ? null : row.email.toString().trim(),
          address: row.address.toString().trim(),
          parentName: row.parentName.toString().trim(),
          parentContact: row.parentContact.toString().trim(),
          status: row.status === 'N/A' ? 'Active' : row.status.toString().trim(),
          notes: row.notes === 'N/A' ? null : row.notes.toString().trim()
        };

        // Check for duplicate admission number
        const existingStudent = await Student.findOne({ 
          admissionNumber: studentData.admissionNumber 
        });
        
        if (existingStudent) {
          results.failed.push({
            row,
            error: `Admission number '${studentData.admissionNumber}' already exists`
          });
          continue;
        }

        // Create and save the student
        const student = new Student(studentData);
        const savedStudent = await student.save();
        results.success.push(savedStudent);

      } catch (rowError) {
        console.error("Error processing row:", rowError);
        results.failed.push({
          row,
          error: rowError.message
        });
      }
    }

    // Prepare response based on results
    if (results.success.length > 0 && results.failed.length === 0) {
      return res.status(201).json({
        success: true,
        message: `Successfully imported ${results.success.length} students`,
        data: results.success
      });
    } else if (results.success.length > 0 && results.failed.length > 0) {
      return res.status(207).json({
        success: true,
        message: `Imported ${results.success.length} students, ${results.failed.length} failed`,
        data: {
          success: results.success,
          failed: results.failed
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Failed to import any students. ${results.failed.length} errors encountered.`,
        errors: results.failed
      });
    }

  } catch (error) {
    console.error("Error importing file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process import file",
      error: error.message
    });
  }
};

const getStudentDetails = async (req, res) => {
  const studentId = req.params.id;
  try {
    const student = await Student.findById(studentId)
      .populate('class', 'name')
      .populate('section', 'name')
      .exec();

    // Fetch fee data for the student
    const feeData = await Fee.find({ student: studentId });
    // .populate("payments", "");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      message: "Student details fetched Successfully.",
      data: {
        student,feeData
        // feeAmount: feeData.feeAmount,
        // feeStatus: feeData.status,
        // nextPaymentDate: feeData.nextPaymentDate,
        // dueDate: feeData.dueDate,
        // payments: [feeData.payments]
      }
    });
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student details",
      error: error.message
    });
  }
};

export default {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  changeStudentSection,
  importExcel,
  getStudentDetails
};
