import React, { useState, useEffect } from 'react';
import { format, addDays, isWeekend } from 'date-fns';
import './App.css'; // Ensure styles are imported

// Employee list and allowed remote days
const employees = [
  { name: "Elitsa", remoteDays: 1 },
  { name: "Reveka", remoteDays: 1 },
  { name: "Ivanka", remoteDays: 2 },
  { name: "Mina", remoteDays: 2 },
  { name: "Lilyana", remoteDays: 1 },
  { name: "Nadezhda", remoteDays: 2 },
  { name: "Galya Dimitrova", remoteDays: 2 },
  { name: "Galya Georgieva", remoteDays: 2 }
];

// Helper function to generate all days including weekends
const getAllDays = (startDate, endDate) => {
  let days = [];
  let currentDate = startDate;

  while (currentDate <= endDate) {
    days.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }
  return days;
};

// Assign remote days ensuring exactly 2 people work remotely each day
const assignRemoteDays = (allDays, employees) => {
  const schedule = {};
  const employeeCount = employees.length;

  // Track remaining remote days for each employee
  const employeeRemoteTracker = employees.map(employee => ({
    ...employee,
    remainingRemoteDays: employee.remoteDays
  }));

  allDays.forEach((day) => {
    const isWeekendDay = isWeekend(day);
    if (isWeekendDay) {
      // Mark weekend days but don't assign employees
      schedule[format(day, "yyyy-MM-dd")] = { isWeekend: true };
      return;
    }

    const remoteEmployees = [];
    const officeEmployees = [];

    // Try to assign remote employees
    for (let i = 0; i < employeeCount; i++) {
      const index = (i + day.getDay()) % employeeCount; // Rotate based on current day
      const employee = employeeRemoteTracker[index];

      // Assign to remote if they still have remote days available
      if (remoteEmployees.length < 2 && employee.remainingRemoteDays > 0) {
        remoteEmployees.push(employee.name);
        employee.remainingRemoteDays--; // Decrease the count of remaining remote days
      }
    }

    // The rest of the employees will be in the office
    employeeRemoteTracker.forEach(employee => {
      if (!remoteEmployees.includes(employee.name)) {
        officeEmployees.push(employee.name);
      }
    });

    // Ensure only 7 people are in the office
    schedule[format(day, "yyyy-MM-dd")] = {
      remote: remoteEmployees,
      office: officeEmployees.slice(0, 7) // Ensure exactly 7 employees in the office
    };

    // If we reach a point where all remote days are exhausted, reset the counters
    if (remoteEmployees.length < 2) {
      employeeRemoteTracker.forEach(employee => {
        employee.remainingRemoteDays = employee.remoteDays; // Reset remote days for rotation
      });
    }
  });

  return schedule;
};

function App() {
  const [schedule, setSchedule] = useState({});

  useEffect(() => {
    const startDate = new Date(2024, 10, 1); // November 1st, 2024
    const endDate = new Date(2024, 11, 31); // December 31st, 2024
    const allDays = getAllDays(startDate, endDate); // Get all days, including weekends
    const newSchedule = assignRemoteDays(allDays, employees);
    setSchedule(newSchedule);
  }, []);

  return (
    <div className="container">
      <h1>Office Remote Work Calendar</h1>
      <div className="calendar-grid">
        {Object.entries(schedule).map(([day, data]) => (
          <div
            key={day}
            className={`calendar-cell ${data.isWeekend ? 'weekend-cell' : ''}`}
          >
            <h3>{format(new Date(day), 'dd MMM yyyy')}</h3>
            {data.isWeekend ? (
              <p>Weekend</p>
            ) : (
              <div className="employee-list">
                <strong>Remote (2):</strong>
                <ul>
                  {data.remote.map(person => (
                    <li key={person}>{person}</li>
                  ))}
                </ul>
                <strong>Office (7):</strong>
                <ul>
                  {data.office.map(person => (
                    <li key={person}>{person}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
