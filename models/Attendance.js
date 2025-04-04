import mongoose, { Schema } from "mongoose";
const attendanceSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    class: {
        type: Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'Student'
    }],
    attendance: [{
        type: String,
        enum: ["present", "absent", "late"],
        default: "absent",
    }]
},
{
    timestamps: true
})

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;