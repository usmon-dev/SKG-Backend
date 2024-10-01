import { DateTime } from "luxon";

export const getFormattedDateAndTime = () => {
  const timezone = "UTC+5";
  const now = DateTime.now().setZone(timezone);
  return now.toFormat("dd.MM.yyyy HH:mm");
};