
import React from 'react';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  disabled?: boolean;
  name?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange, ...props }) => <input type="checkbox" role="switch" aria-checked={checked} checked={checked} onChange={(e) => onCheckedChange(e.target.checked)} className="h-4 w-8 appearance-none rounded-full bg-gray-300 dark:bg-gray-600 checked:bg-indigo-600 transition-colors duration-200 ease-in-out relative inline-block cursor-pointer after:content-[''] after:inline-block after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transform after:duration-200 after:ease-in-out checked:after:translate-x-4" {...props} />;
