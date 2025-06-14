
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

    const baseClassName = `px-3 py-3 rounded-md border bg-[var(--bg-primary)] border-[var(--border)] text-[var(--text-primary)]
                           focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] 
                           outline-none w-full transition-colors duration-150 ease-in-out 
                           placeholder-[var(--text-secondary)] disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`;
    
    const domProps: Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'defaultValue'> = rest;

    if (value !== undefined) {
        // Controlled
        return <textarea {...domProps} className={baseClassName} value={value === null ? '' : String(value)} />;
    } else {
        // Uncontrolled
        return <textarea {...domProps} className={baseClassName} defaultValue={defaultValue} />;
    }
};
