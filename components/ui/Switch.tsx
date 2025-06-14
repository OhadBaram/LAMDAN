
import React from 'react';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean | null; // Allow null/undefined from parent
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked: propChecked, onCheckedChange, className, ...props }) => {
    // Ensure the checked state is always a boolean for the DOM input.
    const isChecked = (propChecked === null || propChecked === undefined) ? false : Boolean(propChecked);

    return (
        <input 
            type="checkbox" 
            role="switch" 
            aria-checked={isChecked} 
            checked={isChecked} 
            onChange={(e) => onCheckedChange(e.target.checked)} 
            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800
                        ${isChecked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'} 
                        ${className || ''}`}
            {...props} 
        >
            <span className="sr-only">Use Material Design switch</span>
            <span
                aria-hidden="true"
                className={`${isChecked ? 'translate-x-5' : 'translate-x-0'}
                            pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200`}
            />
        </input>
    );
};
