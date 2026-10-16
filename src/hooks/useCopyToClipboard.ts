import { useEffect, useRef, useState } from "react";
import { useToast } from "../components/Toast/useToast";

/** Copy text, with `copied` true for 2s after. Warns with a toast where the clipboard isn't available. */
export const useCopyToClipboard = () => {
    const addToast = useToast((state) => state.addToast);
    const [copied, setCopied] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
    useEffect(() => () => clearTimeout(timer.current), []);

    const copy = async (text: string) => {
        try {
            // Only exists in a secure context (https or localhost), so not when friends join over LAN http.
            await navigator.clipboard.writeText(text);
            setCopied(true);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), 2000);
        } catch {
            addToast({ type: 'warning', title: 'Copy failed', description: 'Select the text and copy it by hand.' });
        }
    };

    return { copied, copy };
};
