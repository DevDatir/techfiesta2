// server/models/Schedule.js
const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    division: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Division',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true
    },
    dayOfWeek: {
        type: String,
        required: true,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    timeSlot: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Add index for better query performance
scheduleSchema.index({ semester: 1, dayOfWeek: 1, timeSlot: 1 });
scheduleSchema.index({ teacher: 1, dayOfWeek: 1, timeSlot: 1 });
scheduleSchema.index({ division: 1, dayOfWeek: 1, timeSlot: 1 });
scheduleSchema.index({ classroom: 1, dayOfWeek: 1, timeSlot: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);