import React, { useState } from 'react';

const DivisionForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    semester: '',
    homeClassroom: '',
    subjects: [],
    availability: {
      monday: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
      tuesday: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
      wednesday: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
      thursday: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
      friday: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM']
    }
  });

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvailabilityChange = (day, time) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: prev.availability[day].includes(time)
          ? prev.availability[day].filter(t => t !== time)
          : [...prev.availability[day], time]
      }
    }));
  };

  const handleSubjectChange = (e) => {
    const selectedSubjects = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      subjects: selectedSubjects
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Add validation
      if (!formData.name || !formData.semester || !formData.homeClassroom) {
        alert('Please fill in all required fields');
        return;
      }

      const response = await fetch('http://localhost:5001/api/divisions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // Ensure all required fields are included
          name: formData.name.trim(),
          semester: formData.semester,
          homeClassroom: formData.homeClassroom.trim(),
          availability: formData.availability
        })
      });

      const data = await response.json();

      if (response.status === 409) {
        alert('A division with this name already exists');
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register division');
      }

      alert('Division registered successfully!');
      // Reset form
      setFormData({
        name: '',
        semester: '',
        homeClassroom: '',
        subjects: [],
        availability: {
          monday: [...timeSlots],
          tuesday: [...timeSlots],
          wednesday: [...timeSlots],
          thursday: [...timeSlots],
          friday: [...timeSlots]
        }
      });

    } catch (error) {
      console.error('Error registering division:', error);
      alert('Error registering division: ' + error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Division Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Division Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Semester</label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              required
            >
              <option value="">Select Semester</option>
              <option value="Fall 2024">Fall 2024</option>
              <option value="Spring 2025">Spring 2025</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Home Classroom</label>
            <input
              type="text"
              name="homeClassroom"
              value={formData.homeClassroom}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              required
              placeholder="Enter home classroom number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Subjects</label>
            <select
              multiple
              name="subjects"
              value={formData.subjects}
              onChange={handleSubjectChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              required
            >
              <option value="Data Structures">Data Structures</option>
              <option value="Algorithms">Algorithms</option>
              <option value="Programming">Programming</option>
              <option value="AI">AI</option>
              <option value="Database">Database</option>
              <option value="Web Development">Web Development</option>
            </select>
          </div>
        </div>

        {/* Availability Grid */}
        <div>
          <h3 className="text-lg font-medium mb-4">Availability</h3>
          <div className="grid grid-cols-6 gap-4">
            <div></div>
            {Object.keys(formData.availability).map(day => (
              <div key={day} className="text-center font-medium capitalize">
                {day}
              </div>
            ))}
            
            {timeSlots.map(time => (
              <React.Fragment key={time}>
                <div className="text-right">{time}</div>
                {Object.keys(formData.availability).map(day => (
                  <div key={`${day}-${time}`} className="text-center">
                    <input
                      type="checkbox"
                      checked={formData.availability[day].includes(time)}
                      onChange={() => handleAvailabilityChange(day, time)}
                      className="h-4 w-4"
                    />
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Register Division
        </button>
      </form>
    </div>
  );
};

export default DivisionForm;