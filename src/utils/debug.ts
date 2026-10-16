/**
 * Debug mode for verbose console logging. Turn it on with `?debug` in the URL (remembered in
 * localStorage) and off with `?debug=0`.
 */
function readDebugFlag(): boolean {
    try {
        const param = new URLSearchParams(window.location.search).get("debug");
        if (param !== null) {
            const on = param !== "0" && param !== "false";
            localStorage.setItem("debug", on ? "1" : "0");
            return on;
        }
        return localStorage.getItem("debug") === "1";
    } catch {
        return false;
    }
}

export const isDebug = readDebugFlag();

export function debugLog(...args: unknown[]): void {
    if (isDebug) console.log(...args);
}
