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

export const Select: React.FC<SelectProps> = ({ children, className, ...props }) => <select className={`px-3 py-2.5 rounded-lg border bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full transition-colors duration-150 ease-in-out ${className || ''}`} {...props}>{children}</select>;