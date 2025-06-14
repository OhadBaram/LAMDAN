
import React from 'react';
import { Button, ButtonProps } from './Button'; 

export interface AlertDialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export interface AlertDialogContentProps extends React.HTMLAttributes<HTMLDivElement> { children: React.ReactNode; className?: string; }
export interface AlertDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> { children: React.ReactNode; }
export interface AlertDialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> { children: React.ReactNode; className?: string; }
export interface AlertDialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> { children: React.ReactNode; className?: string; }
export interface AlertDialogFooterProps extends React.HTMLAttributes<HTMLDivElement> { children: React.ReactNode; }
export interface AlertDialogCancelProps extends ButtonProps {}
export interface AlertDialogActionProps extends ButtonProps {}

export const AlertDialog: React.FC<AlertDialogProps> = ({ children, open, onOpenChange }) => open ? <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm"><div onClick={(e) => e.stopPropagation()}>{children}</div></div> : null;
export const AlertDialogContent: React.FC<AlertDialogContentProps> = ({ children, className, ...props }) => <div className={`bg-[var(--bg-secondary)] rounded-lg shadow-xl w-full max-w-md border border-[var(--border)] ${className || ''}`} {...props}>{children}</div>;
export const AlertDialogHeader: React.FC<AlertDialogHeaderProps> = ({ children, ...props }) => <div className="p-4" {...props}>{children}</div>;
export const AlertDialogTitle: React.FC<AlertDialogTitleProps> = ({ children, className, ...props }) => <h2 className={`text-lg font-medium text-[var(--text-primary)] ${className || ''}`} {...props}>{children}</h2>;
export const AlertDialogDescription: React.FC<AlertDialogDescriptionProps> = ({ children, className, ...props }) => <p className={`text-sm text-[var(--text-secondary)] mt-2 ${className || ''}`} {...props}>{children}</p>;
export const AlertDialogFooter: React.FC<AlertDialogFooterProps> = ({ children, ...props }) => <div className="p-4 bg-[var(--bg-primary)] flex justify-end gap-2 rounded-b-lg border-t border-[var(--border)]" {...props}>{children}</div>;
export const AlertDialogCancel: React.FC<AlertDialogCancelProps> = ({ children, ...props }) => <Button variant="outline" {...props}>{children}</Button>;
export const AlertDialogAction: React.FC<AlertDialogActionProps> = ({ children, ...props }) => <Button variant="destructive" {...props}>{children}</Button>;
