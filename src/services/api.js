// src/services/api.js
const API_URL = 'http://localhost:5001/api';

export const scheduleService = {
  // Generate schedule
  generateSchedule: async (semester, teacherId, divisionId) => {
    try {
      const response = await fetch(`${API_URL}/schedules/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          semester,
          teacherId,
          divisionId 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate schedule');
      }
      
      return data;
    } catch (error) {
      console.error('Error generating schedule:', error);
      throw error;
    }
  },

  // Get generated schedule
  getSchedule: async (semester, teacherId, divisionId) => {
    try {
      let url = `${API_URL}/schedules/semester/${semester}`;
      const params = new URLSearchParams();
      
      if (teacherId) params.append('teacher', teacherId);
      if (divisionId) params.append('division', divisionId);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch schedules');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  }
};

export const studentService = {
  // Add student
  addStudent: async (studentData) => {
    try {
      const response = await fetch(`${API_URL}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  }
};

export const teacherService = {
  // Add teacher
  addTeacher: async (teacherData) => {
    try {
      const response = await fetch(`${API_URL}/teachers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding teacher:', error);
      throw error;
    }
  }
};

export const classroomService = {
  // Add classroom
  addClassroom: async (classroomData) => {
    try {
      const response = await fetch(`${API_URL}/classrooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classroomData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding classroom:', error);
      throw error;
    }
  }
};

export const divisionService = {
  // Add division
  addDivision: async (divisionData) => {
    try {
      const response = await fetch(`${API_URL}/divisions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(divisionData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add division');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding division:', error);
      throw error;
    }
  },

  // Get all divisions
  getDivisions: async () => {
    try {
      const response = await fetch(`${API_URL}/divisions`);
      if (!response.ok) {
        throw new Error('Failed to fetch divisions');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching divisions:', error);
      throw error;
    }
  }
};