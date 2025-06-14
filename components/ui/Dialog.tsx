
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
    let sizeClass = "max-w-lg";
    if (size === "sm") sizeClass = "max-w-sm";
    if (size === "lg") sizeClass = "max-w-2xl";
    if (size === "xl") sizeClass = "max-w-4xl";
    if (size === "full") sizeClass = "max-w-full h-full";

    return (
        <div
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            aria-modal="true"
            role="dialog"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full ${sizeClass} flex flex-col max-h-[90vh]`}
            >
                {children}
            </div>
        </div>
    );
};
export const DialogContent: React.FC<DialogContentProps> = ({ children, className, ...props }) => <div className={`overflow-y-auto ${className || ''}`} {...props}>{children}</div>;
export const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className, ...props }) => <div className={`p-6 border-b border-gray-200 dark:border-gray-700 ${className || ''}`} {...props}>{children}</div>;
export const DialogTitle: React.FC<DialogTitleProps> = ({ children, className, ...props }) => <h2 className={`text-xl font-bold text-gray-900 dark:text-white ${className || ''}`} {...props}>{children}</h2>;
export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children, className, ...props }) => <p className={`text-sm text-gray-500 dark:text-gray-400 mt-1 ${className || ''}`} {...props}>{children}</p>;
export const DialogFooter: React.FC<DialogFooterProps> = ({ children, className, ...props }) => <div className={`p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3 rounded-b-lg border-t border-gray-200 dark:border-gray-700 ${className || ''}`} {...props}>{children}</div>;
