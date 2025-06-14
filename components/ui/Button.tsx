
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
    // Gemini-like buttons are often subtly rounded (4-8px)
    // Using rounded-md (6px) or rounded-lg (8px) from Tailwind
    const baseStyle = "font-medium rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:ring-opacity-50 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
    
    let variantStyle = "";
    switch(variant) {
        case 'default': // Primary button for Gemini-like UI will use --accent-primary-light (blue)
            variantStyle = "bg-[var(--accent-primary-light)] hover:brightness-95 active:brightness-90 text-white"; 
            break;
        case 'outline': // Secondary button
            variantStyle = "bg-transparent border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"; // Use --bg-tertiary for hover on outline
            break;
        case 'ghost':
            variantStyle = "bg-transparent text-[var(--text-primary)] hover:bg-[var(--border)] active:bg-[var(--border)]"; // For less prominent actions
            break;
        case 'destructive':
            variantStyle = "bg-[var(--error)] hover:brightness-95 active:brightness-90 text-white";
            break;
        case 'link':
            variantStyle = "bg-transparent text-[var(--accent-primary-light)] hover:underline";
            break;
    }

    // Sizes based on Gemini-like UI (usually slightly smaller padding)
    let sizeStyle = "px-3 py-2 text-sm"; // Default
    if (size === "sm") sizeStyle = "px-2.5 py-1.5 text-xs"; 
    if (size === "lg") sizeStyle = "px-4 py-2 text-base"; 
    if (size === "icon") sizeStyle = "p-2"; 

    if (variant === 'link' && size === 'default') sizeStyle = "p-0";


    const finalClassName = `${baseStyle} ${variantStyle} ${sizeStyle} ${className || ''}`;
    return <button className={finalClassName.trim()} {...props}>{children}</button>;
};
