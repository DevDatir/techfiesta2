class TimetableGenerator {
  constructor() {
    this.timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
    this.days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    this.usedSlots = {
      teacher: new Map(),
      division: new Map(),
      classroom: new Map()
    };
    this.teacherLectureCount = new Map(); // Track lectures per teacher
    this.subjectFrequencyPerDivision = new Map(); // Track subject frequency per division
  }

  initializeCounters(teachers, divisions) {
    teachers.forEach(teacher => {
      this.teacherLectureCount.set(teacher._id.toString(), {
        total: 0,
        dailyCount: new Map(this.days.map(day => [day, 0]))
      });
    });

    divisions.forEach(division => {
      this.subjectFrequencyPerDivision.set(division._id.toString(), new Map());
    });
  }

  isSlotAvailable(teacher, division, classroom, day, timeSlot) {
    const slotKey = `${day}-${timeSlot}`;
    const teacherKey = `${teacher._id}-${slotKey}`;
    const divisionKey = `${division._id}-${slotKey}`;
    const classroomKey = `${classroom._id}-${slotKey}`;

    // Check if any resource is already occupied
    if (this.usedSlots.teacher.has(teacherKey) ||
        this.usedSlots.division.has(divisionKey) ||
        this.usedSlots.classroom.has(classroomKey)) {
      return false;
    }

    // Check teacher's lunch break preference
    if (teacher.lunchBreak === timeSlot) {
      return false;
    }

    // Check daily lecture limit (max 5 hours per day)
    const teacherStats = this.teacherLectureCount.get(teacher._id.toString());
    if (teacherStats.dailyCount.get(day) >= 5) {
      return false;
    }

    // Check total lecture limit
    if (teacherStats.total >= 20) { // 4 lectures per subject * number of subjects
      return false;
    }

    // Check subject frequency for this division
    const divisionSubjects = this.subjectFrequencyPerDivision.get(division._id.toString());
    const currentSubjectCount = divisionSubjects.get(teacher.subjects[0]) || 0;
    if (currentSubjectCount >= 4) { // Max 4 lectures per subject per week
      return false;
    }

    // Check resource availability
    return (
      teacher.availability?.[day]?.includes(timeSlot) &&
      division.availability?.[day]?.includes(timeSlot) &&
      classroom.availability?.[day]?.includes(timeSlot)
    );
  }

  markSlotAsUsed(teacher, division, classroom, day, timeSlot, subject) {
    const slotKey = `${day}-${timeSlot}`;
    this.usedSlots.teacher.set(`${teacher._id}-${slotKey}`, true);
    this.usedSlots.division.set(`${division._id}-${slotKey}`, true);
    this.usedSlots.classroom.set(`${classroom._id}-${slotKey}`, true);

    // Update teacher lecture counts
    const teacherStats = this.teacherLectureCount.get(teacher._id.toString());
    teacherStats.total += 1;
    teacherStats.dailyCount.set(day, teacherStats.dailyCount.get(day) + 1);

    // Update subject frequency
    const divisionSubjects = this.subjectFrequencyPerDivision.get(division._id.toString());
    divisionSubjects.set(subject, (divisionSubjects.get(subject) || 0) + 1);
  }

  generateSchedule({ teachers, divisions, classrooms, semester, teacherId, divisionId }) {
    const schedules = [];
    
    // Reset tracking maps
    this.usedSlots = {
      teacher: new Map(),
      division: new Map(),
      classroom: new Map()
    };
    this.initializeCounters(teachers, divisions);

    // Filter resources if specific teacher or division is requested
    const filteredTeachers = teacherId ? teachers.filter(t => t._id.toString() === teacherId) : teachers;
    const filteredDivisions = divisionId ? divisions.filter(d => d._id.toString() === divisionId) : divisions;

    // Generate schedule day by day, time slot by time slot
    for (const day of this.days) {
      for (const timeSlot of this.timeSlots) {
        for (const division of filteredDivisions) {
          for (const teacher of this.getAvailableTeachers(filteredTeachers, day, division)) {
            if (!this.canTeacherTakeMoreLectures(teacher, day)) {
              continue;
            }

            const classroom = this.findSuitableClassroom(classrooms, teacher, division, day, timeSlot);
            if (classroom) {
              const subject = teacher.subjects[0];
              this.markSlotAsUsed(teacher, division, classroom, day, timeSlot, subject);
              
              schedules.push({
                teacher: teacher._id,
                division: division._id,
                subject: subject,
                classroom: classroom._id,
                dayOfWeek: day,
                timeSlot,
                semester
              });
              break;
            }
          }
        }
      }
    }

    return schedules;
  }

  getAvailableTeachers(teachers, day, division) {
    return teachers.filter(teacher => {
      const stats = this.teacherLectureCount.get(teacher._id.toString());
      const divisionSubjects = this.subjectFrequencyPerDivision.get(division._id.toString());
      
      return (
        teacher.subjects?.length > 0 &&
        stats.dailyCount.get(day) < 5 &&
        stats.total < 20 &&
        teacher.subjects.some(subject => 
          (divisionSubjects.get(subject) || 0) < 4
        )
      );
    });
  }

  canTeacherTakeMoreLectures(teacher, day) {
    const stats = this.teacherLectureCount.get(teacher._id.toString());
    return stats.dailyCount.get(day) < 5 && stats.total < 20;
  }

  findSuitableClassroom(classrooms, teacher, division, day, timeSlot) {
    return classrooms.find(classroom => 
      this.isSlotAvailable(teacher, division, classroom, day, timeSlot)
    );
  }

  validateResources(teachers, divisions, classrooms) {
    if (!teachers.length || !divisions.length || !classrooms.length) {
      throw new Error('Insufficient resources for schedule generation');
    }

    // Validate teacher subjects
    const teachersWithSubjects = teachers.filter(t => t.subjects?.length > 0);
    if (teachersWithSubjects.length === 0) {
      throw new Error('No teachers with assigned subjects found');
    }

    // Validate lunch break specifications
    const teachersWithoutLunchBreak = teachers.filter(t => !t.lunchBreak);
    if (teachersWithoutLunchBreak.length > 0) {
      throw new Error('Some teachers do not have lunch break specified');
    }

    return true;
  }
}

module.exports = new TimetableGenerator(); 