// server/models/Classroom.js
const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  building: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  availability: {
    monday: [String],
    tuesday: [String],
    wednesday: [String],
    thursday: [String],
    friday: [String]
  }
});

module.exports = mongoose.model('Classroom', classroomSchema);