
import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
    id?: string;
    // value and defaultValue are part of React.TextareaHTMLAttributes
    // value?: string | number | readonly string[];
    // defaultValue?: string;
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
    placeholder?: string;
    disabled?: boolean;
    rows?: number;
    name?: string;
    onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
}

export const Textarea: React.FC<TextareaProps> = (props) => {
    const { 
        className, 
        value, 
        defaultValue, // Explicitly capture defaultValue
        ...rest 
    } = props;

    const baseClassName = `px-3 py-2.5 rounded-lg border bg-transparent border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full transition-colors duration-150 ease-in-out placeholder-slate-400 dark:placeholder-slate-500 ${className || ''}`;
    
    const domProps: Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'defaultValue'> = rest;

    if (value !== undefined) {
        // Controlled
        return <textarea {...domProps} className={baseClassName} value={value === null ? '' : String(value)} />;
    } else {
        // Uncontrolled
        return <textarea {...domProps} className={baseClassName} defaultValue={defaultValue} />;
    }
};
