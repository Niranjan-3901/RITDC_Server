import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    admissionNumber: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
    admissionDate: { type: Date, default: Date.now },
    profileImage: { type: String, default: null },
    contactNumber: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    parentName: { type: String, required: true },
    parentContact: { type: String, required: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    notes: { type: String },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);
export default Student;
