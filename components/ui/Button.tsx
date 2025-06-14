
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
    const baseStyle = "font-medium rounded-[var(--button-border-radius)] transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-new)]/50 focus:ring-opacity-50 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed active:transform active:scale-[0.98]";
    
    let variantStyle = "";
    switch(variant) {
        case 'default': // Primary button
            variantStyle = "bg-[var(--color-primary-new)] hover:brightness-[.95] active:brightness-[.90] text-[var(--text-on-primary-new)]"; 
            break;
        case 'outline': // Secondary button (used for history, some dialog actions)
            variantStyle = "bg-transparent border border-[var(--border-light-new)] text-[var(--text-normal-new)] hover:bg-[var(--bg-input-new)]";
            break;
        case 'ghost': // For less prominent actions, icons
            variantStyle = "bg-transparent text-[var(--text-muted-new)] hover:bg-[var(--bg-input-new)] hover:text-[var(--color-primary-new)] active:bg-[var(--bg-input-new)]";
            break;
        case 'destructive':
            variantStyle = "bg-[var(--error)] hover:brightness-[.95] active:brightness-[.90] text-white";
            break;
        case 'link':
            variantStyle = "bg-transparent text-[var(--color-primary-new)] hover:underline";
            break;
    }

    let sizeStyle = "px-3.5 py-2 text-[var(--font-size-body)]"; 
    if (size === "sm") sizeStyle = "px-3 py-1.5 text-sm"; 
    if (size === "lg") sizeStyle = "px-5 py-2.5 text-lg"; 
    if (size === "icon") sizeStyle = "p-2"; 

    if (variant === 'link' && size === 'default') sizeStyle = "p-0"; // Links usually don't have padding

    const finalClassName = `${baseStyle} ${variantStyle} ${sizeStyle} ${className || ''}`;
    return <button className={finalClassName.trim()} {...props}>{children}</button>;
};
