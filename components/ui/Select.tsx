
import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    children: React.ReactNode;
    className?: string;
    id?: string;
    // value and defaultValue are part of React.SelectHTMLAttributes
    // value?: string | number | readonly string[] | null;
    // defaultValue?: string | number | readonly string[];
    onChange?: React.ChangeEventHandler<HTMLSelectElement>;
    disabled?: boolean;
    name?: string;
    style?: React.CSSProperties;
}

export const Select: React.FC<SelectProps> = (props) => {
    const { 
        children, 
        className, 
        value, 
        defaultValue, // Explicitly capture defaultValue
        ...rest 
    } = props;

    const baseClassName = `px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none w-full transition-colors duration-150 ease-in-out ${className || ''}`; // Adjusted padding, radius, border, focus

    const domProps: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'defaultValue'> = rest;

    if (value !== undefined) {
        // Controlled: Pass value (ensure it's not null for the DOM select, '' is fine).
        return <select {...domProps} className={baseClassName} value={value ?? ''}>{children}</select>;
    } else {
        // Uncontrolled: Pass defaultValue.
        return <select {...domProps} className={baseClassName} defaultValue={defaultValue}>{children}</select>;
    }
};