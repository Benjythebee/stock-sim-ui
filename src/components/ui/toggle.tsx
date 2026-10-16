import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

/** A DaisyUI toggle with its label. */
export const Toggle = ({label, checked, onChange, color = 'toggle-primary'}: {
    label: ReactNode;
    checked: boolean;
    onChange: (checked: boolean) => void;
    /** DaisyUI toggle color class used while on. */
    color?: string;
}) => (
    <label className="label">
        <input type="checkbox" checked={checked} className={cn('toggle', {[color]: checked})} onChange={(e) => onChange(e.target.checked)} />
        <span className="label-text font-semibold ml-2">{label}</span>
    </label>
);
