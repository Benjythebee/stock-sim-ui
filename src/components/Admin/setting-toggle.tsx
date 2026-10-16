import type { ReactNode } from "react";
import { Toggle } from "../ui/toggle";
import { HelpButton, type TooltipPosition } from "../ui/help-tooltip";

/**
 * A settings toggle. Its explanation (children) sits behind a "?" icon: shown on hover or focus,
 * and kept open by a click (for touch screens). Sends immediately (no draft, unlike SettingInput).
 */
export const SettingToggle = ({label, checked, onChange, color, tooltipPosition = 'bottom', children}:{
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    /** DaisyUI toggle color class used while on. */
    color?: string;
    /** Where the explanation shows. Left/right fall back to bottom when the screen has no room on that side. */
    tooltipPosition?: TooltipPosition;
    children?: ReactNode;
}) => (
    <div className="flex items-center">
        <Toggle label={label} checked={checked} onChange={onChange} color={color} />
        {/* Outside the <label>, or clicking it would flip the toggle. */}
        {children && <HelpButton label={label} position={tooltipPosition}>{children}</HelpButton>}
    </div>
);
