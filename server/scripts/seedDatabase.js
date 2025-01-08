const mongoose = require('mongoose');
require('dotenv').config();
const Division = require('../models/Division');
const Teacher = require('../models/Teacher');
const Classroom = require('../models/Classroom');
const Schedule = require('../models/Schedule');

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
];

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

const generateAvailability = (lunchBreak) => {
  const availability = {};
  days.forEach(day => {
    availability[day] = timeSlots.filter(slot => slot !== lunchBreak);
  });
  return availability;
};

const seedData = {
  teachers: [
    {
      name: 'John Doe',
      email: 'john@example.com',
      department: 'Computer Science',
      subjects: ['Data Structures', 'Algorithms'],
      lunchBreak: '12:00 PM',
      availability: generateAvailability('12:00 PM')
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      department: 'Computer Science',
      subjects: ['Programming', 'AI'],
      lunchBreak: '1:00 PM',
      availability: generateAvailability('1:00 PM')
    },
    {
      name: 'Bob Wilson',
      email: 'bob@example.com',
      department: 'Information Technology',
      subjects: ['Database', 'Web Development'],
      lunchBreak: '12:00 PM',
      availability: generateAvailability('12:00 PM')
    }
  ],
  divisions: [
    {
      name: 'CS-A',
      semester: 'Fall 2024',
      subjects: ['Data Structures', 'Algorithms', 'Programming', 'AI'],
      availability: generateAvailability(null)
    },
    {
      name: 'CS-B',
      semester: 'Fall 2024',
      subjects: ['Data Structures', 'Algorithms', 'Programming', 'AI'],
      availability: generateAvailability(null)
    },
    {
      name: 'IT-A',
      semester: 'Fall 2024',
      subjects: ['Programming', 'Database', 'Web Development', 'AI'],
      availability: generateAvailability(null)
    }
  ],
  classrooms: [
    {
      roomNumber: '101',
      building: 'Main Building',
      capacity: 60,
      availability: generateAvailability(null)
    },
    {
      roomNumber: '102',
      building: 'Main Building',
      capacity: 60,
      availability: generateAvailability(null)
    },
    {
      roomNumber: '103',
      building: 'Main Building',
      capacity: 60,
      availability: generateAvailability(null)
    }
  ]
};

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Division.deleteMany({}),
      Teacher.deleteMany({}),
      Classroom.deleteMany({}),
      Schedule.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Insert new data
    await Promise.all([
      Division.insertMany(seedData.divisions),
      Teacher.insertMany(seedData.teachers),
      Classroom.insertMany(seedData.classrooms)
    ]);
    console.log('Database seeded successfully');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
  }
}

seedDatabase(); 