import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
    id?: string;
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
    placeholder?: string;
    disabled?: boolean;
    rows?: number;
    name?: string;
    defaultValue?: string;
    onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
}

export const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => <textarea className={`px-3 py-2.5 rounded-lg border bg-transparent border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full transition-colors duration-150 ease-in-out placeholder-slate-400 dark:placeholder-slate-500 ${className || ''}`} {...props} />;