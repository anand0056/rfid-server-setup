export const getTimeZone = (): string => {
  // For Indian users, always return IST
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timeZone === 'Asia/Kolkata' || timeZone === 'Asia/Calcutta') {
    return 'IST';
  }

  // For other users, convert to UTC offset
  const offset = -new Date().getTimezoneOffset();
  const hours = Math.abs(Math.floor(offset / 60));
  const minutes = Math.abs(offset % 60);
  const sign = offset >= 0 ? '+' : '-';
  return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const formatDateWithTimezone = (date: Date): string => {
  const timeZone = getTimeZone();
  return `${date.toISOString().slice(0, 19)} ${timeZone}`;
};
