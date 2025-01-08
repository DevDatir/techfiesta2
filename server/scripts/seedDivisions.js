const mongoose = require('mongoose');
require('dotenv').config();
const Division = require('../models/Division');

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
];

const divisions = [
  {
    name: 'CS-A',
    semester: 'Fall 2024',
    homeClassroom: '101',
    subjects: ['Data Structures', 'Algorithms', 'Programming', 'AI'],
    availability: {
      monday: timeSlots,
      tuesday: timeSlots,
      wednesday: timeSlots,
      thursday: timeSlots,
      friday: timeSlots
    }
  },
  {
    name: 'CS-B',
    semester: 'Fall 2024',
    homeClassroom: '102',
    subjects: ['Data Structures', 'Algorithms', 'Programming', 'AI'],
    availability: {
      monday: timeSlots,
      tuesday: timeSlots,
      wednesday: timeSlots,
      thursday: timeSlots,
      friday: timeSlots
    }
  },
  {
    name: 'IT-A',
    semester: 'Fall 2024',
    homeClassroom: '103',
    subjects: ['Programming', 'Database', 'Web Development', 'AI'],
    availability: {
      monday: timeSlots,
      tuesday: timeSlots,
      wednesday: timeSlots,
      thursday: timeSlots,
      friday: timeSlots
    }
  }
];

async function seedDivisions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Division.deleteMany({});
    console.log('Cleared existing divisions');

    const result = await Division.insertMany(divisions);
    console.log(`Successfully inserted ${result.length} divisions`);

  } catch (error) {
    console.error('Error seeding divisions:', error);
  } finally {
    await mongoose.connection.close();
  }
}

seedDivisions();