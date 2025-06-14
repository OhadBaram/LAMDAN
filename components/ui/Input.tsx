
import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
    type?: string;
    id?: string;
    // value and defaultValue are part of React.InputHTMLAttributes
    // value?: string | number | readonly string[];
    // defaultValue?: string | number | readonly string[];
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    placeholder?: string;
    disabled?: boolean;
    accept?: string;
    step?: string | number;
    checked?: boolean; // For checkbox/radio, though Switch handles checkbox specifically
    // defaultChecked?: boolean; // For checkbox/radio
    name?: string;
    min?: string | number;
    max?: string | number;
}

export const Input: React.FC<InputProps> = (props) => {
    const { 
        type, 
        className, 
        value, 
        defaultValue, // Explicitly capture defaultValue from props
        ...rest // All other props
    } = props;

    const inputType = type || "text";
    // Using theme variables. Tailwind JIT needs to see full class names, so we construct them carefully or use style prop for CSS vars.
    // For direct Tailwind utility classes, we must ensure they are generated.
    // Simpler to apply base and let specifics be overridden or rely on CSS vars.
    const baseClassName = `px-3 py-3 rounded-md border bg-[var(--bg-primary)] border-[var(--border)] text-[var(--text-primary)]
                           focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] 
                           outline-none w-full transition-colors duration-150 ease-in-out 
                           placeholder-[var(--text-secondary)] disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`;

    // domProps should not contain 'value' or 'defaultValue' as they are handled explicitly.
    const domProps: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue'> = rest;

    if (value !== undefined) {
        // Controlled: pass value, do not pass defaultValue.
        // React itself will ignore defaultValue if value is present on the DOM input.
        return <input {...domProps} type={inputType} className={baseClassName} value={value === null ? '' : String(value)} />;
    } else {
        // Uncontrolled: pass defaultValue (if it exists from props), do not pass value.
        // If defaultValue from props is undefined, React handles it gracefully.
        return <input {...domProps} type={inputType} className={baseClassName} defaultValue={defaultValue} />;
    }
};
