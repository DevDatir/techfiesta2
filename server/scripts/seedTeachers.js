const mongoose = require('mongoose');
require('dotenv').config();
const Teacher = require('../models/Teacher');

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
];

const teachers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    department: 'Computer Science',
    subjects: ['Data Structures', 'Algorithms'],
    lunchBreak: '12:00 PM',
    availability: {
      monday: timeSlots.filter(slot => slot !== '12:00 PM'),
      tuesday: timeSlots.filter(slot => slot !== '12:00 PM'),
      wednesday: timeSlots.filter(slot => slot !== '12:00 PM'),
      thursday: timeSlots.filter(slot => slot !== '12:00 PM'),
      friday: timeSlots.filter(slot => slot !== '12:00 PM')
    }
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    department: 'Computer Science',
    subjects: ['Programming', 'AI'],
    lunchBreak: '1:00 PM',
    availability: {
      monday: timeSlots.filter(slot => slot !== '1:00 PM'),
      tuesday: timeSlots.filter(slot => slot !== '1:00 PM'),
      wednesday: timeSlots.filter(slot => slot !== '1:00 PM'),
      thursday: timeSlots.filter(slot => slot !== '1:00 PM'),
      friday: timeSlots.filter(slot => slot !== '1:00 PM')
    }
  },
  {
    name: 'Bob Wilson',
    email: 'bob@example.com',
    department: 'Information Technology',
    subjects: ['Database', 'Web Development'],
    lunchBreak: '12:00 PM',
    availability: {
      monday: timeSlots.filter(slot => slot !== '12:00 PM'),
      tuesday: timeSlots.filter(slot => slot !== '12:00 PM'),
      wednesday: timeSlots.filter(slot => slot !== '12:00 PM'),
      thursday: timeSlots.filter(slot => slot !== '12:00 PM'),
      friday: timeSlots.filter(slot => slot !== '12:00 PM')
    }
  }
];

async function seedTeachers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Teacher.deleteMany({});
    await Teacher.insertMany(teachers);
    console.log('Teachers seeded successfully');
  } catch (error) {
    console.error('Error seeding teachers:', error);
  } finally {
    await mongoose.connection.close();
  }
}

seedTeachers();