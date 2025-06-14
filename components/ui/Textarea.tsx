
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

export const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => <textarea className={`px-3 py-2 rounded-md border bg-transparent border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none ${className || ''}`} {...props} />;
