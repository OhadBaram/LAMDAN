
import React from 'react';

export interface TabsProps {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}
export interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  activeTab?: string; // Injected by Tabs
  setActiveTab?: (value: string) => void; // Injected by Tabs
}
export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  value: string;
  activeTab?: string; // Injected by TabsList
  setActiveTab?: (value: string) => void; // Injected by TabsList
  className?: string;
}
export interface TabsContentProps {
  children: React.ReactNode;
  value: string;
  activeTab?: string; // Injected by Tabs
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ children, value, onValueChange, className }) => <div className={className}>{React.Children.map(children, child => React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, { activeTab: value, setActiveTab: onValueChange }) : child)}</div>;

export const TabsList: React.FC<TabsListProps> = ({ children, className, activeTab, setActiveTab }) => <div className={`flex border-b border-[var(--border)] ${className || ''}`}>{React.Children.map(children, child => React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab }) : child)}</div>;

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ children, value, activeTab, setActiveTab, className, ...props }) => (
    <button 
        onClick={() => setActiveTab && setActiveTab(value)} 
        className={`px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:z-10 
                    ${activeTab === value 
                        ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' 
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-b-2 border-transparent hover:border-[var(--border)]'} 
                    ${className || ''}`} 
        {...props}
    >
        {children}
    </button>
);

export const TabsContent: React.FC<TabsContentProps> = ({ children, value, activeTab, className }) => activeTab === value ? <div className={`pt-4 ${className || ''}`}>{children}</div> : null; // pt-4 (16px)
