/** Wall-clock time of day for a timestamp in epoch ms (e.g. 14:03:27). */
export const formatTime = (ms: number) => new Date(ms).toLocaleTimeString();

/** A countdown in ms as m:ss, never negative (e.g. 4:07). */
export function formatCountdown(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
