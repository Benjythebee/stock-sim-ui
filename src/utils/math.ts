

export function decimal (num: number, places: number) {
    const factor = Math.pow(10, places);
    return Math.floor(num * factor) / factor;
}

/** Parses a finite number, or undefined for empty/invalid text. */
export function parseNumber(text: string): number | undefined {
    if (text.trim() === '') return undefined;
    const n = parseFloat(text);
    return Number.isFinite(n) ? n : undefined;
}

/** Rounds to a number of decimal places (for display; avoids 0.07*100 = 7.000000000000001). */
export function round(num: number, places: number) {
    const factor = Math.pow(10, places);
    return Math.round(num * factor) / factor;
}

const usd = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Dollars with 2 decimals and thousands separators, without the sign or $ (e.g. 1,234.50). */
export function money(num: number) {
    return usd.format(Math.abs(num));
}
