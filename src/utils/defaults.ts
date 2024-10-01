import { DateTime } from 'luxon';

// Specify your desired time zone
const timezone = 'UTC'; // Replace with your desired time zone

// Get the current time in the specified time zone
const now = DateTime.now().setZone(timezone);

// Format the time and date
const time = now.toFormat('HH:mm:ss');
const date = now.toFormat('DD.MM.YYYY');
const dateAndTime = `${date} ${time}`;

export { time, date, dateAndTime };