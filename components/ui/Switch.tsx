import React from 'react';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange, className, ...props }) => (
    <input 
        type="checkbox" 
        role="switch" 
        aria-checked={checked} 
        checked={checked} 
        onChange={(e) => onCheckedChange(e.target.checked)} 
        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800
                    ${checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'} 
                    ${className || ''}`}
        {...props} 
    >
        <span className="sr-only">Use Material Design switch</span>
        <span
            aria-hidden="true"
            className={`${checked ? 'translate-x-5' : 'translate-x-0'}
                        pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200`}
        />
    </input>
);