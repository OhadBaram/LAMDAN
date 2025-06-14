
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
        ...rest // All other props, potentially including other InputHTMLAttributes
    } = props;

    const inputType = type || "text";
    const baseClassName = `px-3 py-2.5 rounded-lg border bg-transparent border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full transition-colors duration-150 ease-in-out placeholder-slate-400 dark:placeholder-slate-500 ${className || ''}`;

    // domProps should not inadvertently re-introduce 'value' or 'defaultValue' if they exist in 'rest'
    // However, 'value' and 'defaultValue' are top-level in InputHTMLAttributes, so they are captured above.
    const domProps: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue'> = rest;


    if (value !== undefined) {
        // Controlled: pass value, do not pass defaultValue.
        // React itself will ignore defaultValue if value is present on the DOM input.
        // We ensure our custom component logic doesn't try to set both.
        return <input {...domProps} type={inputType} className={baseClassName} value={value === null ? '' : String(value)} />;
    } else {
        // Uncontrolled: pass defaultValue (if exists from props), do not pass value.
        return <input {...domProps} type={inputType} className={baseClassName} defaultValue={defaultValue} />;
    }
};
