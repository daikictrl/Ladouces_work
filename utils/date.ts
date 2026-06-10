/**
 * Parse an ISO date string safely to a local Date object representing the calendar date.
 * This avoids timezone shifts where a UTC date like "2026-06-11T00:00:00.000Z" parses
 * to the previous day in negative timezones, or the next day depending on hours.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  
  // Extract just the YYYY-MM-DD part
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // 0-indexed month
    const day = parseInt(match[3], 10);
    return new Date(year, month, day);
  }
  
  // Fallback to standard Date parsing if format doesn't match
  return new Date(dateStr);
}
