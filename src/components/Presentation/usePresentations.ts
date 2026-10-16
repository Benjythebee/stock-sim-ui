import { create } from 'zustand';
import type { PowerPresentMessage } from '../../types/messages';

/** Presentation kinds this UI can play. Keep in step with SUPPORTED_MOD_API (utils/version.ts). */
export const SUPPORTED_PRESENTATIONS = new Set<string>(['wheel']);

export type QueuedPresentation = PowerPresentMessage & { id: number };

interface PresentationStore {
    /** Animations waiting to play, oldest first. Only the first one is on screen. */
    queue: QueuedPresentation[];
    /** Queue a POWER_PRESENT. Unknown kinds are dropped (the server's NOTIFICATION still tells the outcome). */
    push: (message: PowerPresentMessage) => void;
    /** The current animation is done (or was dismissed). */
    next: () => void;
    clear: () => void;
}

let nextId = 1;

export const usePresentations = create<PresentationStore>((set) => ({
    queue: [],
    push: (message) => {
        if (!SUPPORTED_PRESENTATIONS.has(message.presentation?.kind)) return;
        set((s) => ({ queue: [...s.queue, { ...message, id: nextId++ }] }));
    },
    next: () => set((s) => ({ queue: s.queue.slice(1) })),
    clear: () => set({ queue: [] }),
}));
