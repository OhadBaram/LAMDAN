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

export const Tabs: React.FC<TabsProps> = ({ children, value, onValueChange, className }) => (
  <div className={className}>
    {React.Children.map(children, child =>
      React.isValidElement(child)
        ? React.cloneElement(child as React.ReactElement<any>, { activeTab: value, setActiveTab: onValueChange })
        : child
    )}
  </div>
);

export const TabsList: React.FC<TabsListProps> = ({ children, className, activeTab, setActiveTab }) => (
  <div
    className={`flex border-b-0 rounded-lg p-1 bg-[#4CAF50] ${className || ''}`}
    style={{
      backgroundColor: "#4CAF50",
      borderRadius: "12px",
      padding: "4px 4px",
      display: "flex",
      gap: "8px",
    }}
  >
    {React.Children.map(children, child =>
      React.isValidElement(child)
        ? React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab })
        : child
    )}
  </div>
);

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  children, value, activeTab, setActiveTab, className, ...props
}) => (
  <button
    onClick={() => setActiveTab && setActiveTab(value)}
    className={`
      px-5 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#388E3C] focus:z-10
      rounded-lg
      ${activeTab === value
        ? 'bg-white text-[#4CAF50] shadow font-bold'
        : 'bg-white text-[#388E3C] opacity-80 hover:opacity-100'}
      ${className || ''}
    `}
    style={{
      border: "none",
      borderRadius: "8px",
      backgroundColor: "white",
      margin: "0 2px"
    }}
    {...props}
  >
    {children}
  </button>
);

export const TabsContent: React.FC<TabsContentProps> = ({ children, value, activeTab, className }) =>
  activeTab === value ? <div className={`pt-4 ${className || ''}`}>{children}</div> : null;
