const mongoose = require('mongoose');
require('dotenv').config();
const Classroom = require('../models/Classroom');

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
];

const classrooms = [
  {
    roomNumber: '1225',
    building: 'Main Building',
    capacity: 60,
    availability: {
      monday: timeSlots,
      tuesday: timeSlots,
      wednesday: timeSlots,
      thursday: timeSlots,
      friday: timeSlots
    }
  },
  {
    roomNumber: '1328',
    building: 'Main Building',
    capacity: 60,
    availability: {
      monday: timeSlots,
      tuesday: timeSlots,
      wednesday: timeSlots,
      thursday: timeSlots,
      friday: timeSlots
    }
  },
  {
    roomNumber: '1420',
    building: 'Main Building',
    capacity: 60,
    availability: {
      monday: timeSlots,
      tuesday: timeSlots,
      wednesday: timeSlots,
      thursday: timeSlots,
      friday: timeSlots
    }
  }
];

async function seedClassrooms() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Classroom.deleteMany({});
    await Classroom.insertMany(classrooms);
    console.log('Classrooms seeded successfully');
  } catch (error) {
    console.error('Error seeding classrooms:', error);
  } finally {
    await mongoose.connection.close();
  }
}

seedClassrooms(); 