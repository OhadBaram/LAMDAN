
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

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => <div className={`border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 ${className || ''}`} {...props}>{children}</div>;
export const CardHeader: React.FC<CardHeaderProps> = ({ children, className, ...props }) => <div className={`p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 ${className || ''}`} {...props}>{children}</div>;
export const CardTitle: React.FC<CardTitleProps> = ({ children, className, ...props }) => <h3 className={`font-bold text-lg text-gray-900 dark:text-white ${className || ''}`} {...props}>{children}</h3>;
export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className, ...props }) => <p className={`text-sm text-gray-500 dark:text-gray-400 ${className || ''}`} {...props}>{children}</p>;
export const CardContent: React.FC<CardContentProps> = ({ children, className, ...props }) => <div className={`p-4 sm:p-6 ${className || ''}`} {...props}>{children}</div>;
export const CardFooter: React.FC<CardFooterProps> = ({ children, className, ...props }) => <div className={`p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center ${className || ''}`} {...props}>{children}</div>;
