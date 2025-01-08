const mongoose = require('mongoose');
require('dotenv').config();
const Division = require('../models/Division');

const defaultSubjects = {
  'CS-A': ['Data Structures', 'Algorithms', 'Programming', 'AI'],
  'CS-B': ['Data Structures', 'Algorithms', 'Programming', 'AI'],
  'IT-A': ['Programming', 'Database', 'Web Development', 'AI']
};

async function updateDivisionSubjects() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const divisions = await Division.find();
    
    for (const division of divisions) {
      if (!division.subjects || division.subjects.length === 0) {
        division.subjects = defaultSubjects[division.name] || [];
        await division.save();
        console.log(`Updated subjects for division ${division.name}`);
      }
    }

    console.log('All divisions updated successfully');
  } catch (error) {
    console.error('Error updating divisions:', error);
  } finally {
    await mongoose.connection.close();
  }
}

updateDivisionSubjects(); 