
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
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" // backdrop-blur-sm for subtle blur
            aria-modal="true"
            role="dialog"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`bg-[var(--bg-secondary)] rounded-lg shadow-xl w-full ${sizeClass} flex flex-col max-h-[90vh] overflow-hidden border border-[var(--border)]`}
            >
                {children}
            </div>
        </div>
    );
};
export const DialogContent: React.FC<DialogContentProps> = ({ children, className, ...props }) => <div className={`flex-1 overflow-y-auto ${className || ''}`} {...props}>{children}</div>; // Removed default padding, handle in specific dialog content
export const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className, ...props }) => <div className={`p-4 border-b border-[var(--border)] ${className || ''}`} {...props}>{children}</div>;
export const DialogTitle: React.FC<DialogTitleProps> = ({ children, className, ...props }) => <h2 className={`text-lg font-medium text-[var(--text-primary)] ${className || ''}`} {...props}>{children}</h2>; // H3 equivalent text-lg font-medium
export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children, className, ...props }) => <p className={`text-sm text-[var(--text-secondary)] mt-1 ${className || ''}`} {...props}>{children}</p>;
export const DialogFooter: React.FC<DialogFooterProps> = ({ children, className, ...props }) => <div className={`p-4 bg-[var(--bg-primary)] flex justify-end gap-2 rounded-b-lg border-t border-[var(--border)] ${className || ''}`} {...props}>{children}</div>;
