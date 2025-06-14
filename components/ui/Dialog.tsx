import React from 'react';

export interface DialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}
export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> { children: React.ReactNode; className?: string; }
export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> { children: React.ReactNode; className?: string; }
export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> { children: React.ReactNode; className?: string; }
export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> { children: React.ReactNode; className?: string; }
export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> { children: React.ReactNode; className?: string; }

export const Dialog: React.FC<DialogProps> = ({ children, open, onOpenChange, size = "md" }) => {
    if (!open) return null;
    let sizeClass = "max-w-lg"; // md
    if (size === "sm") sizeClass = "max-w-sm";
    if (size === "lg") sizeClass = "max-w-2xl"; 
    if (size === "xl") sizeClass = "max-w-4xl"; 
    if (size === "full") sizeClass = "max-w-full h-full";

    return (
        <div
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-md" // Increased backdrop opacity and blur
            aria-modal="true"
            role="dialog"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full ${sizeClass} flex flex-col max-h-[90vh] overflow-hidden`} // rounded-xl to rounded-2xl
            >
                {children}
            </div>
        </div>
    );
};
export const DialogContent: React.FC<DialogContentProps> = ({ children, className, ...props }) => <div className={`flex-1 overflow-y-auto ${className || ''}`} {...props}>{children}</div>;
export const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className, ...props }) => <div className={`p-6 border-b border-slate-200 dark:border-slate-700 ${className || ''}`} {...props}>{children}</div>;
export const DialogTitle: React.FC<DialogTitleProps> = ({ children, className, ...props }) => <h2 className={`text-xl font-semibold text-slate-800 dark:text-slate-100 ${className || ''}`} {...props}>{children}</h2>;
export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children, className, ...props }) => <p className={`text-sm text-slate-500 dark:text-slate-400 mt-1 ${className || ''}`} {...props}>{children}</p>;
export const DialogFooter: React.FC<DialogFooterProps> = ({ children, className, ...props }) => <div className={`p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/60 flex justify-end gap-3 rounded-b-2xl border-t border-slate-200 dark:border-slate-700 ${className || ''}`} {...props}>{children}</div>; // rounded-b-xl to rounded-b-2xl