
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

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => <div className={`border border-[var(--border)] rounded-lg shadow-sm bg-[var(--bg-secondary)] ${className || ''}`} {...props}>{children}</div>;
export const CardHeader: React.FC<CardHeaderProps> = ({ children, className, ...props }) => <div className={`p-4 border-b border-[var(--border)] ${className || ''}`} {...props}>{children}</div>; // p-4 for 16px
export const CardTitle: React.FC<CardTitleProps> = ({ children, className, ...props }) => <h3 className={`font-medium text-lg text-[var(--text-primary)] ${className || ''}`} {...props}>{children}</h3>; // text-lg for H3 is 18px (default), font-medium for 500 weight
export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className, ...props }) => <p className={`text-sm text-[var(--text-secondary)] ${className || ''}`} {...props}>{children}</p>;
export const CardContent: React.FC<CardContentProps> = ({ children, className, ...props }) => <div className={`p-4 ${className || ''}`} {...props}>{children}</div>; // p-4 for 16px
export const CardFooter: React.FC<CardFooterProps> = ({ children, className, ...props }) => <div className={`p-4 bg-[var(--bg-primary)] border-t border-[var(--border)] flex justify-between items-center rounded-b-lg ${className || ''}`} {...props}>{children}</div>;
