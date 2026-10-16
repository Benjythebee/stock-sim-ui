import { useState, type InputHTMLAttributes } from "react";

type SettingInputProps<T extends string | number> = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onBlur' | 'onKeyDown'> & {
    value: string | number;
    /** Turns the typed text into a value, or undefined to discard the edit. */
    parse: (text: string) => T | undefined;
    onCommit: (value: T) => void;
};

/**
 * An input that keeps what the host types as a local draft and only commits it on blur or Enter.
 * Every ADMIN_SETTINGS rebuilds the server's game and echoes ROOM_STATE, so committing on each
 * keystroke would make a half-typed (or cleared) field snap back to the old value.
 * Escape, or an invalid draft, reverts to the current value.
 */
export const SettingInput = <T extends string | number>({value, parse, onCommit, ...props}: SettingInputProps<T>) => {
    // null = not editing: show the store's value, so ROOM_STATE echoes (e.g. clamped values) show up.
    const [draft, setDraft] = useState<string | null>(null);

    const commit = () => {
        if (draft === null) return;
        setDraft(null);
        const next = parse(draft);
        if (next !== undefined && next !== value) onCommit(next);
    };

    return (
        <input
            {...props}
            value={draft ?? String(value)}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') setDraft(null);
            }}
        />
    );
};
