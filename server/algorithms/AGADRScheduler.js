class AGADRScheduler {
  constructor() {
    this.timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
    this.days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  }

  async evolve(teachers, divisions, classrooms, semester) {
    try {
      const schedule = [];
      const usedSlots = new Map();
      const teacherWorkload = new Map();
      const divisionWorkload = new Map();

      // Initialize tracking maps
      teachers.forEach(teacher => {
        teacherWorkload.set(teacher._id.toString(), {
          total: 0,
          daily: new Map(this.days.map(day => [day, 0])),
          lastSlot: null,
          consecutiveCount: 0
        });
      });

      divisions.forEach(division => {
        divisionWorkload.set(division._id.toString(), {
          total: 0,
          daily: new Map(this.days.map(day => [day, 0]))
        });
      });

      // Calculate available slots for each division
      const divisionAvailableSlots = new Map();
      divisions.forEach(division => {
        const availableSlots = [];
        this.days.forEach(day => {
          if (division.availability?.[day]?.length > 0) {
            division.availability[day].forEach(slot => {
              availableSlots.push({ day, slot });
            });
          }
        });
        divisionAvailableSlots.set(division._id.toString(), availableSlots);
      });

      // For each division
      for (const division of divisions) {
        const divisionId = division._id.toString();
        const availableSlots = divisionAvailableSlots.get(divisionId);
        
        if (!availableSlots || availableSlots.length === 0) {
          console.log(`No available slots for division ${division.name}`);
          continue;
        }

        // Shuffle available slots for even distribution
        const shuffledSlots = this.shuffleArray([...availableSlots]);
        
        // Try to schedule required number of lectures
        const requiredLectures = 20; // Total lectures needed per week
        let scheduledLectures = 0;

        for (const { day, slot: timeSlot } of shuffledSlots) {
          if (scheduledLectures >= requiredLectures) break;

          const divWorkload = divisionWorkload.get(divisionId);
          if (divWorkload.daily.get(day) >= 4) continue; // Max 4 lectures per day

          // Find available teacher
          const availableTeacher = teachers.find(teacher => {
            const workload = teacherWorkload.get(teacher._id.toString());
            const teacherKey = `${teacher._id}-${day}-${timeSlot}`;

            // Check if teacher is available at this time
            if (!teacher.availability?.[day]?.includes(timeSlot)) return false;

            // Check break time constraints
            if (this.isTeacherBreakTime(teacher, timeSlot)) return false;

            // Check if teacher is already teaching
            const isTeachingNow = Array.from(usedSlots.keys())
              .some(key => key.startsWith(`${teacher._id}-${day}-${timeSlot}`));
            if (isTeachingNow) return false;

            // Check workload constraints
            if (workload.total >= 4) return false; // Max 4 lectures per week
            if (workload.daily.get(day) >= 2) return false; // Max 2 lectures per day

            // Check consecutive lectures
            const isConsecutive = workload.lastSlot && 
              workload.lastSlot.day === day && 
              this.isConsecutiveTimeSlot(workload.lastSlot.time, timeSlot);
            if (isConsecutive && workload.consecutiveCount >= 2) return false;

            return true;
          });

          if (!availableTeacher) continue;

          // Find available classroom
          const availableClassroom = classrooms.find(classroom => {
            if (!classroom.availability?.[day]?.includes(timeSlot)) return false;
            const classroomKey = `${classroom._id}-${day}-${timeSlot}`;
            return !usedSlots.has(classroomKey);
          });

          if (!availableClassroom) continue;

          // Add to schedule
          schedule.push({
            teacher: availableTeacher._id,
            division: division._id,
            subject: availableTeacher.subjects[0],
            classroom: availableClassroom._id,
            dayOfWeek: day,
            timeSlot,
            semester
          });

          // Update tracking
          this.updateTrackingMaps(
            usedSlots,
            teacherWorkload,
            divisionWorkload,
            availableTeacher,
            division,
            availableClassroom,
            day,
            timeSlot
          );

          scheduledLectures++;
        }
      }

      if (schedule.length === 0) {
        throw new Error('Could not generate any valid schedule entries');
      }

      return schedule;
    } catch (error) {
      console.error('Error in schedule generation:', error);
      throw error;
    }
  }

  isTeacherBreakTime(teacher, timeSlot) {
    // Check lunch break
    if (teacher.lunchBreak === timeSlot) return true;

    // Check other break times if defined
    if (teacher.breakTimes && Array.isArray(teacher.breakTimes)) {
      return teacher.breakTimes.includes(timeSlot);
    }

    // Check break periods if defined
    if (teacher.breakPeriods) {
      for (const period of teacher.breakPeriods) {
        if (period.start <= timeSlot && timeSlot <= period.end) {
          return true;
        }
      }
    }

    return false;
  }

  updateTrackingMaps(usedSlots, teacherWorkload, divisionWorkload, teacher, division, classroom, day, timeSlot) {
    // Update used slots
    const teacherKey = `${teacher._id}-${day}-${timeSlot}`;
    const divisionKey = `${division._id}-${day}-${timeSlot}`;
    const classroomKey = `${classroom._id}-${day}-${timeSlot}`;
    
    usedSlots.set(teacherKey, true);
    usedSlots.set(divisionKey, true);
    usedSlots.set(classroomKey, true);

    // Update teacher workload
    const teacherWork = teacherWorkload.get(teacher._id.toString());
    teacherWork.total++;
    teacherWork.daily.set(day, teacherWork.daily.get(day) + 1);
    
    // Update consecutive lecture tracking
    if (teacherWork.lastSlot?.day === day && 
        this.isConsecutiveTimeSlot(teacherWork.lastSlot.time, timeSlot)) {
      teacherWork.consecutiveCount++;
    } else {
      teacherWork.consecutiveCount = 1;
    }
    teacherWork.lastSlot = { day, time: timeSlot };

    // Update division workload
    const divisionWork = divisionWorkload.get(division._id.toString());
    divisionWork.total++;
    divisionWork.daily.set(day, divisionWork.daily.get(day) + 1);
  }

  isConsecutiveTimeSlot(lastTimeSlot, currentTimeSlot) {
    if (!lastTimeSlot) return false;
    const lastIndex = this.timeSlots.indexOf(lastTimeSlot);
    const currentIndex = this.timeSlots.indexOf(currentTimeSlot);
    return currentIndex === lastIndex + 1;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

module.exports = new AGADRScheduler();