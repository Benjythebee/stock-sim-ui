import type { PowerDescription } from "../../types/types";
import { iconCreditText, MISSING_ICON, powerIconSrc } from "../../utils/powerIcon";

/** A power's icon. Falls back to the "missing" icon if the image fails to load. */
export const PowerIcon = ({ power }: { power: Pick<PowerDescription, "title" | "iconSlug" | "iconUrl" | "iconCredit"> }) => (
    <img
        src={powerIconSrc(power)}
        alt={power.title}
        title={iconCreditText(power)}
        onError={(e) => {
            const img = e.currentTarget;
            if (!img.src.endsWith(MISSING_ICON)) img.src = MISSING_ICON;
        }}
    />
);
