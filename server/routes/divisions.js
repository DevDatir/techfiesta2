const express = require('express');
const router = express.Router();
const Division = require('../models/Division');

// GET all divisions
router.get('/', async (req, res) => {
  try {
    const divisions = await Division.find();
    res.json(divisions);
  } catch (error) {
    console.error('Error fetching divisions:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST new division
router.post('/', async (req, res) => {
  try {
    const { name, semester, homeClassroom, subjects, availability } = req.body;

    // Validate required fields
    if (!name || !semester || !homeClassroom || !subjects || !subjects.length) {
      return res.status(400).json({
        message: 'Missing required fields. Name, semester, homeClassroom, and subjects are required'
      });
    }

    // Create new division
    const division = new Division({
      name: name.trim(),
      semester: semester.trim(),
      homeClassroom: homeClassroom.trim(),
      subjects,
      availability: availability || {
        monday: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
        tuesday: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
        wednesday: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
        thursday: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
        friday: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM']
      }
    });

    const savedDivision = await division.save();
    res.status(201).json(savedDivision);
  } catch (error) {
    console.error('Error creating division:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT update division
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { subjects, ...updateData } = req.body;

    // Ensure subjects is an array if provided
    if (subjects && !Array.isArray(subjects)) {
      return res.status(400).json({ message: 'Subjects must be an array' });
    }

    const division = await Division.findByIdAndUpdate(
      id,
      { ...updateData, subjects: subjects || [] },
      { new: true, runValidators: true }
    );

    if (!division) {
      return res.status(404).json({ message: 'Division not found' });
    }

    res.json(division);
  } catch (error) {
    console.error('Error updating division:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
