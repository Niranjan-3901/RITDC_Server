import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
});

const Section = mongoose.model('Section', sectionSchema);

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: Section }]
});

const Class = mongoose.model('Class', classSchema);

export {Class, Section};