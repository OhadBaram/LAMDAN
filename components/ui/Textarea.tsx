
import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
    id?: string;
    value?: string | number | readonly string[]; // Allow number for flexibility, will be stringified
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
    placeholder?: string;
    disabled?: boolean;
    rows?: number;
    name?: string;
    defaultValue?: string;
    onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
}

export const Textarea: React.FC<TextareaProps> = ({ className, value: propValue, ...props }) => {
    // Ensure the value passed to the DOM textarea is always a string.
    const textareaValue = (propValue === null || propValue === undefined) ? '' : String(propValue);

    return (
        <textarea 
            className={`px-3 py-2.5 rounded-lg border bg-transparent border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full transition-colors duration-150 ease-in-out placeholder-slate-400 dark:placeholder-slate-500 ${className || ''}`} 
            value={textareaValue}
            {...props} 
        />
    );
};
