import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'outline' | 'ghost' | 'destructive' | 'default' | 'link';
  size?: 'sm' | 'icon' | 'default' | 'lg';
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
  id?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'default', size = 'default', ...props }) => {
    const baseStyle = "font-semibold rounded-xl transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:ring-opacity-50 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transform active:scale-[0.97]"; // rounded-lg to rounded-xl, added transform
    
    let variantStyle = "";
    switch(variant) {
        case 'default':
            variantStyle = "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg hover:-translate-y-px"; // Added hover:-translate-y-px
            break;
        case 'outline':
            variantStyle = "bg-transparent border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/15"; // Adjusted dark hover
            break;
        case 'ghost':
            variantStyle = "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/60"; // Adjusted hover opacity
            break;
        case 'destructive':
            variantStyle = "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg hover:-translate-y-px"; // Added hover:-translate-y-px
            break;
        case 'link':
            variantStyle = "bg-transparent text-indigo-600 hover:text-indigo-700 hover:underline";
            break;
    }

    let sizeStyle = "px-4 py-2 text-base"; // Default size
    if (size === "sm") sizeStyle = "px-3 py-1.5 text-sm";
    if (size === "lg") sizeStyle = "px-6 py-3 text-lg";
    if (size === "icon") sizeStyle = "p-2.5"; 

    // Link variant usually doesn't have padding unless specified by className
    if (variant === 'link' && size === 'default') sizeStyle = "p-0";


    const finalClassName = `${baseStyle} ${variantStyle} ${sizeStyle} ${className || ''}`;
    return <button className={finalClassName.trim()} {...props}>{children}</button>;
};