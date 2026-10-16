import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

/** A settings toggle with a short explanation under it. Sends immediately (no draft, unlike SettingInput). */
export const SettingToggle = ({label, checked, onChange, color = 'toggle-primary', children}:{
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    /** DaisyUI toggle color class used while on. */
    color?: string;
    children?: ReactNode;
}) => {
    return (
        <div>
            <label className="label">
                <input type="checkbox" checked={checked} className={cn('toggle', {[color]: checked})} onChange={(e) => onChange(e.target.checked)} />
                <span className="label-text font-semibold ml-2">{label}</span>
            </label>
            {children && <p className="text-xs text-base-content/60 mt-1 whitespace-normal">{children}</p>}
        </div>
    )
}
