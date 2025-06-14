
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
    const baseStyle = "font-medium rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:ring-opacity-50 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
    
    let variantStyle = "";
    switch(variant) {
        case 'default': // Primary button
            variantStyle = "bg-[var(--accent)] hover:brightness-90 active:brightness-80 text-[var(--text-primary-light)]"; // text-primary-light for good contrast on accent
            break;
        case 'outline': // Secondary button
            variantStyle = "bg-transparent border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]";
            break;
        case 'ghost':
            variantStyle = "bg-transparent text-[var(--text-primary)] hover:bg-[var(--border)] active:bg-[var(--border)]";
            break;
        case 'destructive':
            variantStyle = "bg-[var(--error)] hover:brightness-90 active:brightness-80 text-white";
            break;
        case 'link':
            variantStyle = "bg-transparent text-[var(--accent)] hover:underline";
            break;
    }

    let sizeStyle = "px-3 py-2 text-sm"; // Default size (16px from body, use text-sm for 14px button text or keep base)
    if (size === "sm") sizeStyle = "px-2.5 py-1.5 text-xs"; // Smaller padding and text
    if (size === "lg") sizeStyle = "px-5 py-2.5 text-base"; // Larger padding and text
    if (size === "icon") sizeStyle = "p-2"; 

    // Link variant usually doesn't have padding unless specified by className or size icon
    if (variant === 'link' && size === 'default') sizeStyle = "p-0";


    const finalClassName = `${baseStyle} ${variantStyle} ${sizeStyle} ${className || ''}`;
    return <button className={finalClassName.trim()} {...props}>{children}</button>;
};
