import { Field } from "../ui/field";
import { SettingInput } from "./setting-input";
import { parseNumber } from "../../utils/math";

/** A labelled number setting. Like every SettingInput, it commits on blur or Enter. */
export const NumberSetting = ({label, value, onCommit, min, max, step, placeholder, required}: {
    label: string;
    value: number | '';
    onCommit: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    required?: boolean;
}) => (
    <Field label={label}>
        <SettingInput
            type="number"
            required={required}
            placeholder={placeholder}
            className="input input-bordered input-primary w-full"
            value={value}
            min={min}
            max={max}
            step={step}
            parse={parseNumber}
            onCommit={onCommit}
        />
    </Field>
);
