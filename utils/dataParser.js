
// Function to parse date strings like "[05/Sep/2023:20:46:04 +0200]" into Date objects
export default function parseDateString(dateString) {
  const dateRegex = /(\d{2})\/([A-Za-z]{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2}) ([+-]\d{4})/;
  const match = dateString.match(dateRegex);

  if (!match) {
    throw new Error("Invalid date string format");
  }

  const [, day, month, year, hour, minute, second, offset] = match;
  const monthAbbreviations = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const monthIndex = monthAbbreviations.indexOf(month);

  if (monthIndex === -1) {
    throw new Error("Invalid month abbreviation");
  }

  const utcOffsetMinutes = parseInt(offset, 10) / 100 * 60;
  const utcOffset = (utcOffsetMinutes < 0 ? '-' : '+') +
    Math.abs(utcOffsetMinutes) / 60 +
    ':' +
    (Math.abs(utcOffsetMinutes) % 60).toString().padStart(2, '0');

  const isoString = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.padStart(2, '0')}T${hour}:${minute}:${second}${utcOffset}`;
  return isoString;
}