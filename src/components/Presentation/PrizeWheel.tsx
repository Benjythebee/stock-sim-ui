import { useEffect, useMemo, useState } from "react";
import type { WheelPresentation } from "../../types/messages";

/** Slice colors for segments that don't bring their own. */
const PALETTE = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];
/** Full turns before landing, so it reads as a real spin. */
const TURNS = 6;
const R = 140;

const point = (deg: number, radius = R) => {
    const rad = (deg * Math.PI) / 180;
    return `${(radius * Math.sin(rad)).toFixed(2)} ${(-radius * Math.cos(rad)).toFixed(2)}`;
};

const prefersReducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/**
 * A prize wheel that spins and lands on `segments[result]` under the pointer at the top. The result
 * comes from the server; only where it lands inside the winning slice is random (cosmetic).
 * Slices are sized by `weight`, so the wheel shows the real odds.
 */
export const PrizeWheel = ({ presentation, onStopped }: { presentation: WheelPresentation; onStopped: () => void }) => {
    const { segments, result } = presentation;
    const duration = prefersReducedMotion() ? 300 : presentation.durationMs;

    // Slice boundaries in degrees, clockwise from the top.
    const slices = useMemo(() => {
        const total = segments.reduce((sum, s) => sum + (s.weight ?? 1), 0);
        let start = 0;
        return segments.map((s, i) => {
            const sweep = ((s.weight ?? 1) / total) * 360;
            const slice = { ...s, start, sweep, color: s.color ?? PALETTE[i % PALETTE.length] };
            start += sweep;
            return slice;
        });
    }, [segments]);

    // Land somewhere inside the winning slice (not on its edges), then rotate that point to the top.
    const [target] = useState(() => {
        const win = slices[result] ?? slices[0];
        const landing = win.start + win.sweep * (0.2 + Math.random() * 0.6);
        return TURNS * 360 - landing;
    });
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        // Start from 0 on the first frame, then animate to the target.
        const frame = requestAnimationFrame(() => setRotation(target));
        const stop = setTimeout(onStopped, duration + 50);
        return () => {
            cancelAnimationFrame(frame);
            clearTimeout(stop);
        };
    }, [target, duration, onStopped]);

    return (
        <svg viewBox="-150 -160 300 310" className="w-72 max-w-full h-auto select-none" role="img" aria-label={`Prize wheel. Result: ${segments[result]?.label ?? ""}`}>
            <g
                style={{
                    // The slices fill a circle centered on 0,0, so its box center is the hub.
                    transformBox: "fill-box",
                    transformOrigin: "center",
                    transform: `rotate(${rotation}deg)`,
                    transition: `transform ${duration}ms cubic-bezier(0.12, 0.7, 0.08, 1)`,
                }}
            >
                {slices.map((s, i) => (
                    <g key={i}>
                        <path
                            d={`M 0 0 L ${point(s.start)} A ${R} ${R} 0 ${s.sweep > 180 ? 1 : 0} 1 ${point(s.start + s.sweep)} Z`}
                            fill={s.color}
                            stroke="white"
                            strokeWidth={2}
                        />
                        <text
                            transform={`rotate(${s.start + s.sweep / 2 - 90}) translate(${R * 0.6} 0)`}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            fontSize={s.sweep < 20 ? 10 : 12}
                            fontWeight={700}
                        >
                            {s.label}
                        </text>
                    </g>
                ))}
            </g>
            <circle r={R} fill="none" stroke="currentColor" strokeOpacity={0.25} strokeWidth={4} />
            <circle r={14} fill="white" stroke="currentColor" strokeOpacity={0.3} strokeWidth={3} />
            {/* The pointer, at the top */}
            <path d={`M -12 ${-R - 18} L 12 ${-R - 18} L 0 ${-R + 8} Z`} fill="currentColor" stroke="white" strokeWidth={2} />
        </svg>
    );
};
