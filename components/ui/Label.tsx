
import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

export const Label: React.FC<LabelProps> = ({ children, className, ...props }) => <label className={`block text-sm font-medium mb-1 ${className || ''}`} {...props}>{children}</label>;
