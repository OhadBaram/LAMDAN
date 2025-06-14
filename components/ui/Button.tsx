
import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'outline' | 'ghost' | 'destructive' | 'default';
  size?: 'sm' | 'icon' | 'default';
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
  id?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'default', size = 'default', ...props }) => {
    const baseStyle = "px-4 py-2 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
    let variantStyle = "bg-indigo-600 hover:bg-indigo-700 text-white"; // Default
    if (variant === "outline") variantStyle = "bg-transparent border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700";
    if (variant === "ghost") variantStyle = "bg-transparent text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700";
    if (variant === "destructive") variantStyle = "bg-red-600 hover:bg-red-700 text-white";

    let sizeStyle = "";
    if (size === "sm") sizeStyle = "px-2 py-1 text-sm";
    if (size === "icon") sizeStyle = "p-2";

    const finalClassName = `${baseStyle} ${variantStyle} ${sizeStyle} ${className || ''}`;
    return <button className={finalClassName.trim()} {...props}>{children}</button>;
};
