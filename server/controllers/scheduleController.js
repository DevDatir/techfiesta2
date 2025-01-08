const { generateTimetable } = require('../algorithms/timetableGenerator');
const Division = require('../models/Division');
const Teacher = require('../models/Teacher');
const Classroom = require('../models/Classroom');
const Schedule = require('../models/Schedule');

exports.generateSchedule = async (req, res) => {
  try {
    const { semester, teacherId, divisionId } = req.body;
    console.log('Starting schedule generation with params:', { semester, teacherId, divisionId });
    
    // Validate semester
    if (!semester) {
      return res.status(400).json({ message: 'Semester is required' });
    }

    // Fetch data with proper filters
    let teacherQuery = {};
    let divisionQuery = { semester };

    if (teacherId) {
      teacherQuery._id = teacherId;
    }
    if (divisionId) {
      divisionQuery._id = divisionId;
    }

    const [divisions, teachers, classrooms] = await Promise.all([
      Division.find(divisionQuery).lean(),
      Teacher.find(teacherQuery).lean(),
      Classroom.find().lean()
    ]);

    console.log('Fetched resources:', {
      divisionsCount: divisions.length,
      teachersCount: teachers.length,
      classroomsCount: classrooms.length
    });

    if (!divisions.length || !teachers.length || !classrooms.length) {
      throw new Error('Insufficient resources for schedule generation');
    }

    // Clear existing schedules based on filters
    let deleteQuery = { semester };
    if (teacherId) deleteQuery.teacher = teacherId;
    if (divisionId) deleteQuery.division = divisionId;
    
    await Schedule.deleteMany(deleteQuery);
    console.log('Cleared existing schedules with query:', deleteQuery);

    // Generate new schedule
    const generatedSchedule = await generateTimetable({
      divisions,
      teachers,
      classrooms,
      semester,
      teacherId,
      divisionId
    });

    if (!generatedSchedule.length) {
      throw new Error('No valid schedule combinations found');
    }

    // Save new schedules
    const savedSchedules = await Schedule.insertMany(generatedSchedule);
    console.log(`Saved ${savedSchedules.length} schedule entries`);

    // Return populated schedules
    const populatedSchedules = await Schedule.find({
      _id: { $in: savedSchedules.map(s => s._id) }
    })
    .populate('teacher', 'name email department')
    .populate('division', 'name')
    .populate('classroom', 'roomNumber building');

    res.status(201).json({
      message: 'Schedule generated successfully',
      count: populatedSchedules.length,
      schedules: populatedSchedules
    });

  } catch (error) {
    console.error('Schedule generation error:', error);
    res.status(500).json({ 
      message: 'Error generating schedule',
      error: error.message,
      details: error.stack
    });
  }
}; 