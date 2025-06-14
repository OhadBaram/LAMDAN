
import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
    type?: string;
    id?: string;
    value?: string | number | readonly string[];
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    placeholder?: string;
    disabled?: boolean;
    accept?: string;
    step?: string | number;
    checked?: boolean;
    defaultChecked?: boolean;
    defaultValue?: string | number | readonly string[];
    name?: string;
    min?: string | number;
    max?: string | number;
}

export const Input: React.FC<InputProps> = ({ className, type, value: propValue, ...restProps }) => {
    // Ensure the value passed to the DOM input is always a string.
    // Convert numbers to string, and null/undefined to an empty string.
    const inputValue = (propValue === null || propValue === undefined) ? '' : String(propValue);
    
    return (
        <input 
            type={type || "text"} 
            className={`px-3 py-2.5 rounded-lg border bg-transparent border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full transition-colors duration-150 ease-in-out placeholder-slate-400 dark:placeholder-slate-500 ${className || ''}`} 
            value={inputValue} 
            {...restProps} 
        />
    );
};
