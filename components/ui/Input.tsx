
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
    const baseClassName = `px-4 py-3 rounded-xl border bg-transparent border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none w-full transition-colors duration-150 ease-in-out placeholder-slate-400 dark:placeholder-slate-500 ${className || ''}`; // Adjusted padding, radius, border, focus

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