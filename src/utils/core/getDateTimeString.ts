export function getDateTimeString(time: Date | undefined) {
    if (time === undefined) return "Unknown";

    return time.toLocaleString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}