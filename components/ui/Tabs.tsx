
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
export const TabsList: React.FC<TabsListProps> = ({ children, className, activeTab, setActiveTab }) => <div className={`flex border-b border-gray-200 dark:border-gray-700 ${className || ''}`}>{React.Children.map(children, child => React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab }) : child)}</div>;
export const TabsTrigger: React.FC<TabsTriggerProps> = ({ children, value, activeTab, setActiveTab, className, ...props }) => <button onClick={() => setActiveTab && setActiveTab(value)} className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800 ${activeTab === value ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'} ${className || ''}`} {...props}>{children}</button>;
export const TabsContent: React.FC<TabsContentProps> = ({ children, value, activeTab, className }) => activeTab === value ? <div className={`pt-6 ${className || ''}`}>{children}</div> : null;
