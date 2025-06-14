
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

export const Input: React.FC<InputProps> = ({ className, type, ...props }) => <input type={type || "text"} className={`px-3 py-2 rounded-md border bg-transparent border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none ${className || ''}`} {...props} />;
