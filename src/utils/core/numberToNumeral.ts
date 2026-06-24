export function numberToNumeral(num: number | string, decimals = 1): string | null {
    const parsed = Number(num);
    if (isNaN(parsed)) return null;

    if (parsed >= 1_000_000_000) return `${(parsed/1_000_000_000).toFixed(decimals)}B`;
    if (parsed >= 1_000_000) return `${(parsed/1_000_000).toFixed(decimals)}M`;
    if (parsed >= 1_000) return `${(parsed/1_000).toFixed(decimals)}K`;
    
    return parsed.toString();
}