/**
 * Returns true if the YYYY-MM-DD formatted `dateStr` (in UTC), is before today (in UTC).
 * @param dateStr The date in `YYYY-MM-DD` format.
 */
export default function isDateBeforeToday(dateStr: string): boolean {
	// Appending the time to make it midnight in UTC.
	const inputDate = new Date(dateStr + "T00:00:00Z");

	// Get today’s UTC midnight timestamp
	const now = new Date();
	const todayMidnightUTC = Date.UTC(
		now.getUTCFullYear(),
		now.getUTCMonth(),
		now.getUTCDate()
	);

	return inputDate.getTime() < todayMidnightUTC;
}