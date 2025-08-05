export const parseTimezoneString = (
  dateStr: string,
): { date: Date; timezone: string } => {
  console.log('Parsing date string:', dateStr);
  const parts = dateStr.split(' ');
  if (parts.length !== 2) {
    throw new Error(
      `Invalid date string format. Expected "YYYY-MM-DD HH:mm:ss TIMEZONE", got "${dateStr}"`,
    );
  }

  const [datePart, timezone] = parts;
  let date = new Date(datePart);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date part in string: "${datePart}"`);
  }

  // Handle IST timezone explicitly
  const cleanTimezone = timezone.trim().toUpperCase();
  if (cleanTimezone === 'IST') {
    // Subtract 5 hours and 30 minutes to convert from IST to UTC
    date = new Date(date.getTime() - (5 * 60 + 30) * 60 * 1000);
  }

  console.log('Parsed date info:', {
    original: dateStr,
    datePart,
    timezone: cleanTimezone,
    parsedDate: date.toISOString(),
    explanation:
      cleanTimezone === 'IST'
        ? 'Converted IST to UTC by subtracting 5:30 hours'
        : 'No timezone conversion needed',
  });

  return { date, timezone: cleanTimezone };
};
