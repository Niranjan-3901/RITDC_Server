import mongoose from 'mongoose';
import { Class, Section } from '../models/Class.js';
import Student from '../models/Student.js';


// Get all sections
const getAllSections = async (req, res) => {
  try {
    const { page = 1, limit = 20, ...filters } = req.query;
    const sections = await Section.find(filters)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('class', 'name');
    const total = await Section.countDocuments(filters);

    res.status(200).json({
      success: true,
      data: sections,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      message:"Section fetched successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch Section', error: error.message });
  }
};

const getSectionsByClassId = async (req,res)=>{
  try{
    const { classId } = req.params;
    const sections = await Section.find({ class: classId }).populate('class', 'name');
    res.status(200).json({ success: true, data: sections, message: "Section fetched successfully." });
  }catch(error){
    res.status(500).json({ success: false, message: 'Failed to fetch sections', error: error.message });
  }
}

const getSectionById = async (req, res) => {
  try {

    const { id } = req.params;

    // Validate if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid section ID' });
    }

    const section = await Section.findById(req.params.id).populate('class', 'name');
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    res.status(200).json({success: true,data: section, message: "Section fetched successfully."});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Switch section from a class to another class
const switchSectionClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, class: newClassId } = req.body;

    // Find the section by ID
    const section = await Section.findById(id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // If class is being changed, verify the new class exists
    if (newClassId && newClassId !== section.class.toString()) {
      const newClass = await Class.findById(newClassId);
      if (!newClass) {
        return res.status(404).json({ message: 'New class not found' });
      }

      // Remove section from old class
      await Class.findByIdAndUpdate(section.class, { $pull: { sections: section._id } });

      // Add section to new class
      await Class.findByIdAndUpdate(newClassId, { $push: { sections: section._id } });

      // Update section's class
      section.class = newClassId;
    }

    // Update section name if provided
    if (name) {
      section.name = name;
    }

    // Save the updated section
    await section.save();

    res.status(200).json({success: true,data:section, message: "Section Switched Successfully."});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSectionName = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    if (req.body.name) {
      section.name = req.body.name?.trim();
    }

    await section.save();

    res.status(200).json({
      success: true,
      message: 'Section name updated successfully',
      data: section
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSection = async (req, res) => {
  try {
    // check if section is associated with any student then don't allowed to delete the section
    const studentCount = await Student.countDocuments({ section: req.params.id });
    if (studentCount > 0) {
      return res.status(403).json({status:false, message: `Cannot delete section associated with ${studentCount} students`});
    }

    // delete the section and remove it from the class's sections list
    const section = await Section.findByIdAndDelete(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    await Class.findByIdAndUpdate(section.class, { $pull: { sections: section._id } });

    res.status(200).json({success: true, message: 'Section deleted successfully' });  
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { deleteSection, getAllSections, getSectionById, getSectionsByClassId, switchSectionClass, updateSectionName };

