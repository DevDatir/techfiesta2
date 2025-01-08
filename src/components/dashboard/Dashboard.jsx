import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2 } from 'lucide-react';
import { scheduleService } from '../../services/api';

const Dashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState('Fall 2024');
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [divisions, setDivisions] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'list'

  useEffect(() => {
    fetchDivisions();
    fetchTeachers();
    fetchSchedules();
  }, [selectedSemester, selectedDivision, selectedTeacher]);

  const fetchDivisions = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/divisions');
      if (!response.ok) throw new Error('Failed to fetch divisions');
      const data = await response.json();
      setDivisions(data);
    } catch (error) {
      setError('Error loading divisions: ' + error.message);
      console.error('Error fetching divisions:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/teachers');
      if (!response.ok) throw new Error('Failed to fetch teachers');
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      setError('Error loading teachers: ' + error.message);
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      
      const data = await scheduleService.getSchedule(
        selectedSemester,
        selectedTeacher !== 'all' ? selectedTeacher : null,
        selectedDivision !== 'all' ? selectedDivision : null
      );
      
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError(error.message || 'Failed to fetch schedules');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const generateNewSchedule = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await scheduleService.generateSchedule(
        selectedSemester,
        selectedTeacher !== 'all' ? selectedTeacher : null,
        selectedDivision !== 'all' ? selectedDivision : null
      );

      if (response.success) {
        await fetchSchedules();
      } else {
        throw new Error(response.message || 'Failed to generate schedule');
      }
    } catch (error) {
      console.error('Error generating schedule:', error);
      setError(error.message || 'Failed to generate schedule');
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

  const renderTableView = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Time Slot</th>
              {weekDays.map(day => (
                <th key={day} className="px-4 py-2 border capitalize">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(timeSlot => (
              <tr key={timeSlot}>
                <td className="px-4 py-2 border font-medium">{timeSlot}</td>
                {weekDays.map(day => {
                  const schedule = schedules.find(s => 
                    s.dayOfWeek === day && 
                    s.timeSlot === timeSlot
                  );
                  return (
                    <td key={`${day}-${timeSlot}`} className="px-4 py-2 border">
                      {schedule ? (
                        <div className="p-2 bg-blue-50 rounded">
                          <p className="font-medium">{schedule.subject}</p>
                          <p className="text-sm">{schedule.teacher?.name}</p>
                          <p className="text-sm text-gray-600">
                            {schedule.division?.name} | Room {schedule.classroom?.roomNumber}
                          </p>
                        </div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="border rounded p-2"
            >
              <option value="Fall 2024">Fall 2024</option>
              <option value="Spring 2025">Spring 2025</option>
            </select>

            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="border rounded p-2"
            >
              <option value="all">All Divisions</option>
              {divisions.map((division) => (
                <option key={division._id} value={division._id}>
                  {division.name}
                </option>
              ))}
            </select>

            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="border rounded p-2"
            >
              <option value="all">All Teachers</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'list' : 'table')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {viewMode === 'table' ? 'Switch to List View' : 'Switch to Table View'}
            </button>
          </div>

          <button
            onClick={generateNewSchedule}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              'Generate New Schedule'
            )}
          </button>
        </div>

        {error && (
          <Alert variant="error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          {viewMode === 'table' ? (
            renderTableView()
          ) : (
            <div className="space-y-6">
              {schedules.map((schedule) => (
                <Card key={schedule._id}>
                  <CardHeader>
                    <CardTitle className="capitalize">{schedule.dayOfWeek}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-white rounded-lg border shadow-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium">{schedule.timeSlot}</p>
                            <p className="text-sm text-gray-600">
                              Subject: {schedule.subject}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm">
                              Teacher: {schedule.teacher?.name || 'N/A'}
                            </p>
                            <p className="text-sm">
                              Division: {schedule.division?.name || 'N/A'}
                            </p>
                            <p className="text-sm">
                              Room: {schedule.classroom?.roomNumber || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;