/**
 * Check if two time intervals overlap.
 * An overlap occurs when:
 * existingStart < requestedEnd && requestedStart < existingEnd
 * 
 * Consecutive intervals where one ends exactly when another starts do NOT overlap:
 * e.g., 09:00 - 10:00 and 10:00 - 11:00 is allowed.
 */
export function hasTimeOverlap(
  startA: Date | string,
  endA: Date | string,
  startB: Date | string,
  endB: Date | string
): boolean {
  const sA = new Date(startA).getTime();
  const eA = new Date(endA).getTime();
  const sB = new Date(startB).getTime();
  const eB = new Date(endB).getTime();

  return sA < eB && sB < eA;
}

/**
 * Validate that start and end are valid dates and end > start
 */
export function isValidTimeRange(start: Date | string, end: Date | string): boolean {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();

  if (isNaN(s) || isNaN(e)) return false;
  return e > s;
}

/**
 * Format numbers according to standard rounding (half-up to 2 decimals)
 */
export function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
