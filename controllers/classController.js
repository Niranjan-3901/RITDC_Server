// import Class from "../models/Class.js";
// const getClasses = async (req,res)=>{
//     try {
//         const { page = 1, limit = 20, ...filters } = req.query;
//         const Classes = await Class.find(filters)
//           .skip((page - 1) * limit)
//           .limit(limit)
//           .populate('class');

//         const total = await Class.countDocuments(filters);

//         res.status(200).json({
//           success: true,
//           data: Classes,
//           pagination: { total, page, limit, pages: Math.ceil(total / limit) }
//         });
//       } catch (error) {
//         res.status(500).json({ success: false, message: 'Failed to fetch students', error: error.message });
//       }
// }

// const createClasses = async(req,res)=>{
//     try {
//         const classObject = await Class.create(req.body);
//         res.status(201).json({ success: true, data: classObject });
//       } catch (error) {
//         res.status(500).json({ success: false, message: 'Failed to create class', error: error.message });
//       }
// }

// const updateClasses = async(req,res)=>{
//     try {
//         const classObj = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });

//         if (!classObj) {
//           return res.status(404).json({ success: false, message: 'Class not found' });
//         }

//         res.status(200).json({ success: true, data: classObj });
//       } catch(e){
//         res.status(500).json({ success: false, message: 'Failed to update class', error: e.message });
//     }
// }

// const deleteClasses = async(req,res)=>{
//     try {
//         const classObj = await Class.findByIdAndDelete(req.params.id);

//         if (!classObj) {
//           return res.status(404).json({ success: false, message: 'Class not found' });
//         }

//         res.status(200).json({ success: true, data: classObj });
//       } catch(e){
//         res.status(500).json({ success: false, message: 'Failed to delete class', error: e.message });
//     }
// }

// export { createClasses, deleteClasses, getClasses, updateClasses };

import { Class, Section } from "../models/Class.js";
import Student from "../models/Student.js";

// Create a new class
const createClasses = async (req, res) => {
  try {
    const { name, sections } = req.body; // Sections array is passed when creating a class

    // Create new class
    const newClass = new Class({
      name,
      sections: [],
    });

    // Create sections for the class
    const createdSections = await Promise.all(
      sections.map(async (sectionName) => {
        const newSection = new Section({
          name: sectionName,
          class: newClass._id,
        });
        await newSection.save();
        return newSection._id;
      })
    );

    // Add sections to the class
    newClass.sections = createdSections;
    const createdClass = await newClass.save();
    res.status(200).json({
      success: true,
      data:createdClass,
      message: "Class created successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Fetch all classes
const getClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.status(200).json({ 
      status: 'Success',
      data: classes,
      message: "All classes fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch a specific class by ID
const getClassesById = async (req, res) => {
  try {
    const requestedClass = await Class.findById(req.params.id);
    if (!requestedClass) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.status(200).json({success: true,data:requestedClass,message: "Class found"});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a specific class by ID
const updateClasses = async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json({
      success: true,
      data:updatedClass,
      message: "Class updated successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const addNewSectionInAClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { sections } = req.body;
    const createdSections = await Promise.all(
      sections.map(async (sectionName) => {
        const newSection = new Section({
          name: sectionName.trim(),
          class: id,
        });
        await newSection.save();
        return newSection._id;
      })
    );

    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { $push: { sections: { $each: createdSections } } },
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.status(200).json({success: true,data: updatedClass, message: "Class updated Successfully!"});
  } catch (err) {
    res.status(500).json({ message: "Failed to create sections" });
  }
};

// Delete a specific class by ID
const deleteClasses = async (req, res) => {
  try {
    const studentCount = await Student.countDocuments({class: req.params.id})
    if(studentCount > 0){
      return res.status(403).json({ success: false, message: `Cannot delete class with total ${studentCount} students assigned.`});
    }
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    Section.deleteMany({class: req.params.id}).catch(err=>{
      return res.status(500).json({success: false,message: err.message});
    })
    if (!deletedClass) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.status(200).json({ success: true, message: "Class deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClassAndSections = async (req, res) => {
  try {
    let allClasses = await Class.find();

    let response = await Promise.all(
      allClasses.map(async (cls) => ({
        id: cls._id,
        name: cls.name,
        sections: (await Section.find({ class: cls._id })).map((sec) => ({
          id: sec._id,
          name: sec.name,
        })),
      }))
    );

    res.status(200).json({success: true, data: response, message: "Class and Section successfully fetched."});
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch classes and sections: " + e.message });
  }
};


export {
  addNewSectionInAClass,
  createClasses,
  deleteClasses,
  getClassAndSections,
  getClasses,
  getClassesById,
  updateClasses
};

