import { cn } from "../../utils/cn";

export type TabOption<T extends string> = {label: string, value: T};

/** DaisyUI boxed tabs (radio inputs), controlled by `value`. */
export const Tabs = <T extends string>({tabs, value, onChange, className}: {
    tabs: TabOption<T>[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
}) => (
    <div className={cn("tabs tabs-box w-full", className)}>
        {tabs.map((t) => (
            <input key={t.value} type="radio" name={t.label} className="tab px-3 sm:px-4 whitespace-nowrap" aria-label={t.label} checked={value === t.value} onChange={() => onChange(t.value)} />
        ))}
    </div>
);
