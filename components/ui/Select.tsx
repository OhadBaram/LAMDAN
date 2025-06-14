
import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    children: React.ReactNode;
    className?: string;
    id?: string;
    value?: string | number | readonly string[] | null; // Allow null for value prop
    onChange?: React.ChangeEventHandler<HTMLSelectElement>;
    disabled?: boolean;
    name?: string;
    style?: React.CSSProperties;
    // defaultValue is a standard HTMLSelectElement attribute and can be in ...props
}

export const Select: React.FC<SelectProps> = ({ children, className, value: propValue, ...props }) => {
    // Destructure defaultValue out of props to prevent it from being spread if 'value' is also present
    const { defaultValue, ...otherProps } = props;
    
    return (
        <select 
            value={propValue ?? ''} // Ensure value is not null/undefined for the DOM element
            className={`px-3 py-2.5 rounded-lg border bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full transition-colors duration-150 ease-in-out ${className || ''}`} 
            {...otherProps} // Spread otherProps which does not include defaultValue
        >
            {children}
        </select>
    );
};