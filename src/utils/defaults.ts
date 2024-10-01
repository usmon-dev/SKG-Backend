import { DateTime } from 'luxon';

// Specify your desired time zone
const timezone = 'UTC+5'; // Replace with your desired time zone

// Get the current time in the specified time zone
const now = DateTime.now().setZone(timezone);

// Format the time and date
const formattedDate = now.toFormat('dd.MM.yyyy HH:mm'); // Use 'dd' for day and 'yyyy' for year

console.log(formattedDate); // Output: 01.10.2024 18:37

export const dateAndTime = formattedDate;