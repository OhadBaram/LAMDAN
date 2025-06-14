import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode;
    className?: string;
}
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children: React.ReactNode;
    className?: string;
}
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => <div className={`border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg bg-white dark:bg-slate-800 ${className || ''}`} {...props}>{children}</div>;
export const CardHeader: React.FC<CardHeaderProps> = ({ children, className, ...props }) => <div className={`p-5 sm:p-6 border-b border-slate-200 dark:border-slate-700 ${className || ''}`} {...props}>{children}</div>;
export const CardTitle: React.FC<CardTitleProps> = ({ children, className, ...props }) => <h3 className={`font-semibold text-lg text-slate-800 dark:text-slate-100 ${className || ''}`} {...props}>{children}</h3>;
export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className, ...props }) => <p className={`text-sm text-slate-500 dark:text-slate-400 ${className || ''}`} {...props}>{children}</p>;
export const CardContent: React.FC<CardContentProps> = ({ children, className, ...props }) => <div className={`p-5 sm:p-6 ${className || ''}`} {...props}>{children}</div>;
export const CardFooter: React.FC<CardFooterProps> = ({ children, className, ...props }) => <div className={`p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center rounded-b-xl ${className || ''}`} {...props}>{children}</div>;