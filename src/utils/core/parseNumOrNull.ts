/**
 * Used for checking if a route id parameter is a valid number.
 * @param value The string/string list to parse.
 * @returns Parsed number or null if number could not be parsed.
 */
export default function parseNumOrNull(value: string | string[] | undefined): number | null {
	if (typeof value !== 'string') return null;
	const parsed = Number(value);
	return isNaN(parsed) ? null : parsed;
}