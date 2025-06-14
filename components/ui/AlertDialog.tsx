
import React from 'react';
import { Button, ButtonProps } from './Button'; // Assuming Button is in the same directory or adjust path

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

export const AlertDialog: React.FC<AlertDialogProps> = ({ children, open, onOpenChange }) => open ? <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4"><div onClick={(e) => e.stopPropagation()}>{children}</div></div> : null;
export const AlertDialogContent: React.FC<AlertDialogContentProps> = ({ children, className, ...props }) => <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md ${className || ''}`} {...props}>{children}</div>;
export const AlertDialogHeader: React.FC<AlertDialogHeaderProps> = ({ children, ...props }) => <div className="p-6" {...props}>{children}</div>;
export const AlertDialogTitle: React.FC<AlertDialogTitleProps> = ({ children, className, ...props }) => <h2 className={`text-lg font-bold ${className || ''}`} {...props}>{children}</h2>;
export const AlertDialogDescription: React.FC<AlertDialogDescriptionProps> = ({ children, className, ...props }) => <p className={`text-sm text-gray-500 mt-2 ${className || ''}`} {...props}>{children}</p>;
export const AlertDialogFooter: React.FC<AlertDialogFooterProps> = ({ children, ...props }) => <div className="p-4 flex justify-end gap-2" {...props}>{children}</div>;
export const AlertDialogCancel: React.FC<AlertDialogCancelProps> = ({ children, ...props }) => <Button variant="outline" {...props}>{children}</Button>;
export const AlertDialogAction: React.FC<AlertDialogActionProps> = ({ children, ...props }) => <Button variant="destructive" className="bg-red-600 text-white" {...props}>{children}</Button>;
