const mongoose = require('mongoose');

const divisionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: String,
    required: true
  },
  homeClassroom: {
    type: String,
    required: true
  },
  subjects: {
    type: [String],
    required: true,
    default: []
  },
  availability: {
    monday: [String],
    tuesday: [String],
    wednesday: [String],
    thursday: [String],
    friday: [String]
  }
});

divisionSchema.pre('save', function(next) {
  if (!this.subjects) {
    this.subjects = [];
  }
  next();
});

module.exports = mongoose.model('Division', divisionSchema);