
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

    const baseClassName = `px-3 py-3 rounded-md border bg-[var(--bg-primary)] border-[var(--border)] text-[var(--text-primary)]
                           focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] 
                           outline-none w-full transition-colors duration-150 ease-in-out 
                           disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`;

    const domProps: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'defaultValue'> = rest;

    if (value !== undefined) {
        // Controlled: Pass value (ensure it's not null for the DOM select, '' is fine).
        return <select {...domProps} className={baseClassName} value={value ?? ''}>{children}</select>;
    } else {
        // Uncontrolled: Pass defaultValue.
        return <select {...domProps} className={baseClassName} defaultValue={defaultValue}>{children}</select>;
    }
};
