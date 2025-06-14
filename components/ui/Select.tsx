
import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    children: React.ReactNode;
    className?: string;
    id?: string;
    value?: string | number | readonly string[];
    onChange?: React.ChangeEventHandler<HTMLSelectElement>;
    disabled?: boolean;
    name?: string;
    style?: React.CSSProperties;
}

export const Select: React.FC<SelectProps> = ({ children, className, ...props }) => <select className={`p-2 rounded-md border bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none ${className || ''}`} {...props}>{children}</select>;
