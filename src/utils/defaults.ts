import { DateTime } from 'luxon';

// Specify your desired time zone
const timezone = 'GMT+5'; // Replace with your desired time zone

// Get the current time in the specified time zone
const now = DateTime.now().setZone(timezone);

// Format the time and date
const time = now.toFormat('DD.MM.YYYY HH:mm');
const date = now.toFormat('DD.MM.YYYY');
const dateAndTime = now.toFormat('DD.MM.YYYY HH:mm');

export { time, date, dateAndTime };