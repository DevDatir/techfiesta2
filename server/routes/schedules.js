// server/routes/schedules.js
const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const Teacher = require('../models/Teacher');
const Division = require('../models/Division');
const Classroom = require('../models/Classroom');
const AGADRScheduler = require('../algorithms/AGADRScheduler');

// Get schedules with filters
router.get('/semester/:semester', async (req, res) => {
  try {
    const { semester } = req.params;
    const { teacher: teacherId, division: divisionId } = req.query;
    
    let query = { semester };
    if (teacherId && teacherId !== 'all') query.teacher = teacherId;
    if (divisionId && divisionId !== 'all') query.division = divisionId;
    
    const schedules = await Schedule.find(query)
      .populate('teacher', 'name email department')
      .populate('division', 'name')
      .populate('classroom', 'roomNumber building')
      .sort({ 
        dayOfWeek: 1,
        timeSlot: 1
      });
      
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ message: error.message });
  }
});

// Generate schedule
router.post('/generate', async (req, res) => {
  try {
    const { semester, teacherId, divisionId } = req.body;
    console.log('Starting schedule generation for:', { semester, teacherId, divisionId });

    if (!semester) {
      return res.status(400).json({ 
        success: false, 
        message: 'Semester is required' 
      });
    }

    // Build queries
    const teacherQuery = teacherId ? { _id: teacherId } : {};
    const divisionQuery = divisionId ? { _id: divisionId } : { semester };

    // Fetch resources
    const [teachers, divisions, classrooms] = await Promise.all([
      Teacher.find(teacherQuery).lean(),
      Division.find(divisionQuery).lean(),
      Classroom.find().lean()
    ]);

    // Validate resources
    if (!teachers.length || !divisions.length || !classrooms.length) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient resources',
        details: {
          teachersFound: teachers.length,
          divisionsFound: divisions.length,
          classroomsFound: classrooms.length
        }
      });
    }

    // Validate teachers have subjects
    const teachersWithSubjects = teachers.filter(t => t.subjects?.length > 0);
    if (teachersWithSubjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No teachers with subjects found'
      });
    }

    // Clear existing schedules
    const deleteQuery = { semester };
    if (teacherId) deleteQuery.teacher = teacherId;
    if (divisionId) deleteQuery.division = divisionId;
    await Schedule.deleteMany(deleteQuery);

    // Generate schedule
    const generatedSchedule = await AGADRScheduler.evolve(teachers, divisions, classrooms, semester);

    if (!generatedSchedule || !generatedSchedule.length) {
      return res.status(400).json({
        success: false,
        message: 'Could not generate a valid schedule'
      });
    }

    // Save and return schedule
    const savedSchedules = await Schedule.insertMany(generatedSchedule);
    const populatedSchedules = await Schedule.find({
      _id: { $in: savedSchedules.map(s => s._id) }
    })
    .populate('teacher', 'name email department')
    .populate('division', 'name')
    .populate('classroom', 'roomNumber building')
    .sort({ dayOfWeek: 1, timeSlot: 1 });

    res.status(201).json({
      success: true,
      message: 'Schedule generated successfully',
      count: populatedSchedules.length,
      schedules: populatedSchedules
    });

  } catch (error) {
    console.error('Schedule generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating schedule',
      error: error.message
    });
  }
});

module.exports = router;